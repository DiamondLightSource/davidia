import datetime
import msgpack
import pytest
import time

from httpx import AsyncClient
from fastapi.testclient import TestClient

from main import app
from plot.custom_types import PlotMessage, StatusType


def test_status_ws():
    initial_data_0 = {
        "type": "multiline data",
        "plot_id": "0",
        "data": [
            {
                "id": "line_0",
                "colour": "red",
                "x": [0, 1, 2, 3, 4],
                "y": [0, 1, 4, 9, 16]
            },
            {
                "id": "line_1",
                "colour": "blue",
                "x": [2, 4, 6, 8],
                "y": [20, 10, 30, 50, 5]
            },
            {
                "id": "line_2",
                "colour": "green",
                "x": [0, 1, 2, 3, 4],
                "y": [0, 10, 40, 10, 0]
            }
        ]
    }

    initial_data_1 = {
        "type": "multiline data",
        "plot_id": "1",
        "data": [
            {
                "id": "line_0",
                "colour": "black",
                "x": [0, 1, 2, 3, 4, 5],
                "y": [4, 8, 12, 16, 20]
            },
            {
                "id": "line_1",
                "colour": "pink",
                "x": [3, 5, 7, 9],
                "y": [-1, -5, 5, 10, 5]
            },
            {
                "id": "line_2",
                "colour": "purple",
                "x": [0, 1, 2, 3, 4],
                "y": [0, 20, 30, 10, 10]
            }
        ]
    }

    with TestClient(app) as client:
        with client.websocket_connect("/plot") as ws:
            from main import ps
            assert len(ps.message_history) == 2
            assert ps.client_status == StatusType.busy
            assert len(ps.ws_list) == 1

            ws.send_json({"type": "status", "params": {"status": "ready"}})
            time.sleep(1)
            assert ps.client_status == StatusType.busy
            assert len(ps.message_history) == 2
            received = ws.receive()
            assert received["text"] == msgpack.packb(initial_data_0, use_bin_type=True)

            ws.send_json({"type": "status", "params": {"status": "ready"}})
            time.sleep(1)
            assert ps.client_status == StatusType.busy
            assert len(ps.message_history) == 2
            received = ws.receive()
            assert received["text"] == msgpack.packb(initial_data_1, use_bin_type=True)

            ws.send_json({"type": "new_line_request", "params": {"plot_id": "0", "line_id": "4"}})
            time.sleep(1)
            assert ps.client_status == StatusType.busy
            assert len(ps.message_history) == 3
            received_new_line = ws.receive()
            rec_data = msgpack.unpackb(received_new_line["text"])
            assert rec_data["type"] == "new line data"
            assert rec_data["data"]["id"] == "line_4"


@pytest.mark.asyncio
async def test_get_data():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        aux_line = PlotMessage(type="aux_line_data", params={"plot_id": "0", "id": "new_line", "colour": "orange", "x": [5, 6, 7, 8, 9], "y": [20, 30, 40, 50, 60]})
        msg = msgpack.packb(aux_line.__dict__, use_bin_type=True)
        headers = {'content-type': 'application/x-msgpack', 'accept' : 'application/x-msgpack'}
        response = await ac.post("/push_data", data=msg, headers=headers)
    assert response.status_code == 200
    assert msgpack.unpackb(response._content) == "data sent"


@pytest.mark.asyncio
async def test_clear_data_via_message():
    with TestClient(app) as client:
        from main import ps
        with client.websocket_connect("/plot") as ws:
            async with AsyncClient(app=app, base_url="http://test") as ac:
                response = await ac.get("/clear_data", params={}, headers={'Content-type': 'application/json'}, auth=('user', 'pass'))
            assert response.status_code == 200
            assert response.json() == "data cleared"
            assert len(ps.message_history) == 1
            assert ps.message_history == [msgpack.packb({"type": "clear plots"}, use_bin_type=True)]
