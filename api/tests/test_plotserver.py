import msgpack

from fastapi.testclient import TestClient

from plot.custom_types import StatusType
from plot.plotserver import PlotServer
from plot.processor import Processor


def test_initialise_plotserver():
    processor = Processor()
    ps = PlotServer(processor)
    assert ps.ws_list == [] 
    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert ps.response_list == []


def test_initialise_plotserver_with_data():
    data = {
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

    assert ps.ws_list == []
    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert len(ps.response_list) == 1
    assert ps.response_list == [msgpack_data]
