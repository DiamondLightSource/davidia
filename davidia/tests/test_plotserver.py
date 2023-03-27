import datetime
import numpy as np
import pytest

from davidia.models.messages import (
    AppendLineDataMessage,
    DataMessage,
    LineData,
    MultiLineDataMessage,
    PlotMessage,
    StatusType,
)

from davidia.models.parameters import AxesParameters
from davidia.server.fastapi_utils import ws_pack, ws_unpack
from davidia.server.plotserver import (
    PlotServer,
    add_indices,
    convert_append_to_multi_line_data_message,
)

from .test_api import nppd_assert_equal


def test_initialise_plotserver():
    ps = PlotServer()
    assert ps.client_status == StatusType.busy
    assert ps._clients == {}
    assert ps.new_data_message == {}
    assert ps.new_selections_message == {}
    assert ps.current_data == {}
    assert ps.current_selections == {}
    assert ps.client_total == 0
    assert not ps.clients_available()


@pytest.mark.asyncio  # @UndefinedVariable
async def test_send_points():
    ps = PlotServer()

    assert ps.client_status == StatusType.busy
    assert not ps.clients_available()
    assert ps.new_data_message == {}
    assert ps.new_selections_message == {}
    assert ps.current_data == {}
    assert ps.current_selections == {}

    # ps.message_history["plot_0"] = []
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
    ps.current_data["plot_0"] = line_as_dict
    ps.new_data_message["plot_0"] = msg
    assert not ps.clients_available()

    assert ps.client_status == StatusType.busy
    assert ps.current_data == {"plot_0": line_as_dict}
    assert ps.new_data_message == {"plot_0": msg}
    assert not ps.clients_available()

    await ps.send_next_message()

    assert ps.client_status == StatusType.busy
    assert ps.current_data == {"plot_0": line_as_dict}
    assert ps.new_data_message == {"plot_0": msg}
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
    print(f"a LD: {a}")
    print(f"b LD: {b}")
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
    ps.current_data[plot_id] = current_data
    ml_msg, al_msg = ps.combine_line_messages(plot_id, new_points_msg)
    assert_line_data_messages_are_equal(ml_msg, expected[0])
    assert_line_data_messages_are_equal(al_msg, expected[1])


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
