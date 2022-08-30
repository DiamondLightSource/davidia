import json

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware  # comment this on deployment

from plot.custom_types import MsgType, PlotMessage, StatusType
from plot.example_processor import ExampleProcessor
from plot.plotserver import PlotServer


app = FastAPI()
origins = ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins)  # comment this on deployment
ps = PlotServer(ExampleProcessor())


@app.websocket("/status")
async def websocket(websocket: WebSocket):
    ps.ws_list.append(websocket)
    i = 0
    await websocket.accept()
    while True:
        message = await websocket.receive_text()
        message = json.loads(message)
        received_message = PlotMessage(**message)

        if received_message.type == MsgType.status:
            if StatusType[received_message.params['status']] == StatusType.ready:
                ps.client_status = StatusType.ready
                j = await ps.send_next_message(i)
                if j:
                    i = j

        else:
            ps.prepare_data(received_message)
            j = await ps.send_next_message(i)
            if j:
                i = j


@app.get("/push_data")
async def get_data(message: str) -> str:
    message = json.loads(message)
    plot_message = PlotMessage(**message)
    ps.prepare_data(plot_message)
    await ps.send_next_message(-1)
    return "data sent"
