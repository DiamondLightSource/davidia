import datetime
import msgpack
import pytest

from plot.custom_types import PlotMessage, StatusType
from plot.plotserver import PlotServer
from plot.processor import Processor


def test_initialise_plotserver():
    processor = Processor()
    ps = PlotServer(processor)
    assert ps.ws_list == []
    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert ps.message_history == []


def test_initialise_plotserver_with_data():
    data = {
            "type": "multiline data",
            "plot_id": "0",
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

    assert ps.ws_list == []
    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert len(ps.message_history) == 1
    assert ps.message_history == [msgpack_data]

@pytest.mark.asyncio
async def test_send_points():
    data = {
            "type": "multiline data",
            "plot_id": "0",
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

    assert ps.ws_list == []
    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert len(ps.message_history) == 1
    assert ps.message_history == [msgpack_data]

    x = [i for i in range(50)]
    y = [j % 10  for j in x]
    time_id = datetime.datetime.now().strftime(f"%Y%m%d%H%M%S")
    aux_line = PlotMessage(type="aux_line_data", params={"plot_id": "0", "id": time_id, "colour": "purple", "x": x, "y": y})

    processed_line = ps.processor.process(aux_line)
    msg = msgpack.packb(processed_line, use_bin_type=True)
    ps.message_history.append(msg)
    for _, q in ps.ws_list:
        q.put(msg)

    assert ps.ws_list == []
    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert len(ps.message_history) == 2
    assert ps.message_history == [msgpack_data, msg]

    await ps.send_next_message()

    assert ps.ws_list == []
    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert len(ps.message_history) == 2
    assert ps.message_history == [msgpack_data, msg]

    unpacked_msg = msgpack.unpackb(msg)
    assert processed_line == unpacked_msg
