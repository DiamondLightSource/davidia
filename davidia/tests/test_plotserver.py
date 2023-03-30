import before_after
import time

import datetime
import numpy as np
import pytest

from collections import defaultdict
from multiprocessing import Lock
from unittest.mock import AsyncMock, Mock
from queue import Queue

from davidia.models.messages import (
    AppendLineDataMessage,
    DataMessage,
    LineData,
    MultiLineDataMessage,
    PlotMessage,
    PlotState,
    StatusType,
    TableData,
    TableDataMessage,
)

from davidia.models.parameters import AxesParameters
from davidia.server.fastapi_utils import ws_pack, ws_unpack
from davidia.server.plotserver import (
    PlotClient,
    PlotServer,
    add_indices,
    convert_append_to_multi_line_data_message,
)

from .test_api import nppd_assert_equal


def test_initialise_plotserver():
    ps = PlotServer()
    assert ps.client_status == StatusType.busy
    assert ps._clients == {}
    assert ps.plot_states == {}
    assert ps.client_total == 0
    assert not ps.clients_available()


@pytest.mark.asyncio  # @UndefinedVariable
async def test_send_points():
    ps = PlotServer()

    assert ps.client_status == StatusType.busy
    assert not ps.clients_available()
    assert ps.plot_states == {}

    x = [i for i in range(50)]
    y = [j % 10 for j in x]
    time_id = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    new_line = PlotMessage(
        plot_id="plot_0",
        type="new_multiline_data",
        params=[{"key": time_id, "colour": "purple", "x": x, "y": y, "line_on": True}],
    )

    processed_line = ps.processor.process(new_line)
    line_as_dict = processed_line.dict()

    msg = ws_pack(line_as_dict)
    ps.plot_states["plot_0"].current_data = line_as_dict
    ps.plot_states["plot_0"].new_data_message = msg
    assert not ps.clients_available()

    assert ps.client_status == StatusType.busy
    assert ps.plot_states["plot_0"].current_data == line_as_dict
    assert ps.plot_states["plot_0"].new_data_message == msg
    assert not ps.clients_available()

    await ps.send_next_message()

    assert ps.client_status == StatusType.busy
    assert ps.plot_states["plot_0"].current_data == line_as_dict
    assert ps.plot_states["plot_0"].new_data_message == msg
    assert not ps.clients_available()

    unpacked_msg = ws_unpack(msg)
    nppd_assert_equal(line_as_dict, unpacked_msg)


@pytest.mark.parametrize(
    "name,key,x,default_indices",
    [
        ("zero_x", "100", np.array([]), True),
        ("x_and_y", "101", np.array([0, 2]), False),
    ],
)
def test_line_data_initialization(name, key: str, x: list, default_indices: bool):
    a = LineData(
        key=key,
        x=np.array(x),
        y=np.array([4, 2]),
        colour="blue",
        line_on=True,
        point_size=None,
    )
    assert a.default_indices == default_indices


def line_data_are_equal(a: LineData, b: LineData) -> bool:
    return (
        a.key == b.key
        and a.colour == b.colour
        and a.line_on == b.line_on
        and a.point_size == b.point_size
        and a.default_indices == b.default_indices
        and np.array_equal(a.x, b.x)
        and np.array_equal(a.y, b.y)
    )


def assert_line_data_messages_are_equal(
    a: MultiLineDataMessage | AppendLineDataMessage,
    b: MultiLineDataMessage | AppendLineDataMessage,
):
    assert a.axes_parameters == b.axes_parameters
    if isinstance(a, MultiLineDataMessage) and isinstance(b, MultiLineDataMessage):
        assert len(a.ml_data) == len(b.ml_data)
        assert all([line_data_are_equal(c, d) for c, d in zip(a.ml_data, b.ml_data)])
    elif isinstance(a, AppendLineDataMessage) and isinstance(b, AppendLineDataMessage):
        assert len(a.al_data) == len(b.al_data)
        assert all([line_data_are_equal(c, d) for c, d in zip(a.al_data, b.al_data)])
    else:
        raise AssertionError(
            f"a and b must both be either MultiLineDataMessage or AppendLineDataMessage: {a}, {b}"
        )


def generate_test_data(key, x=True, default_indices=False, combined=False, high=False):
    if key == "100":
        if combined:
            x_data = [0, 1, 2, 3, 4, 5, 6]
            y_data = [10, 20, 30, 70, 60, 50, 40]
        else:
            x_data = [0, 1, 2]
            y_data = [10, 20, 30]

    if key == "200":
        if combined:
            y_data = [5, 10, 15, 20, 50, 70, 90]
            x_data = [2, 3, 4, 7, 8, 9, 10] if high else [0, 1, 2, 3, 4, 5, 6]
        else:
            y_data = [5, 10, 15]
            x_data = [2, 3, 4] if high else [0, 1, 2]

    if key == "300":
        y_data = [14, 12, 10, 8]
        x_data = [2, 3, 7, 9] if high else [0, 1, 2, 3]

    if key == "010":
        x_data = [3, 4, 5, 6]
        y_data = [70, 60, 50, 40]

    if key == "020":
        x_data = [7, 8, 9, 10] if high else [3, 4, 5, 6]
        y_data = [20, 50, 70, 90]

    if key == "030":
        x_data = [2, 3, 7, 9] if high else [0, 1, 2, 3]
        y_data = [14, 12, 10, 8]

    return LineData(
        key=key,
        x=np.array(x_data) if x else np.array([]),
        y=np.array(y_data),
        default_indices=default_indices,
    )


@pytest.mark.parametrize(
    "name,plot_id,current_data,new_points_msg,expected",
    [
        (
            "equal_length_no_default",
            "plot_0",
            MultiLineDataMessage(
                ml_data=[generate_test_data("100"), generate_test_data("200")]
            ),
            AppendLineDataMessage(
                al_data=[generate_test_data("010"), generate_test_data("020")]
            ),
            (
                MultiLineDataMessage(
                    ml_data=[
                        generate_test_data("100", combined=True),
                        generate_test_data("200", combined=True),
                    ]
                ),
                AppendLineDataMessage(
                    al_data=[generate_test_data("010"), generate_test_data("020")]
                ),
            ),
        ),
        (
            "more_current_data_no_default",
            "plot_0",
            MultiLineDataMessage(
                ml_data=[
                    generate_test_data("100"),
                    generate_test_data("200", x=True, high=True),
                    generate_test_data("300", high=True),
                ]
            ),
            AppendLineDataMessage(
                al_data=[
                    generate_test_data("010"),
                    generate_test_data("020", high=True),
                ]
            ),
            (
                MultiLineDataMessage(
                    ml_data=[
                        generate_test_data("100", combined=True),
                        generate_test_data("200", combined=True, high=True),
                        generate_test_data("300", high=True),
                    ]
                ),
                AppendLineDataMessage(
                    al_data=[
                        generate_test_data("010"),
                        generate_test_data("020", high=True),
                    ]
                ),
            ),
        ),
        (
            "more_append_data_no_default",
            "plot_0",
            MultiLineDataMessage(
                ml_data=[
                    generate_test_data("100"),
                    generate_test_data("200", high=True),
                ]
            ),
            AppendLineDataMessage(
                al_data=[
                    generate_test_data("010"),
                    generate_test_data("020", high=True),
                    generate_test_data("030", high=True),
                ]
            ),
            (
                MultiLineDataMessage(
                    ml_data=[
                        generate_test_data("100", combined=True),
                        generate_test_data("200", combined=True, high=True),
                        generate_test_data("030", high=True),
                    ]
                ),
                AppendLineDataMessage(
                    al_data=[
                        generate_test_data("010"),
                        generate_test_data("020", high=True),
                        generate_test_data("030", high=True),
                    ]
                ),
            ),
        ),
        (
            "equal_length_default_indices",
            "plot_1",
            MultiLineDataMessage(
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("200", default_indices=True),
                ]
            ),
            AppendLineDataMessage(
                al_data=[
                    generate_test_data("010", x=False),
                    generate_test_data("020", high=False),
                ]
            ),
            (
                MultiLineDataMessage(
                    ml_data=[
                        generate_test_data("100", default_indices=True, combined=True),
                        generate_test_data("200", default_indices=True, combined=True),
                    ]
                ),
                AppendLineDataMessage(
                    al_data=[
                        generate_test_data("010", default_indices=True),
                        generate_test_data("020", default_indices=True),
                    ]
                ),
            ),
        ),
        (
            "more_current_data_default_indices",
            "plot_0",
            MultiLineDataMessage(
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("200", default_indices=True),
                    generate_test_data("300", default_indices=True),
                ]
            ),
            AppendLineDataMessage(
                al_data=[
                    generate_test_data("010", x=False),
                    generate_test_data("020", x=False),
                ]
            ),
            (
                MultiLineDataMessage(
                    ml_data=[
                        generate_test_data("100", default_indices=True, combined=True),
                        generate_test_data("200", default_indices=True, combined=True),
                        generate_test_data("300", default_indices=True),
                    ]
                ),
                AppendLineDataMessage(
                    al_data=[
                        generate_test_data("010", default_indices=True),
                        generate_test_data("020", default_indices=True),
                    ]
                ),
            ),
        ),
        (
            "more_current_data_default_indices_some_indices_given",
            "plot_0",
            MultiLineDataMessage(
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("200", default_indices=True),
                    generate_test_data("300", default_indices=True),
                ]
            ),
            AppendLineDataMessage(
                al_data=[
                    generate_test_data("010", x=False),
                    generate_test_data("020", high=True),
                ]
            ),
            (
                MultiLineDataMessage(
                    ml_data=[
                        generate_test_data("100", default_indices=True, combined=True),
                        generate_test_data("200", default_indices=True, combined=True),
                        generate_test_data("300", default_indices=True),
                    ]
                ),
                AppendLineDataMessage(
                    al_data=[
                        generate_test_data("010", default_indices=True),
                        generate_test_data("020", default_indices=True),
                    ]
                ),
            ),
        ),
        (
            "more_append_data_default_indices_indices_given",
            "plot_0",
            MultiLineDataMessage(
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("200", default_indices=True),
                ]
            ),
            AppendLineDataMessage(
                al_data=[
                    generate_test_data("010"),
                    generate_test_data("020", high=True),
                    generate_test_data("030", high=True),
                ]
            ),
            (
                MultiLineDataMessage(
                    ml_data=[
                        generate_test_data("100", default_indices=True, combined=True),
                        generate_test_data("200", default_indices=True, combined=True),
                        generate_test_data("030", default_indices=True),
                    ]
                ),
                AppendLineDataMessage(
                    al_data=[
                        generate_test_data("010", default_indices=True),
                        generate_test_data("020", default_indices=True),
                        generate_test_data("030", default_indices=True),
                    ]
                ),
            ),
        ),
        (
            "more_append_data_default_indices",
            "plot_0",
            MultiLineDataMessage(
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("200", default_indices=True),
                ]
            ),
            AppendLineDataMessage(
                al_data=[
                    generate_test_data("010", x=False),
                    generate_test_data("020", x=False),
                    generate_test_data("030", x=False),
                ]
            ),
            (
                MultiLineDataMessage(
                    ml_data=[
                        generate_test_data("100", default_indices=True, combined=True),
                        generate_test_data("200", default_indices=True, combined=True),
                        generate_test_data("030", default_indices=True),
                    ]
                ),
                AppendLineDataMessage(
                    al_data=[
                        generate_test_data("010", default_indices=True),
                        generate_test_data("020", default_indices=True),
                        generate_test_data("030", default_indices=True),
                    ]
                ),
            ),
        ),
    ],
)
def test_combine_line_messages(
    name: str,
    plot_id: str,
    current_data: DataMessage,
    new_points_msg: AppendLineDataMessage,
    expected: tuple[MultiLineDataMessage, AppendLineDataMessage],
):
    ps = PlotServer()
    ps.plot_states[plot_id].current_data = current_data
    ml_msg, al_msg = ps.combine_line_messages(plot_id, new_points_msg)
    assert_line_data_messages_are_equal(ml_msg, expected[0])
    assert_line_data_messages_are_equal(al_msg, expected[1])


@pytest.mark.asyncio
async def test_add_and_remove_clients(caplog):
    websocket_0 = Mock()
    ps = PlotServer()
    data_0 = {"a": 10, "b": 20}
    selection_0 = {"selection0": 30}

    msg_00 = ws_pack(data_0)
    msg_01 = ws_pack(selection_0)

    ps.plot_states["plot_0"].new_data_message = msg_00
    ps.plot_states["plot_0"].new_selections_message = msg_01
    ps.plot_states["plot_0"].current_data = data_0
    ps.plot_states["plot_0"].current_selections = selection_0

    def update_plot_state(pc, bytes):
        time.sleep(2)
        if not ps.plot_states["plot_0"].lock.locked():
            ps.plot_states["plot_0"].clear()

    assert ps.client_total == 0
    assert ps._clients == {}

    with before_after.after(
        "davidia.server.plotserver.PlotClient.add_message", update_plot_state
    ):
        pc_0 = await ps.add_client("plot_0", websocket_0)

    assert pc_0.name == "plot_0:0"
    assert pc_0.websocket == websocket_0
    assert pc_0.queue.qsize() == 2  # do not use queue.empty()
    assert ps.client_total == 1
    assert ps._clients["plot_0"] == [pc_0]

    ps.plot_states["plot_0"] = PlotState(msg_00, None, data_0, None)
    websocket_1 = Mock()
    pc_1 = await ps.add_client("plot_0", websocket_1)

    assert pc_1.name == "plot_0:1"
    assert pc_1.websocket == websocket_1
    assert pc_1.queue.qsize() == 1
    assert ps.client_total == 2
    assert ps._clients["plot_0"] == [pc_0, pc_1]

    ps.remove_client("plot_0", pc_0)

    assert ps._clients == defaultdict(list, {"plot_0": [pc_1]})

    ps.remove_client("plot_0", pc_0)
    assert ps._clients == defaultdict(list, {"plot_0": [pc_1]})
    assert "Client plot_0:0 does not exist for plot_0" in caplog.text


def test_get_plot_ids():
    ps = PlotServer()

    assert ps.get_plot_ids() == []

    ps._clients["plot_0"].append("0")
    ps._clients["plot_1"].append("1")

    assert ps.get_plot_ids() == ["plot_0", "plot_1"]


def test_clients_available():
    ps = PlotServer()

    assert not ps.clients_available()

    ps._clients["plot_0"].append("0")
    ps._clients["plot_1"].append("1")

    assert ps.clients_available()


@pytest.mark.asyncio
async def test_clear_queues():
    ps = PlotServer()
    websocket_0 = AsyncMock()
    websocket_1 = AsyncMock()

    pc_0 = PlotClient(websocket_0)
    pc_0.name = "plot_client_0"
    pc_1 = PlotClient(websocket_1)
    pc_1.name = "plot_client_1"

    ps.client_total = 2
    ps._clients["plot_0"].append(pc_0)
    ps._clients["plot_1"].append(pc_1)

    data_0 = {"a": 10, "b": 20}
    selection_0 = {"selection0": 30}
    data_1 = {"e": 50, "f": 60}

    msg_00 = ws_pack(data_0)
    msg_01 = ws_pack(selection_0)
    msg_10 = ws_pack(data_1)

    ps.plot_states["plot_0"] = PlotState(msg_00, msg_01, data_0, selection_0)
    ps.plot_states["plot_1"] = PlotState(msg_10, None, data_1, None)

    await pc_0.queue.put(msg_00)
    await pc_0.queue.put(msg_01)
    await pc_1.queue.put(msg_10)

    assert ps.plot_states["plot_0"].new_data_message == msg_00
    assert ps.plot_states["plot_0"].new_selections_message == msg_01
    assert ps.plot_states["plot_0"].current_data == data_0
    assert ps.plot_states["plot_0"].current_selections == selection_0

    assert ps.plot_states["plot_1"].new_data_message == msg_10
    assert ps.plot_states["plot_1"].new_selections_message is None
    assert ps.plot_states["plot_1"].current_data == data_1
    assert ps.plot_states["plot_1"].current_selections is None

    assert pc_0.queue.qsize() != 0
    assert pc_1.queue.qsize() != 0

    await ps.clear_queues("plot_0")

    assert ps.plot_states["plot_0"].new_data_message is None
    assert ps.plot_states["plot_0"].new_selections_message is None
    assert ps.plot_states["plot_0"].current_data is None
    assert ps.plot_states["plot_0"].current_selections is None

    assert ps.plot_states["plot_1"].new_data_message == msg_10
    assert ps.plot_states["plot_1"].new_selections_message is None
    assert ps.plot_states["plot_1"].current_data == data_1
    assert ps.plot_states["plot_1"].current_selections is None

    assert pc_0.queue.qsize() == 0
    assert pc_1.queue.qsize() != 0


@pytest.mark.asyncio
async def test_clear_plot_states():
    data_1 = {"e": 50, "f": 60}
    msg_10 = ws_pack(data_1)
    ps = PlotServer()
    ps.plot_states["plot_1"] = PlotState(msg_10, None, data_1, None)

    def add_current_data():
        if not ps.plot_states["plot_1"].lock.locked():
            ps.plot_states["plot_1"].current_data = {"a": 10, "b": 20}

    with before_after.after("multiprocessing.Lock", add_current_data):
        await ps.clear_plot_states("plot_1")

    assert ps.plot_states["plot_1"].current_data is None


@pytest.mark.asyncio
async def test_prepare_data():
    ps = PlotServer()
    websocket_0 = AsyncMock()
    pc_0 = PlotClient(websocket_0)
    pc_0.name = "plot_client_0"
    ps.client_total = 1
    ps._clients["plot_0"].append(pc_0)
    data_0 = MultiLineDataMessage(
        ml_data=[LineData(key="", x=np.array([0, 1, 2]), y=np.array([0, 30, 20]))]
    )
    selection_0 = {"selection0": 30}
    msg_00 = ws_pack(data_0)
    msg_01 = ws_pack(selection_0)
    append_line = PlotMessage(
        plot_id="plot_0",
        type="append_line_data",
        params=[
            {
                "key": "",
                "colour": "purple",
                "x": np.array([3, 4, 5]),
                "y": np.array([10, 20, 30]),
                "line_on": True,
            }
        ],
    )

    ps.plot_states["plot_0"] = PlotState(msg_00, msg_01, data_0, selection_0)

    assert ps.plot_states["plot_0"].new_data_message == msg_00
    assert ps.plot_states["plot_0"].new_selections_message == msg_01
    assert ps.plot_states["plot_0"].current_data == data_0
    assert ps.plot_states["plot_0"].current_selections == selection_0

    def change_plot_states(plotserver, plot_id, new_points_msg):
        if not ps.plot_states["plot_0"].lock.locked():
            ta_msg = TableDataMessage(
                ta_data=TableData(
                    key="", dataArray=np.array([[1, 2], [3, 4]]), cellWidth=120
                )
            )
            plotserver.plot_states["plot_0"].current_data = ta_msg

    with before_after.after(
        "davidia.server.plotserver.PlotServer.combine_line_messages", change_plot_states
    ):
        await ps.prepare_data(append_line)
        assert isinstance(ps.plot_states["plot_0"].current_data, MultiLineDataMessage)


@pytest.mark.parametrize(
    "name,msg,expected",
    [
        (
            "no_default_indices",
            MultiLineDataMessage(
                axes_parameters=AxesParameters(),
                ml_data=[generate_test_data("100"), generate_test_data("200")],
            ),
            MultiLineDataMessage(
                axes_parameters=AxesParameters(),
                ml_data=[generate_test_data("100"), generate_test_data("200")],
            ),
        ),
        (
            "default_indices",
            MultiLineDataMessage(
                axes_parameters=AxesParameters(),
                ml_data=[
                    generate_test_data("100", x=False),
                    generate_test_data("030", x=False),
                ],
            ),
            MultiLineDataMessage(
                axes_parameters=AxesParameters(),
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("030", default_indices=True),
                ],
            ),
        ),
    ],
)
def test_add_indices(name, msg: MultiLineDataMessage, expected: MultiLineDataMessage):
    message = add_indices(msg)

    assert_line_data_messages_are_equal(message, expected)


@pytest.mark.parametrize(
    "name,msg,expected",
    [
        (
            "no_default_indices",
            AppendLineDataMessage(
                axes_parameters=AxesParameters(),
                al_data=[generate_test_data("100"), generate_test_data("200")],
            ),
            MultiLineDataMessage(
                axes_parameters=AxesParameters(),
                ml_data=[generate_test_data("100"), generate_test_data("200")],
            ),
        ),
        (
            "all_default_indices",
            AppendLineDataMessage(
                axes_parameters=AxesParameters(),
                al_data=[
                    generate_test_data("100", x=False),
                    generate_test_data("030", x=False),
                ],
            ),
            MultiLineDataMessage(
                axes_parameters=AxesParameters(),
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("030", default_indices=True),
                ],
            ),
        ),
        (
            "some_default_indices",
            AppendLineDataMessage(
                axes_parameters=AxesParameters(),
                al_data=[generate_test_data("100"), generate_test_data("030", x=False)],
            ),
            MultiLineDataMessage(
                axes_parameters=AxesParameters(),
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("030", default_indices=True),
                ],
            ),
        ),
    ],
)
def test_convert_append_to_multi_line_data_message(
    name, msg: AppendLineDataMessage, expected: MultiLineDataMessage
):
    message = convert_append_to_multi_line_data_message(msg)

    assert_line_data_messages_are_equal(message, expected)
