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
from davidia.server.plotserver import PlotServer, add_indices

from .test_api import nppd_assert_equal


def test_initialise_plotserver():
    ps = PlotServer()
    assert ps.client_status == StatusType.busy
    assert ps.message_history == {}
    assert not ps.clients_available()


@pytest.mark.asyncio  # @UndefinedVariable
async def test_send_points():
    ps = PlotServer()

    assert ps.client_status == StatusType.busy
    assert not ps.clients_available()
    assert ps.message_history == {}

    ps.message_history["plot_0"] = []
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
    ps.message_history["plot_0"].append(msg)
    assert not ps.clients_available()

    assert ps.client_status == StatusType.busy
    assert ps.message_history == {"plot_0": [msg]}
    assert not ps.clients_available()

    await ps.send_next_message()

    assert ps.client_status == StatusType.busy
    assert ps.message_history == {"plot_0": [msg]}
    assert not ps.clients_available()

    unpacked_msg = ws_unpack(msg)
    nppd_assert_equal(line_as_dict, unpacked_msg)


@pytest.mark.parametrize(
        "name,key,x,default_indices",
        [
            ('zero_x', '100', np.array([]), True),
            ('x_and_y', '101', np.array([0, 2]), False),
        ]
    )
def test_line_data_initialization(name, key: str, x: list, default_indices: bool):
    a = LineData(
            key=key,
            x=np.array(x),
            y=np.array([4, 2]),
            colour='blue',
            line_on=True,
            point_size=None,
        )
    assert(a.default_indices == default_indices)


def line_data_are_equal(a: LineData, b: LineData) -> bool:
    return (
        a.key == b.key and
        a.colour == b.colour and
        a.line_on == b.line_on and
        a.point_size == b.point_size and
        a.default_indices == b.default_indices and
        np.array_equal(a.x, b.x) and
        np.array_equal(a.y, b.y)
    )


def assert_line_data_messages_are_equal(a: MultiLineDataMessage | AppendLineDataMessage, b: MultiLineDataMessage | AppendLineDataMessage):
    assert(a.axes_parameters == b.axes_parameters)
    if isinstance(a, MultiLineDataMessage) and isinstance(b, MultiLineDataMessage):
        assert(len(a.ml_data) == len(b.ml_data))
        assert(all([line_data_are_equal(c, d) for c, d in zip(a.ml_data, b.ml_data)]))
    elif isinstance(a, AppendLineDataMessage) and isinstance(b, AppendLineDataMessage):
        assert(len(a.al_data) == len(b.al_data))
        assert(all([line_data_are_equal(c, d) for c, d in zip(a.al_data, b.al_data)]))
    else:
        raise AssertionError(f"a and b must both be either MultiLineDataMessage or AppendLineDataMessage: {a}, {b}")


LINE_100 = LineData(key="100", x=np.array([0, 1, 2]), y=np.array([10, 20, 30]))
LINE_100_NO_X = LineData(key="100", x=np.array([]), y=np.array([10, 20, 30]))
LINE_100_TRUE = LineData(key="100", x=np.array([0, 1, 2]), y=np.array([10, 20, 30]), default_indices=True)
LINE_100_COMBINED = LineData(key="100", x=np.array([0, 1, 2, 3, 4, 5, 6]), y=np.array([10, 20, 30, 70, 60, 50, 40]))
LINE_100_COMBINED_TRUE = LineData(key="100", x=np.array([0, 1, 2, 3, 4, 5, 6]), y=np.array([10, 20, 30, 70, 60, 50, 40]), default_indices=True)
LINE_200 = LineData(key="200", x=np.array([0, 1, 2]), y=np.array([5, 10, 15]))
LINE_200_TRUE = LineData(key="200", x=np.array([0, 1, 2]), y=np.array([5, 10, 15]), default_indices=True)
LINE_200_HIGH_X = LineData(key="200", x=np.array([2, 3, 4]), y=np.array([5, 10, 15]))
LINE_200_COMBINED = LineData(key="200", x=np.array([0, 1, 2, 3, 4, 5, 6]), y=np.array([5, 10, 15, 20, 50, 70, 90]))
LINE_200_COMBINED_HIGH = LineData(key="200", x=np.array([2, 3, 4, 7, 8, 9, 10]), y=np.array([5, 10, 15, 20, 50, 70, 90]))
LINE_200_COMBINED_TRUE = LineData(key="200", x=np.array([0, 1, 2, 3, 4, 5, 6]), y=np.array([5, 10, 15, 20, 50, 70, 90]), default_indices=True)
LINE_300 = LineData(key="300", x=np.array([0, 1, 2, 3]), y=np.array([14, 12, 10, 8]))
LINE_300_TRUE = LineData(key="300", x=np.array([0, 1, 2, 3]), y=np.array([14, 12, 10, 8]), default_indices=True)
LINE_300_HIGH_X = LineData(key="300", x=np.array([2, 3, 7, 9]), y=np.array([14, 12, 10, 8]))
LINE_010 = LineData(key="010", x=np.array([3, 4, 5, 6]), y=np.array([70, 60, 50, 40]))
LINE_010_NO_X = LineData(key="010", x=np.array([]), y=np.array([70, 60, 50, 40]))
LINE_010_TRUE = LineData(key="010", x=np.array([3, 4, 5, 6]), y=np.array([70, 60, 50, 40]), default_indices=True)
LINE_020 = LineData(key="020", x=np.array([3, 4, 5, 6]), y=np.array([20, 50, 70, 90]))
LINE_020_NO_X = LineData(key="020", x=np.array([]), y=np.array([20, 50, 70, 90]))
LINE_020_TRUE = LineData(key="020", x=np.array([3, 4, 5, 6]), y=np.array([20, 50, 70, 90]), default_indices=True)
LINE_020_HIGH_X = LineData(key="020", x=np.array([7, 8, 9, 10]), y=np.array([20, 50, 70, 90]))
LINE_030_NO_X = LineData(key="030", x=np.array([]), y=np.array([14, 12, 10, 8]))
LINE_030_TRUE = LineData(key="030", x=np.array([0, 1, 2, 3]), y=np.array([14, 12, 10, 8]), default_indices=True)
LINE_030_HIGH_X = LineData(key="030", x=np.array([2, 3, 7, 9]), y=np.array([14, 12, 10, 8]))
@pytest.mark.parametrize(
    "name,plot_id,current_data,new_points_msg,expected",
    [
        (
            "equal_length_no_default",
            "plot_0",
            MultiLineDataMessage(ml_data=[LINE_100, LINE_200]),
            AppendLineDataMessage(al_data=[LINE_010, LINE_020]),
            (
                MultiLineDataMessage(ml_data=[LINE_100_COMBINED, LINE_200_COMBINED]),
                AppendLineDataMessage(al_data=[LINE_010, LINE_020]),
            )
        ),
        (
            "more_current_data_no_default",
            "plot_0",
            MultiLineDataMessage(ml_data=[LINE_100, LINE_200_HIGH_X, LINE_300_HIGH_X]),
            AppendLineDataMessage(al_data=[LINE_010, LINE_020_HIGH_X]),
            (
                MultiLineDataMessage(ml_data=[LINE_100_COMBINED, LINE_200_COMBINED_HIGH, LINE_300_HIGH_X]),
                AppendLineDataMessage(al_data=[LINE_010, LINE_020_HIGH_X]),
            )
        ),
        (
            "more_append_data_no_default",
            "plot_0",
            MultiLineDataMessage(ml_data=[LINE_100, LINE_200_HIGH_X]),
            AppendLineDataMessage(al_data=[LINE_010, LINE_020_HIGH_X, LINE_030_HIGH_X]),
            (
                MultiLineDataMessage(ml_data=[LINE_100_COMBINED, LINE_200_COMBINED_HIGH, LINE_030_HIGH_X]),
                AppendLineDataMessage(al_data=[LINE_010, LINE_020_HIGH_X, LINE_030_HIGH_X]),
            )
        ),
        (
            "equal_length_default_indices",
            "plot_1",
            MultiLineDataMessage(ml_data=[LINE_100_TRUE, LINE_200_TRUE]),
            AppendLineDataMessage(al_data=[LINE_010_NO_X, LINE_020_NO_X]),
            (
                MultiLineDataMessage(ml_data=[LINE_100_COMBINED_TRUE, LINE_200_COMBINED_TRUE]),
                AppendLineDataMessage(al_data=[LINE_010_TRUE, LINE_020_TRUE]),
            )
        ),
        (
            "more_current_data_default_indices",
            "plot_0",
            MultiLineDataMessage(ml_data=[LINE_100_TRUE, LINE_200_TRUE, LINE_300_TRUE]),
            AppendLineDataMessage(al_data=[LINE_010_NO_X, LINE_020_NO_X]),
            (
                MultiLineDataMessage(ml_data=[LINE_100_COMBINED_TRUE, LINE_200_COMBINED_TRUE, LINE_300_TRUE]),
                AppendLineDataMessage(al_data=[LINE_010_TRUE, LINE_020_TRUE]),
            )
        ),
        (
            "more_current_data_default_indices_some_indices_given",
            "plot_0",
            MultiLineDataMessage(ml_data=[LINE_100_TRUE, LINE_200_TRUE, LINE_300_TRUE]),
            AppendLineDataMessage(al_data=[LINE_010_NO_X, LINE_020_HIGH_X]),
            (
                MultiLineDataMessage(ml_data=[LINE_100_COMBINED_TRUE, LINE_200_COMBINED_TRUE, LINE_300_TRUE]),
                AppendLineDataMessage(al_data=[LINE_010_TRUE, LINE_020_TRUE]),
            )
        ),
        (
            "more_append_data_default_indices_indices_given",
            "plot_0",
            MultiLineDataMessage(ml_data=[LINE_100_TRUE, LINE_200_TRUE]),
            AppendLineDataMessage(al_data=[LINE_010, LINE_020_HIGH_X, LINE_030_HIGH_X]),
            (
                MultiLineDataMessage(ml_data=[LINE_100_COMBINED_TRUE, LINE_200_COMBINED_TRUE, LINE_030_TRUE]),
                AppendLineDataMessage(al_data=[LINE_010_TRUE, LINE_020_TRUE, LINE_030_TRUE]),
            )
        ),
        (
            "more_append_data_default_indices",
            "plot_0",
            MultiLineDataMessage(ml_data=[LINE_100_TRUE, LINE_200_TRUE]),
            AppendLineDataMessage(al_data=[LINE_010_NO_X, LINE_020_NO_X, LINE_030_NO_X]),
            (
                MultiLineDataMessage(ml_data=[LINE_100_COMBINED_TRUE, LINE_200_COMBINED_TRUE, LINE_030_TRUE]),
                AppendLineDataMessage(al_data=[LINE_010_TRUE, LINE_020_TRUE, LINE_030_TRUE]),
            )
        ),
    ]
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
                    ml_data=[LINE_100, LINE_200]
                ),
                MultiLineDataMessage(
                    axes_parameters=AxesParameters(),
                    ml_data=[LINE_100, LINE_200]
                ),
            ),
            (
                "default_indices",
                MultiLineDataMessage(
                    axes_parameters=AxesParameters(),
                    ml_data=[LINE_100_NO_X, LINE_030_NO_X]
                ),
                MultiLineDataMessage(
                    axes_parameters=AxesParameters(),
                    ml_data=[LINE_100_TRUE, LINE_030_TRUE]
                )
            ),
        ]
    )
def test_add_indices(name, msg: MultiLineDataMessage, expected: MultiLineDataMessage):
    message = add_indices(msg)

    assert_line_data_messages_are_equal(message, expected)
