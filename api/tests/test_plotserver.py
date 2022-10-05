import datetime
import msgpack
import pytest

from plot.custom_types import PlotMessage, StatusType
from plot.plotserver import PlotServer
from plot.processor import Processor


def test_initialise_plotserver():
    processor = Processor()
    ps = PlotServer(processor)
    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert ps.message_history == {}
    assert not ps.plot_id_mapping.websockets_available


def test_initialise_plotserver_with_data():
    data = {
            "plot_id": "plot_0",
            "type": "multiline data",
            "data": {
                    "id": "line_a",
                    "colour": "red",
                    "x": [5, 6, 7, 8, 9],
                    "y": [4, 7, 8, 3, 2]
                }
        }
    msgpack_data = msgpack.packb(data, use_bin_type=True)

    processor = Processor()
    processor.initial_data.append(data)
    ps = PlotServer(processor)

    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert len(ps.message_history["plot_0"]) == 1
    assert ps.message_history["plot_0"] == [msgpack_data]
    assert not ps.plot_id_mapping.websockets_available


@pytest.mark.asyncio
async def test_send_points():
    data = {
            "plot_id": "plot_0",
            "type": "multiline data",
            "data": {
                    "id": "line_a",
                    "colour": "red",
                    "x": [5, 6, 7, 8, 9],
                    "y": [4, 7, 8, 3, 2]
                }
        }
    msgpack_data = msgpack.packb(data, use_bin_type=True)

    processor = Processor()
    processor.initial_data.append(data)
    ps = PlotServer(processor)

    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert ps.message_history["plot_0"] == [msgpack_data]
    assert not ps.plot_id_mapping.websockets_available

    x = [i for i in range(50)]
    y = [j % 10  for j in x]
    time_id = datetime.datetime.now().strftime(f"%Y%m%d%H%M%S")
    aux_line = PlotMessage(plot_id="plot_0", type="aux_line_data", params={"id": time_id, "colour": "purple", "x": x, "y": y})

    processed_line = ps.processor.process(aux_line)
    msg = msgpack.packb(processed_line, use_bin_type=True)
    ps.message_history["plot_0"].append(msg)
    assert not ps.plot_id_mapping.websockets_available

    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert ps.message_history == {"plot_0": [msgpack_data, msg]}
    assert not ps.plot_id_mapping.websockets_available

    await ps.send_next_message()

    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert ps.message_history == {"plot_0": [msgpack_data, msg]}
    assert not ps.plot_id_mapping.websockets_available

    unpacked_msg = msgpack.unpackb(msg)
    assert processed_line == unpacked_msg
