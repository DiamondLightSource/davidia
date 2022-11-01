import datetime
import pytest

from dataclasses import asdict

from plot.custom_types import PlotMessage, StatusType
from plot.fastapi_utils import mp_unpackb, mp_packb
from plot.plotserver import PlotServer
from plot.processor import Processor


def test_initialise_plotserver():
    processor = Processor()
    ps = PlotServer(processor)
    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert ps.message_history == {}
    assert not ps.plot_id_mapping.websockets_available


@pytest.mark.asyncio  # @UndefinedVariable
async def test_send_points():
    processor = Processor()
    ps = PlotServer(processor)

    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert not ps.plot_id_mapping.websockets_available
    assert ps.message_history == {}

    ps.message_history["plot_0"] = []
    x = [i for i in range(50)]
    y = [j % 10 for j in x]
    time_id = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    new_line = PlotMessage(
        plot_id="plot_0",
        type="new_line_data",
        params={
            "key": time_id,
            "color": "purple",
            "x": x,
            "y": y,
            "line_on": True
        },
    )

    processed_line = ps.processor.process(new_line)
    line_as_dict = asdict(processed_line)

    msg = mp_packb(line_as_dict)
    ps.message_history["plot_0"].append(msg)
    assert not ps.plot_id_mapping.websockets_available

    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert ps.message_history == {"plot_0": [msg]}
    assert not ps.plot_id_mapping.websockets_available

    await ps.send_next_message()

    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert ps.message_history == {"plot_0": [msg]}
    assert not ps.plot_id_mapping.websockets_available

    unpacked_msg = mp_unpackb(msg)
    assert line_as_dict == unpacked_msg
