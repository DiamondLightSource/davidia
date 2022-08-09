import json

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware #comment this on deployment

from plot.example_processor import ExampleProcessor
from plot.plotserver import PlotServer


app = FastAPI()
origins = ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins) #comment this on deployment
ps = PlotServer(ExampleProcessor())

@app.websocket("/status")
async def websocket(websocket: WebSocket):
    ps.ws_list.append(websocket)
    await websocket.accept()
    while True:
        message = await websocket.receive_text()
        message = json.loads(message)
        if message["type"] == 'status':
            if message["text"] == 'ready':
                await ps.send_next_message()

        elif message["type"] == 'data_request':
            ps.prepare_data(message)
            await ps.send_next_message()


@app.get("/push_data")
async def get_data(data: str):
    data = json.loads(data)
    ps.prepare_data(data)
    await ps.send_next_message()
    return "data sent"
