from __future__ import annotations

import datetime
import itertools
import time
from enum import Enum
from typing import Any, Callable

import numpy as np
import pytest
from dataclasses import asdict, dataclass, is_dataclass
from davidia.main import _create_bare_app
from davidia.models.messages import (
    DvDNDArray,
    LineData,
    LineParams,
    MsgType,
    MultiLineDataMessage,
    PlotMessage,
    StatusType,
)
from davidia.server.fastapi_utils import (
    j_dumps,
    j_loads,
    message_unpack,
    ws_pack,
    ws_unpack,
)
from fastapi.testclient import TestClient
from httpx import AsyncClient
from pydantic import BaseModel
from pydantic_numpy.model import NumpyModel


def test_status_ws():
    data_0 = [
        LineData(
            line_params=LineParams(
                key="line_0",
                colour="red",
                line_on=True,
                point_size=8,
            ),
            x=[0, 1, 2, 3, 4],
            y=[0, 1, 4, 9, 16],
        ),
        LineData(
            line_params={"key": "line_1", "colour": "blue", "line_on": True},
            x=[2, 4, 6, 8, 9],
            y=[20, 10, 30, 50],
        ),
        LineData(
            line_params=LineParams(
                key="line_2",
                colour="green",
                line_on=False,
                point_size=8,
            ),
            x=[0, 1, 2, 3, 4],
            y=[0, 10, 40, 10, 0],
        ),
    ]
    plot_msg_0 = PlotMessage(
        plot_id="plot_0", type=MsgType.new_multiline_data, params=data_0
    )
    msg_0 = plot_msg_0.model_dump()
    data_1 = [
        LineData(
            line_params=LineParams(
                key="line_0",
                colour="black",
                line_on=True,
                point_size=8,
            ),
            x=[0, 1, 2, 3, 4, 5],
            y=[4, 8, 12, 16, 20],
        ),
        LineData(
            line_params={"key": "line_1", "colour": "pink", "line_on": True},
            x=[3, 5, 7, 9, 11],
            y=[-1, -5, 5, 10],
        ),
        LineData(
            line_params=LineParams(
                key="line_2",
                colour="purple",
                line_on=False,
                point_size=8,
            ),
            x=[0, 1, 2, 3, 4],
            y=[0, 20, 30, 10, 10],
        ),
    ]
    plot_msg_1 = PlotMessage(
        plot_id="plot_1", type=MsgType.new_multiline_data, params=data_1
    )
    msg_1 = plot_msg_1.model_dump()

    data_2 = LineData(
        line_params=LineParams(key="new_line", colour="black", line_on=True),
        x=[10, 20, 30],
        y=[-3, -1, 5],
        line_on=True,
    )
    plot_msg_2 = PlotMessage(
        plot_id="plot_0", type=MsgType.new_multiline_data, params=[data_2]
    )
    msg_2 = plot_msg_2.model_dump()

    app, _ = _create_bare_app()

    with TestClient(app) as client:
        with client.websocket_connect("/plot/30064551/plot_0") as ws_0:
            with client.websocket_connect("/plot/30064551/plot_1") as ws_1:
                ps = getattr(app, "_plot_server")
                client_0 = ps._clients["plot_0"]
                client_1 = ps._clients["plot_1"]
                plot_state_0 = ps.plot_states["plot_0"]
                plot_state_1 = ps.plot_states["plot_1"]
                assert ps.client_status == StatusType.busy
                assert len(client_0) == 1
                assert len(client_1) == 1

                assert plot_state_0.current_data is None
                assert plot_state_0.current_selections is None
                assert plot_state_0.new_data_message is None
                assert plot_state_0.new_selections_message is None
                assert plot_state_1.new_data_message is None
                assert plot_state_1.new_selections_message is None
                assert plot_state_1.current_data is None
                assert plot_state_1.current_selections is None

                ws_0.send_bytes(ws_pack(msg_0))
                time.sleep(1)
                assert ps.client_status == StatusType.busy
                assert plot_state_0.current_data
                assert plot_state_0.current_selections is None
                assert plot_state_0.new_data_message
                assert plot_state_0.new_selections_message is None
                assert plot_state_1.new_data_message is None
                assert plot_state_1.new_selections_message is None
                assert plot_state_1.current_data is None
                assert plot_state_1.current_selections is None

                ws_1.send_bytes(ws_pack(msg_1))
                time.sleep(1)
                assert ps.client_status == StatusType.busy
                assert len(client_0) == 1
                assert len(client_1) == 1
                assert plot_state_0.new_data_message
                assert plot_state_1.new_data_message
                assert plot_state_0.new_selections_message is None
                assert plot_state_1.new_selections_message is None
                ws_0.send_bytes(
                    ws_pack(
                        {
                            "plot_id": "plot_0",
                            "type": "status",
                            "params": "ready",
                        }
                    )
                )
                time.sleep(1)
                assert ps.client_status == StatusType.busy

                received_0_0 = ws_0.receive()
                received_0_1 = ws_0.receive()
                rec_text_0_0 = ws_unpack(received_0_0["bytes"])
                rec_text_0_1 = ws_unpack(received_0_1["bytes"])

                assert (
                    rec_text_0_0
                    == rec_text_0_1
                    == {"baton": "30064551", "uuids": ["30064551"]}
                )

                received_0_2 = ws_0.receive()
                rec_text_0_2 = ws_unpack(received_0_2["bytes"])
                nppd_assert_equal(
                    rec_text_0_2["ml_data"][2]["y"], np.array([0, 10, 40, 10, 0])
                )

                ws_1.send_bytes(
                    ws_pack(
                        {
                            "plot_id": "plot_1",
                            "type": "status",
                            "params": "ready",
                        }
                    )
                )
                time.sleep(1)
                assert ps.client_status == StatusType.busy

                received_1_0 = ws_1.receive()
                rec_text_1_0 = ws_unpack(received_1_0["bytes"])
                assert rec_text_1_0 == {"baton": "30064551", "uuids": ["30064551"]}

                received_1_1 = ws_1.receive()
                rec_text_1_1 = ws_unpack(received_1_1["bytes"])
                nppd_assert_equal(
                    rec_text_1_1["ml_data"][1]["x"], np.array([3, 5, 7, 9, 11])
                )

                ws_0.send_bytes(ws_pack(msg_2))
                time.sleep(1)
                assert ps.client_status == StatusType.busy
                received_new_line = ws_0.receive()
                rec_data = ws_unpack(received_new_line["bytes"])
                line_msg = MultiLineDataMessage.model_validate(rec_data)
                assert line_msg is not None


@dataclass
class Codec:
    mime_type: str
    encode: Callable
    decode: Callable


js_codec = Codec("", j_dumps, j_loads)
mp_codec = Codec("application/x-msgpack", ws_pack, ws_unpack)

CODECS_PARAMS = list(itertools.product((js_codec, mp_codec), (js_codec, mp_codec)))


@pytest.mark.asyncio  # @UndefinedVariable
@pytest.mark.parametrize("send,receive", CODECS_PARAMS)
async def test_get_data(send, receive):
    line = LineData(
        line_params=LineParams(key="new_line", colour="orange", line_on=True),
        x=[5, 6, 7, 8, 9],
        y=[20, 30, 40, 50, 60],
        line_on=True,
    )

    new_line = PlotMessage(
        plot_id="plot_0", type=MsgType.new_multiline_data, params=[line]
    )

    app, _ = _create_bare_app()

    async with AsyncClient(app=app, base_url="http://test") as ac:
        headers = {}
        if send.mime_type:
            headers["Content-Type"] = send.mime_type
        if receive.mime_type:
            headers["Accept"] = receive.mime_type
        msg = send.encode(new_line)
        response = await ac.post("/push_data", content=msg, headers=headers)
        assert response.status_code == 200
        assert receive.decode(response._content) == "data sent"


@pytest.mark.asyncio
async def test_clear_data_via_message():
    app, _ = _create_bare_app()

    with TestClient(app) as client:
        ps = getattr(app, "_plot_server")

        with client.websocket_connect("/plot/8123f452/plot_0"):
            with client.websocket_connect("/plot/fc8ed0e5/plot_1"):
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

                plot_state_0 = ps.plot_states["plot_0"]
                assert plot_state_0.new_data_message is None
                assert plot_state_0.new_selections_message is None
                assert plot_state_0.current_data is None
                assert plot_state_0.current_selections is None


@pytest.mark.asyncio
async def test_push_points():
    x = [i for i in range(10)]
    y = [j % 10 for j in x]
    time_id = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    line = LineData(
        line_params=LineParams(key=time_id, colour="purple", line_on=True),
        x=x,
        y=y,
        line_on=True,
    )
    new_line = PlotMessage(
        plot_id="plot_0", type=MsgType.new_multiline_data, params=[line]
    )
    msg = ws_pack(new_line)
    headers = {
        "Content-Type": "application/x-msgpack",
        "Accept": "application/x-msgpack",
    }
    app, _ = _create_bare_app()

    with TestClient(app) as client:
        with client.websocket_connect("/plot/99a81b01/plot_0"):
            async with AsyncClient(app=app, base_url="http://test") as ac:
                response = await ac.post("/push_data", content=msg, headers=headers)
            assert response.status_code == 200
            assert ws_unpack(response._content) == "data sent"


class TrialA(NumpyModel):
    integers: list[int]
    floats: list[float]
    array: DvDNDArray | None = None


class TrialB(NumpyModel):
    integers: list[int]
    floats: list[float]
    array: DvDNDArray | None = None
    original: TrialA


_nptest_assert_eq = np.testing.assert_equal  # supports dict testing


def nppd_assert_equal(this, other: Any) -> None:
    is_enum = isinstance(this, Enum)
    assert is_enum or type(this) == type(other)
    if is_enum:
        assert this.value == other
    elif isinstance(this, dict):
        assert len(this) == len(other)
        for k, v in this.items():
            assert k in other
            nppd_assert_equal(v, other[k])
    elif isinstance(this, (list, tuple)):
        assert len(this) == len(other)
        for t, o in zip(this, other):
            nppd_assert_equal(t, o)
    elif isinstance(this, BaseModel):
        nppd_assert_equal(this.model_dump(), other.model_dump())
    elif isinstance(this, np.ndarray):
        _nptest_assert_eq(this, other)
    elif is_dataclass(this):
        nppd_assert_equal(asdict(this), asdict(other))
    else:
        assert this == other


@pytest.mark.asyncio
@pytest.mark.parametrize("send,receive", CODECS_PARAMS)
async def test_post_test_pydantic(send, receive):
    testa = TrialA(
        integers=[1, 3, 4],
        floats=[-0.5, 1.7, 10.0],
        array=np.array([-1.5, 4]),
    )
    testb = TrialB(
        integers=[0, 2, 3],
        floats=[2.0, 4.2, 12.5],
        array=np.array([-3.75, 10]),
        original=testa,
    )
    app, _ = _create_bare_app()

    @app.post("/test_pydantic")
    @message_unpack
    async def pydantic_test(data: TrialA) -> TrialB:
        result = TrialB(
            integers=[i - 1 for i in data.integers],
            floats=[f + 2.5 for f in data.floats],
            array=data.array * 2.5 if data.array is not None else None,
            original=data,
        )
        return result

    async with AsyncClient(app=app, base_url="http://test") as ac:
        headers = {}
        if send.mime_type:
            headers["Content-Type"] = send.mime_type
        if receive.mime_type:
            headers["Accept"] = receive.mime_type
        msg = send.encode(testa)
        response = await ac.post("/test_pydantic", content=msg, headers=headers)
        assert response.status_code == 200
        nppd_assert_equal(
            TrialB.model_validate(receive.decode(response._content)), testb
        )


if __name__ == "__main__":
    import json

    print(json.dumps(TrialB.model_json_schema(), indent=2))
