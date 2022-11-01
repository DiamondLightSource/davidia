import datetime
import pytest
import time

from httpx import AsyncClient
from pydantic import BaseModel
from fastapi.testclient import TestClient

from main import app
from plot.custom_types import (
    LineData,
    LineDataMessage,
    PlotMessage,
    StatusType,
    asdict,
)
from plot.fastapi_utils import mp_unpackb, mp_packb, j_dumps, j_loads, message_unpack


def test_status_ws():
    data_0 = [
        LineData(
            key="line_0",
            color="red",
            x=[0, 1, 2, 3, 4],
            y=[0, 1, 4, 9, 16],
            line_on=True,
            point_size=8
        ),
        LineData(
            key="line_1",
            color="blue",
            x=[2, 4, 6, 8],
            y=[20, 10, 30, 50, 5],
            line_on=True,
        ),
        LineData(
            key="line_2",
            color="green",
            x=[0, 1, 2, 3, 4],
            y=[0, 10, 40, 10, 0],
            line_on=False,
            point_size=8
        ),
    ]
    plot_msg_0 = PlotMessage(type="new_multiline_data", plot_id="plot_0", params=data_0)
    msg_0 = asdict(plot_msg_0)
    data_1 = [
        LineData(
            key="line_0",
            color="black",
            x=[0, 1, 2, 3, 4, 5],
            y=[4, 8, 12, 16, 20],
            line_on=True,
            point_size=8
        ),
        LineData(
            key="line_1",
            color="pink",
            x=[3, 5, 7, 9],
            y=[-1, -5, 5, 10, 5],
            line_on=True,
        ),
        LineData(
            key="line_2",
            color="purple",
            x=[0, 1, 2, 3, 4],
            y=[0, 20, 30, 10, 10],
            line_on=False,
            point_size=8
        ),
    ]
    plot_msg_1 = PlotMessage(type="new_multiline_data", plot_id="plot_1", params=data_1)
    msg_1 = asdict(plot_msg_1)

    data_2 = LineData(
        key="new_line",
        color="black",
        x=[10, 20, 30],
        y=[-3, -1, 5],
        line_on=True,
    )
    plot_msg_2 = PlotMessage(type="new_line_data", plot_id="plot_0", params=data_2)
    msg_2 = asdict(plot_msg_2)

    with TestClient(app) as client:
        with client.websocket_connect("/plot/plot_0") as ws_0:
            with client.websocket_connect("/plot/plot_1") as ws_1:
                from main import ps

                assert list(ps.message_history.keys()) == ["plot_0", "plot_1"]
                assert ps.client_status == StatusType.busy
                assert len(ps.plot_id_mapping.websockets_for_plot_id("plot_0")) == 1
                assert len(ps.plot_id_mapping.websockets_for_plot_id("plot_1")) == 1
                assert ps.message_history["plot_0"] == []
                assert ps.message_history["plot_1"] == []

                ws_0.send_json(msg_0)
                time.sleep(1)
                assert len(ps.message_history["plot_0"]) == 1
                assert ps.message_history["plot_1"] == []
                assert ps.client_status == StatusType.busy

                ws_1.send_json(msg_1)
                time.sleep(1)
                assert len(ps.message_history["plot_0"]) == 1
                assert len(ps.message_history["plot_1"]) == 1
                assert ps.client_status == StatusType.busy
                assert len(ps.plot_id_mapping.websockets_for_plot_id("plot_0")) == 1
                assert len(ps.plot_id_mapping.websockets_for_plot_id("plot_1")) == 1

                ws_0.send_json(
                    {
                        "plot_id": "plot_0",
                        "type": "status",
                        "params": {"status": "ready"},
                    }
                )
                time.sleep(1)
                assert ps.client_status == StatusType.busy
                assert len(ps.message_history["plot_0"]) == 1
                assert len(ps.message_history["plot_1"]) == 1

                received_0 = ws_0.receive()
                rec_text_0 = mp_unpackb(received_0["text"])
                assert rec_text_0["data"][2]["y"] == [0, 10, 40, 10, 0]

                ws_1.send_json(
                    {
                        "plot_id": "plot_1",
                        "type": "status",
                        "params": {"status": "ready"},
                    }
                )
                time.sleep(1)
                assert ps.client_status == StatusType.busy
                assert len(ps.message_history["plot_0"]) == 1
                assert len(ps.message_history["plot_1"]) == 1

                received_1 = ws_1.receive()
                rec_text_1 = mp_unpackb(received_1["text"])
                assert rec_text_1["data"][1]["x"] == [3, 5, 7, 9]

                ws_0.send_json(msg_2)
                time.sleep(1)
                assert ps.client_status == StatusType.busy
                assert len(ps.message_history["plot_0"]) == 2
                assert len(ps.message_history["plot_1"]) == 1
                received_new_line = ws_0.receive()
                rec_data = mp_unpackb(received_new_line["text"])
                line_msg = LineDataMessage(**rec_data)
                assert line_msg.type == "LineDataMessage"
                del ps


@pytest.mark.asyncio  # @UndefinedVariable
async def test_get_data():
    codecs = [("", j_dumps, j_loads), ("application/x-msgpack", mp_packb, mp_unpackb)]
    line = LineData(
        key="new_line",
        color="orange",
        x=[5, 6, 7, 8, 9],
        y=[20, 30, 40, 50, 60],
        line_on=True,
    )

    new_line = PlotMessage(plot_id="plot_0", type="new_line_data", params=line)

    async with AsyncClient(app=app, base_url="http://test") as ac:

        headers = {}
        for s_codec in codecs:
            for r_codec in codecs:
                headers.clear()
                if s_codec[0]:
                    headers["Content-Type"] = s_codec[0]
                if r_codec[0]:
                    headers["Accept"] = r_codec[0]
                msg = s_codec[1](asdict(new_line))
                response = await ac.post("/push_data", data=msg, headers=headers)
                assert response.status_code == 200
                assert r_codec[2](response._content) == "data sent"


@pytest.mark.asyncio
async def test_clear_data_via_message():
    with TestClient(app) as client:
        from main import ps

        with client.websocket_connect("/plot/plot_0"):
            with client.websocket_connect("/plot/plot_1"):
                async with AsyncClient(app=app, base_url="http://test") as ac:

                    response = await ac.put(
                        "/clear_data/plot_0",
                        params={},
                        headers={"Content-Type": "application/json"},
                    )
                    assert response.status_code == 200
                    assert response.json() == "data cleared"

                    response = await ac.put(
                        "/clear_data/plot_1",
                        params={},
                        headers={"Content-Type": "application/json"},
                    )
                    assert response.status_code == 200
                    assert response.json() == "data cleared"

                assert len(ps.message_history["plot_0"]) == 1
                assert len(ps.message_history["plot_1"]) == 1
                assert ps.message_history["plot_0"] == [
                    mp_packb({"plot_id": "plot_0", "type": "ClearPlotsMessage"})
                ]
                assert ps.message_history["plot_1"] == [
                    mp_packb({"plot_id": "plot_1", "type": "ClearPlotsMessage"})
                ]
        del ps


@pytest.mark.asyncio
async def test_push_points():
    x = [i for i in range(10)]
    y = [j % 10 for j in x]
    time_id = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    line = LineData(key=time_id, color="purple", x=x, y=y, line_on=True)
    new_line = PlotMessage(plot_id="plot_0", type="new_line_data", params=line)
    msg = mp_packb(asdict(new_line))
    headers = {
        "Content-Type": "application/x-msgpack",
        "Accept": "application/x-msgpack",
    }
    with TestClient(app) as client:
        from main import ps

        with client.websocket_connect("/plot/plot_0"):
            async with AsyncClient(app=app, base_url="http://test") as ac:
                response = await ac.post("/push_data", data=msg, headers=headers)
            assert response.status_code == 200
            assert mp_unpackb(response._content) == "data sent"
        del ps


class TrialA(BaseModel):
    integers: list[int]
    floats: list[float]


class TrialB(BaseModel):
    integers: list[int]
    floats: list[float]
    original: TrialA


@app.post("/test_pydantic")
@message_unpack
async def test_pydantic(data: TrialA) -> TrialB:
    result = TrialB(
        integers=[i - 1 for i in data.integers],
        floats=[f + 2.5 for f in data.floats],
        original=data,
    )
    return result


@pytest.mark.asyncio
async def test_get_test_pydantic():
    codecs = [("", j_dumps, j_loads), ("application/x-msgpack", mp_packb, mp_unpackb)]
    testa = TrialA(integers=[1, 3, 4], floats=[-0.5, 1.7, 10.0])
    testb = TrialB(integers=[0, 2, 3], floats=[2.0, 4.2, 12.5], original=testa)

    async with AsyncClient(app=app, base_url="http://test") as ac:

        headers = {}
        for s_codec in codecs:
            for r_codec in codecs:
                headers.clear()
                if s_codec[0]:
                    headers["Content-Type"] = s_codec[0]
                if r_codec[0]:
                    headers["Accept"] = r_codec[0]
                msg = s_codec[1](asdict(testa))
                response = await ac.post("/test_pydantic", data=msg, headers=headers)
                assert response.status_code == 200
                assert r_codec[2](response._content) == testb


if __name__ == "__main__":
    from pydantic import schema_json_of

    print(schema_json_of(TrialB, indent=2))
