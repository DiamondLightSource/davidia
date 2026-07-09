import datetime
import logging
import time
from collections import defaultdict
from unittest.mock import AsyncMock, Mock

import before_after
import numpy as np
import pytest

from davidia.models.messages import (
    ClearSelectionsMessage,
    LineData,
    LineParams,
    MultiLineMessage,
    SelectionsMessage,
    StatusType,
    TableData,
    TableMessage,
)
from davidia.models.selections import LinearSelection, RectangularSelection
from davidia.server.fastapi_utils import ws_pack, ws_unpack
from davidia.server.plotserver import (
    PlotClient,
    PlotServer,
    PlotState,
)

from .test_api import nppd_assert_equal


@pytest.fixture(autouse=True)
def no_error_logging(request, caplog):
    yield
    if "expect_caplog_errors" in request.keywords:
        return
    errors = [
        record
        for record in caplog.get_records("call")
        if record.levelno >= logging.ERROR
    ]
    assert not errors


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

    plot_state_0 = ps.plot_states["plot_0"]
    x = np.array([i for i in range(50)])
    y = np.array([j % 10 for j in x])
    time_id = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    new_line = MultiLineMessage(
        plot_id="plot_0",
        ml_data=[
            LineData(key=time_id, x=x, y=y, line_params=LineParams(colour="purple"))
        ],
    )

    await ps.update(new_line)
    processed_line = new_line
    line_as_dict = processed_line.model_dump(by_alias=True)

    msg = ws_pack(line_as_dict)
    assert msg is not None
    plot_state_0.current_data = line_as_dict  # pyrefly: ignore[bad-argument-type]
    plot_state_0.new_data_message = msg
    assert not ps.clients_available()

    assert ps.client_status == StatusType.busy
    assert plot_state_0.current_data == line_as_dict
    assert plot_state_0.new_data_message == msg
    assert not ps.clients_available()

    await ps.send_next_message()

    assert ps.client_status == StatusType.busy
    assert plot_state_0.current_data == line_as_dict
    assert plot_state_0.new_data_message == msg
    assert not ps.clients_available()

    unpacked_msg = ws_unpack(msg)
    nppd_assert_equal(line_as_dict, unpacked_msg)


@pytest.mark.expect_caplog_errors
@pytest.mark.asyncio
async def test_add_and_remove_clients(caplog):
    websocket_0 = Mock()
    ps = PlotServer()

    data_0 = {"a": 10, "b": 20}
    selection_0 = {"selection0": 30}
    msg_00 = ws_pack(data_0)
    msg_01 = ws_pack(selection_0)

    plot_state_0 = ps.plot_states["plot_0"]
    plot_state_0.new_data_message = msg_00
    plot_state_0.new_selections_message = msg_01
    plot_state_0.current_data = data_0  # pyrefly: ignore[bad-argument-type]
    plot_state_0.current_selections = selection_0  # pyrefly: ignore[bad-argument-type]

    def update_plot_state(pc, bytes):
        time.sleep(2)
        if not plot_state_0.lock.locked():
            plot_state_0.clear()

    assert ps.client_total == 0
    assert ps._clients == {}

    with before_after.after(
        "davidia.server.plotserver.PlotClient.add_message", update_plot_state
    ):
        pc_0 = await ps.add_client("plot_0", websocket_0, "7b2ee613")

    assert pc_0.name == "plot_0:0"
    assert pc_0.websocket == websocket_0
    assert pc_0.queue.qsize() == 3  # do not use queue.empty()
    assert ps.client_total == 1
    assert ps._clients["plot_0"] == [pc_0]

    ps.plot_states["plot_0"] = PlotState(msg_00, None, data_0, None)
    websocket_1 = Mock()
    pc_1 = await ps.add_client("plot_0", websocket_1, "743f8791")

    assert pc_1.name == "plot_0:1"
    assert pc_1.websocket == websocket_1
    assert pc_1.queue.qsize() == 2
    assert ps.client_total == 2
    assert ps._clients["plot_0"] == [pc_0, pc_1]

    await ps.remove_client("plot_0", pc_0)
    assert len(caplog.text) == 0
    assert ps._clients == defaultdict(list, {"plot_0": [pc_1]})

    # try to remove unknown client
    await ps.remove_client("plot_0", pc_0)
    assert ps._clients == defaultdict(list, {"plot_0": [pc_1]})
    assert "Client plot_0:0 does not exist for plot_0" in caplog.text
    assert f"Uuid {pc_0.uuid} not in uuids {ps.uuids}" in caplog.text


def test_get_plot_ids():
    ps = PlotServer()

    assert ps.get_plot_ids() == []

    ps._clients["plot_0"].append("0")  # ppyrefly: ignore[bad-argument-type]
    ps._clients["plot_1"].append("1")  # pyrefly: ignore[bad-argument-type]

    assert ps.get_plot_ids() == ["plot_0", "plot_1"]


@pytest.mark.asyncio
async def test_regions():
    regions = [
        LinearSelection(start=(1, -2.5), length=3.2, degrees=30, colour="green"),
        RectangularSelection(
            start=(-4.3, 5.6), lengths=(6, 7.8), degrees=-60, colour="red", alpha=0.2
        ),
    ]
    ps = PlotServer()
    pid = "plot_7"
    await ps.update(
        SelectionsMessage(
            plot_id=pid,
            set_selections=regions,
        )
    )
    new_regions = await ps.get_regions(pid)
    assert len(regions) == len(new_regions)
    for e, a in zip(regions, new_regions):
        assert e == a

    new_region = RectangularSelection(
        start=(4.3, -5.6), lengths=(6, 7.8), degrees=0, colour="orange", alpha=0.7
    )
    await ps.update(
        SelectionsMessage(
            plot_id=pid,
            update=True,
            set_selections=[new_region],
        )
    )
    new_regions = await ps.get_regions(pid)
    expected_regions = list(regions)
    expected_regions.append(new_region)
    assert len(expected_regions) == len(new_regions)
    for e, a in zip(expected_regions, new_regions):
        assert e == a

    update = 2
    updated_region = expected_regions[update]
    updated_region.angle = 123.4
    await ps.update(
        SelectionsMessage(
            plot_id=pid,
            update=True,
            set_selections=[new_region],
        )
    )
    new_regions = await ps.get_regions(pid)
    expected_regions[update].angle = 123.4
    assert len(expected_regions) == len(new_regions)
    for e, a in zip(expected_regions, new_regions):
        assert e == a

    remove = 1
    await ps.update(
        ClearSelectionsMessage(
            plot_id=pid,
            selection_ids=[new_regions[remove].id],
        )
    )
    new_regions = await ps.get_regions(pid)
    expected_regions.pop(remove)
    assert len(expected_regions) == len(new_regions)
    for e, a in zip(expected_regions, new_regions):
        assert e == a

    await ps.update(
        ClearSelectionsMessage(
            plot_id=pid,
            selection_ids=[],
        )
    )
    new_regions = await ps.get_regions(pid)
    assert len(new_regions) == 0


def test_clients_available():
    ps = PlotServer()

    assert not ps.clients_available()

    ps._clients["plot_0"].append("0")  # pyrefly: ignore[bad-argument-type]
    ps._clients["plot_1"].append("1")  # pyrefly: ignore[bad-argument-type]

    assert ps.clients_available()


@pytest.mark.asyncio
async def test_clear_queues():
    ps = PlotServer()
    websocket_0 = AsyncMock()
    websocket_1 = AsyncMock()

    pc_0 = PlotClient(websocket_0, "fc1e5b22")
    pc_0.name = "plot_client_0"
    pc_1 = PlotClient(websocket_1, "fc1e5b22")
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

    plot_state_0 = ps.plot_states["plot_0"]
    plot_state_1 = ps.plot_states["plot_1"]

    await pc_0.queue.put(msg_00)
    await pc_0.queue.put(msg_01)
    await pc_1.queue.put(msg_10)

    assert plot_state_0.new_data_message == msg_00
    assert plot_state_0.new_selections_message == msg_01
    assert plot_state_0.current_data == data_0
    assert plot_state_0.current_selections == selection_0

    assert plot_state_1.new_data_message == msg_10
    assert plot_state_1.new_selections_message is None
    assert plot_state_1.current_data == data_1
    assert plot_state_1.current_selections is None

    assert pc_0.queue.qsize() != 0
    assert pc_1.queue.qsize() != 0

    await ps.clear_queues("plot_0")

    assert plot_state_0.new_data_message is None
    assert plot_state_0.new_selections_message is None
    assert plot_state_0.current_data is None
    assert plot_state_0.current_selections is None

    assert plot_state_1.new_data_message == msg_10
    assert plot_state_1.new_selections_message is None
    assert plot_state_1.current_data == data_1
    assert plot_state_1.current_selections is None

    assert pc_0.queue.qsize() == 0
    assert pc_1.queue.qsize() != 0


@pytest.mark.asyncio
async def test_clear_plot_states():
    data_1 = {"e": 50, "f": 60}
    msg_10 = ws_pack(data_1)
    ps = PlotServer()
    ps.plot_states["plot_1"] = PlotState(msg_10, None, data_1, None)
    plot_state_1 = ps.plot_states["plot_1"]

    def add_current_data(plotserver: PlotServer, plot_id: str):
        if not plot_state_1.lock.locked():
            plot_state_1.current_data = {
                "a": 10,
                "b": 20,
            }  # pyrefly: ignore[bad-argument-type]

    with before_after.after(
        "davidia.server.plotserver.PlotServer.clear_plot_states", add_current_data
    ):
        await ps.clear_queues("plot_1")

    assert plot_state_1.current_data is None


@pytest.mark.asyncio
async def test_update():
    ps = PlotServer()
    websocket_0 = AsyncMock()
    pc_0 = PlotClient(websocket_0, "fc1e5b22")
    pc_0.name = "plot_client_0"
    ps.client_total = 1
    ps._clients["plot_0"].append(pc_0)
    data_0 = MultiLineMessage(
        ml_data=[
            LineData(
                key="",
                line_params=LineParams(),
                x=np.array([0, 1, 2]),
                y=np.array([0, 30, 20]),
            )
        ]
    )
    selection_0 = {"selection0": 30}
    msg_00 = ws_pack(data_0)
    msg_01 = ws_pack(selection_0)
    append_line = MultiLineMessage(
        plot_id="plot_0",
        append=True,
        ml_data=[
            {
                "line_params": LineParams(colour="purple"),
                "x": np.array([3, 4, 5]),
                "y": np.array([10, 20, 30]),
            }
        ],
    )

    plot_state_0 = ps.plot_states["plot_0"]
    plot_state_0 = PlotState(msg_00, msg_01, data_0, selection_0)

    assert plot_state_0.new_data_message == msg_00
    assert plot_state_0.new_selections_message == msg_01
    assert plot_state_0.current_data == data_0
    assert plot_state_0.current_selections == selection_0

    def change_plot_states(plotserver, plot_id, new_points_msg):
        if not plot_state_0.lock.locked():
            ta_msg = TableMessage(
                plot_id="plot_0",
                ta_data=TableData(
                    key="", cell_values=np.array([[1, 2], [3, 4]]), cell_width=120
                ),
            )
            plot_state_0.current_data = ta_msg

    with before_after.after(
        "davidia.server.plotserver.PlotServer.combine_line_messages", change_plot_states
    ):
        await ps.update(append_line)
        assert isinstance(plot_state_0.current_data, MultiLineMessage)
