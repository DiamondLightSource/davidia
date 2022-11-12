import datetime

import pytest

from plot.custom_types import PlotMessage, StatusType, asdict
from plot.fastapi_utils import ws_pack, ws_unpack
from plot.plotserver import PlotServer

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
        params=[{"key": time_id, "color": "purple", "x": x, "y": y, "line_on": True}],
    )

    processed_line = ps.processor.process(new_line)
    line_as_dict = asdict(processed_line)

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
