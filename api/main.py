from __future__ import annotations

import logging
import os.path

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware  # comment this on deployment
from fastapi.staticfiles import StaticFiles
from starlette.routing import Mount

from plot.custom_types import MsgType, PlotMessage, StatusType
from plot.fastapi_utils import message_unpack, ws_unpack
from plot.plotserver import PlotServer

app = FastAPI()
origins = ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins)  # comment this on deployment
ps = PlotServer()
app._plot_server = ps

# serve client code built using `npm run build`
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
build_dir = os.path.join(parent_dir, "build")
app.routes.append(
    Mount("/client", app=StaticFiles(directory=build_dir, html=True), name="webui")
)


@app.websocket("/plot/{plot_id}")
async def websocket(websocket: WebSocket, plot_id: str):
    """End point for plot server to web UI communication.

    PlotMessages are passed between client/server
    """
    await websocket.accept()
    client = ps.add_client(plot_id, websocket)

    try:
        while True:
            message = await websocket.receive()
            message = ws_unpack(message["bytes"])
            logging.debug(f"current message is {message}")
            received_message = PlotMessage.parse_obj(message)
            if received_message.type == MsgType.status:
                if received_message.params == StatusType.ready:
                    ps.client_status = StatusType.ready
                    await ps.send_next_message()

            else:
                ps.prepare_data(received_message)
                await ps.send_next_message()

    except WebSocketDisconnect:
        logging.error("Websocket disconnected:", exc_info=True)
        ps.remove_client(plot_id, client)


@app.post(
    "/push_data",
    openapi_extra={
        "requestBody": {
            "content": {
                "application/x-yaml": {"schema": PlotMessage.schema()},
            },
            "required": True,
        }
    },
)
@message_unpack
async def push_data(data: PlotMessage) -> str:
    """
    Push data to plot
    """
    ps.prepare_data(data)
    await ps.send_next_message()
    return "data sent"


@app.put("/clear_data/{plot_id}")
async def clear_data(plot_id: str) -> str:
    """
    Clear plot
    """
    await ps.clear_plots_and_queues(plot_id)
    return "data cleared"


@app.get("/get_plot_ids")
def get_plot_ids() -> list[str]:
    return ps.get_plot_ids()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
