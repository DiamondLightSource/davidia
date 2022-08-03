import msgpack

from fastapi import WebSocket
from fastapi.testclient import TestClient

from plot.plotserver import PlotServer
from plot.processor import Processor
from main import app


def test_initialise_plotserver():
    processor = Processor()
    ps = PlotServer(processor)
    assert ps.ws_list == [] 
    assert ps.processor == processor
    assert ps.react_status == 'busy'
    assert ps.response_list == []


def test_initialise_plotserver_with_data(self):
    client = TestClient(app)
    with WebSocket(app) as ws:
        processor = Processor()
        data = [
            {
                "type": "multiline data",
                "data": [
                    {
                        "id": "line_0",
                        "colour": "blue",
                        "x": [0, 5, 10, 15, 20],
                        "y": [4, 3, 2, 1, 0]
                    }
                ]
            }
        ]
        processor.initial_data.append(data)
        ps = PlotServer(processor)
        ps.ws_list.append(ws)
        ps.send_next_message()

        assert ps.ws_list == [ws]
        assert ps.processor == processor
        assert ps.react_status == 'busy'
        assert len(ps.response_list) == 1
        assert ps.response_list == msgpack.packb(data, use_bin_type=True)


def test_send_next_message():
    client = TestClient(app)
    with WebSocket(app) as ws:
        processor = Processor()
        ps = PlotServer(processor)
        assert len(ps.response_list) == 0
        assert ps.react_status == 'busy'
        ps.ws_list.append(ws)
        data = [
            {
                "type": "multiline data",
                "data": [
                    {
                        "id": "line_0",
                        "colour": "blue",
                        "x": [0, 5, 10, 15, 20],
                        "y": [4, 3, 2, 1, 0]
                    }
                ]
            }
        ]
        processor.initial_data.append(data)

        assert len(ps.response_list) == 1
        assert ps.react_status == 'busy'

        ps.send_next_message()

        assert len(ps.response_list) == 0
        assert ps.react_status == 'busy'


def test_send_next_message_empty():
    client = TestClient(app)
    with WebSocket(app) as ws:
        processor = Processor()
        ps = PlotServer(processor)
        ps.ws_list.append(ws)
        ps.send_next_message()

        assert ps.ws_list == [ws]
        assert len(ps.response_list) == 0
        assert ps.react_status == 'busy'

        ps.send_next_message()

        assert len(ps.response_list) == 0
        assert ps.react_status == 'ready'
