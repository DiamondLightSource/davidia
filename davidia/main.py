from __future__ import annotations

import logging
import os.path

import uvicorn
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware  # comment this on deployment
from fastapi.staticfiles import StaticFiles
from starlette.routing import Mount

from davidia.models.messages import PlotMessage
from davidia.server.benchmarks import BenchmarkParams
from davidia.models.selections import AnySelection
from davidia.server.fastapi_utils import message_unpack
from davidia.server.plotserver import PlotServer, handle_client

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

logger = logging.getLogger("main")


@app.websocket("/plot/{uuid}/{plot_id}")
async def websocket(websocket: WebSocket, uuid: str, plot_id: str):
    """End point for plot server to web UI communication.

    PlotMessages are passed between client/server
    """
    await websocket.accept()
    await handle_client(ps, plot_id, websocket, uuid)


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
    await ps.prepare_data(data)
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


@app.get("/get_regions/{plot_id}")
async def get_regions(plot_id: str) -> list[AnySelection]:
    return await ps.get_regions(plot_id)


def _setup_logger():
    ch = logging.StreamHandler()
    ch.setFormatter(
        logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    )
    logger.addHandler(ch)
    logger.setLevel(logging.DEBUG)


def add_benchmark_endpoint():
    @app.post("/benchmark/{plot_id}")
    async def benchmark(plot_id: str, params: BenchmarkParams) -> str:
        """
        Benchmark davidia
        """
        return await ps.benchmark(plot_id, params)


def create_parser():
    from argparse import ArgumentParser

    parser = ArgumentParser(description="Davidia plot server")
    parser.add_argument(
        "-b", "--benchmark", help="Add /benchmark endpoint", action="store_true"
    )
    return parser


if __name__ == "__main__":
    _setup_logger()
    args = create_parser().parse_args()
    if args.benchmark or os.getenv("DVD_BENCHMARK", "off").lower() == "on":
        add_benchmark_endpoint()

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info", access_log=False)
