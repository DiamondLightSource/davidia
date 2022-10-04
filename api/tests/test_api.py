import datetime
import msgpack
import pytest
import time

from httpx import AsyncClient
from fastapi.testclient import TestClient
from queue import Queue

from main import app
from plot.custom_types import PlotMessage, StatusType


def test_status_ws():
    initial_data_0 = {
        "type": "multiline data",
        "plot_id": "plot_0",
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
        "plot_id": "plot_1",
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
        with client.websocket_connect("/plot/plot_0") as ws_0:
            with client.websocket_connect("/plot/plot_1") as ws_1:
                from main import ps
                assert list(ps.message_history.keys()) == ["plot_0", "plot_1"]
                assert len(ps.message_history["plot_0"]) == 1
                assert len(ps.message_history["plot_1"]) == 1
                assert ps.client_status == StatusType.busy
                assert len(ps.plot_id_mapping.websockets_for_plot_id("plot_0")) == 1
                assert len(ps.plot_id_mapping.websockets_for_plot_id("plot_1")) == 1

                ws_0.send_json({"plot_id": "plot_0", "type": "status", "params": {"status": "ready"}})
                time.sleep(1)
                assert ps.client_status == StatusType.busy
                assert len(ps.message_history["plot_0"]) == 1
                assert len(ps.message_history["plot_1"]) == 1
                received = ws_0.receive()
                assert received["text"] == msgpack.packb(initial_data_0, use_bin_type=True)

                ws_0.send_json({"plot_id": "plot_0", "type": "status", "params": {"status": "ready"}})
                time.sleep(1)
                assert ps.client_status == StatusType.busy
                assert len(ps.message_history["plot_0"]) == 1
                assert len(ps.message_history["plot_1"]) == 1
                received = ws_1.receive()
                assert received["text"] == msgpack.packb(initial_data_1, use_bin_type=True)

                ws_0.send_json({"plot_id": "plot_0", "type": "new_line_request", "params": {"line_id": "4"}})
                time.sleep(1)
                assert ps.client_status == StatusType.busy
                assert len(ps.message_history["plot_0"]) == 2
                assert len(ps.message_history["plot_1"]) == 1
                received_new_line = ws_0.receive()
                rec_data = msgpack.unpackb(received_new_line["text"])
                assert rec_data["type"] == "new line data"
                assert rec_data["data"]["id"] == "line_4"
                del ps


@pytest.mark.asyncio
async def test_get_data():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        aux_line = PlotMessage(plot_id="plot_0", type="aux_line_data", params={"id": "new_line", "colour": "orange", "x": [5, 6, 7, 8, 9], "y": [20, 30, 40, 50, 60]})
        msg = msgpack.packb(aux_line.__dict__, use_bin_type=True)
        headers = {'content-type': 'application/x-msgpack', 'accept' : 'application/x-msgpack'}
        response = await ac.post("/push_data", data=msg, headers=headers)
    assert response.status_code == 200
    assert msgpack.unpackb(response._content) == "data sent"


@pytest.mark.asyncio
async def test_clear_data_via_message():
    with TestClient(app) as client:
        from main import ps
        ps.plot_id_mapping.websockets_for_plot_id
        print(f"ps.plot_id_mapping is {ps.plot_id_mapping}")
        with client.websocket_connect("/plot/plot_0") as ws0:
            with client.websocket_connect("/plot/plot_1") as ws1:
                print(f"ps.plot_id_mapping is {ps.plot_id_mapping}")
                async with AsyncClient(app=app, base_url="http://test") as ac:
                    response = await ac.get("/clear_data/plot_0", params={}, headers={'Content-type': 'application/json'}, auth=('user', 'pass'))
                assert response.status_code == 200
                assert response.json() == "data cleared"
                assert len(ps.message_history["plot_0"]) == 1
                assert len(ps.message_history["plot_1"]) == 1
                assert ps.message_history["plot_0"] == [msgpack.packb({"type": "clear plots"}, use_bin_type=True)]
                assert ps.message_history["plot_1"] != [msgpack.packb({"type": "clear plots"}, use_bin_type=True)]
        del ps


@pytest.mark.asyncio
async def test_push_points():
    x = [i for i in range(10)]
    y = [j % 10  for j in x]
    time_id = datetime.datetime.now().strftime(f"%Y%m%d%H%M%S")
    aux_line = PlotMessage(plot_id="plot_0", type="aux_line_data", params={"id": time_id, "colour": "purple", "x": x, "y": y})
    msg = msgpack.packb(aux_line.__dict__, use_bin_type=True)
    headers = {'content-type': 'application/x-msgpack', 'accept' : 'application/x-msgpack'}
    with TestClient(app) as client:
        from main import ps
        with client.websocket_connect("/plot/plot_0") as ws:
            async with AsyncClient(app=app, base_url="http://test") as ac:
                response = await ac.post("/push_data", data=msg, headers=headers)
            assert response.status_code == 200
            assert msgpack.unpackb(response._content) == "data sent"
        del ps
