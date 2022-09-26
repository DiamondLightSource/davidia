from __future__ import annotations

import json
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware  # comment this on deployment
from msgpack_asgi import MessagePackMiddleware
from queue import Queue
from starlette.routing import Mount


from plot.custom_types import MsgType, PlotMessage, StatusType
from plot.example_processor import ExampleProcessor
from plot.plotserver import PlotServer


app = FastAPI()
origins = ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins)  # comment this on deployment
app.add_middleware(MessagePackMiddleware)
ps = PlotServer(ExampleProcessor())

# serve client code built using `npm run build`
app.routes.append(Mount("/client", app=StaticFiles(directory="../build", html=True), name="webui"))

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
            print(f"current message is {message}")
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


@app.post("/push_data")
async def get_data(data: PlotMessage) -> str:
    ps.prepare_data(data)
    await ps.send_next_message()
    return "data sent"


@app.get("/clear_data")
async def clear_data() -> str:
    await ps.clear_plots_and_queues()
    return "data cleared"


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
