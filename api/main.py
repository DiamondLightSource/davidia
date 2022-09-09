from __future__ import annotations

import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware  # comment this on deployment
from queue import Queue

from plot.custom_types import MsgType, PlotMessage, StatusType
from plot.example_processor import ExampleProcessor
from plot.plotserver import PlotServer


app = FastAPI()
origins = ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins)  # comment this on deployment
ps = PlotServer(ExampleProcessor())


@app.websocket("/plot")
async def websocket(websocket: WebSocket):
    q = Queue()
    for i in ps.message_history: q.put(i)
    await websocket.accept()
    ps.ws_list.append((websocket, q))

    try:
        while True:
            message = await websocket.receive_text()
            message = json.loads(message)
            received_message = PlotMessage(**message)

            if received_message.type == MsgType.status:
                if StatusType[received_message.params['status']] == StatusType.ready:
                    ps.client_status = StatusType.ready
                    await ps.send_next_message()

            else:
                ps.prepare_data(received_message)
                await ps.send_next_message()

    except WebSocketDisconnect:
        ps.ws_list = [(ws, q) for ws, q in ps.ws_list if ws != websocket]


@app.get("/push_data")
async def get_data(message: str) -> str:
    message = json.loads(message)
    plot_message = PlotMessage(**message)
    ps.prepare_data(plot_message)
    await ps.send_next_message()
    return "data sent"


@app.get("/clear_data")
async def clear_data() -> str:
    await ps.clear_plots_and_queues()
    return "data cleared"
