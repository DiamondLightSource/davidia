import json
import pytest

from fastapi.testclient import TestClient

from main import app
from plot.plotserver import PlotServer
from plot.processor import Processor


@pytest.mark.asyncio
async def test_websocket():
    client = TestClient(app, backend_options={"use_uvloop": True})
    with client.websocket_connect("/status") as websocket:
        processor = Processor()
        ps = PlotServer(processor)
        print("created plotserver")
        assert len(ps.response_list) == 0
        assert ps.react_status == 'busy'
        print("first two asserts passed")
        ps.ws_list.append(websocket)
        data = {
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
        # data_msg = msgpack.packb(data, use_bin_type=True)
        data_msg = json.dumps(data)
        ps.response_list.append(data_msg)

        assert len(ps.response_list) == 1
        assert ps.react_status == 'busy'
        print("about to send message")
        await ps.send_next_message()
        print("finished sending message")
        assert len(ps.response_list) == 0
        assert ps.react_status == 'busy'
        print(f"options are {dir(websocket)}")
        response = websocket.receive_json()
        assert response == data_msg
