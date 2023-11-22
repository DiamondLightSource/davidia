from __future__ import annotations

import logging
import os
import pathlib

import uvicorn
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware  # comment this on deployment
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles

from davidia.models.messages import PlotMessage
from davidia.server.benchmarks import BenchmarkParams
from davidia.models.selections import AnySelection
from davidia.server.fastapi_utils import message_unpack
from davidia.server.plotserver import PlotServer, handle_client


_PM_SCHEMA = PlotMessage.model_json_schema(
    ref_template="#/components/schemas/{model}"
)
_PM_NESTED_MODELS = _PM_SCHEMA.pop("$defs")


app = FastAPI()


def customize_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    o_schema = get_openapi(title="FastAPI", version="0.1.0", routes=app.routes)
    o_schema["components"]["schemas"].update(_PM_NESTED_MODELS)
    app.openapi_schema = o_schema
    return o_schema


app.openapi = customize_openapi

origins = ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins)  # comment this on deployment
ps = PlotServer()
setattr(app, "_plot_server", ps)

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
                "application/x-yaml": {"schema": _PM_SCHEMA},
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

def add_client_endpoint(client_path):
    logging.debug("Adding /client endpoint which uses %s", client_path)
    app.mount("/client", StaticFiles(directory=client_path, html=True), name="webui")


def create_parser():
    from argparse import ArgumentParser, ArgumentDefaultsHelpFormatter, SUPPRESS

    parser = ArgumentParser(description="Davidia plot server", formatter_class=ArgumentDefaultsHelpFormatter)
    parser.add_argument(
        "-b", "--benchmark", help="Add /benchmark endpoint", action="store_true"
    )
    parser.add_argument(
        "-c", "--client", help="Add /client endpoint using given directory (or 'dist')", nargs='?', const='dist', default=SUPPRESS
    )
    return parser


if __name__ == "__main__":
    _setup_logger()
    args = create_parser().parse_args()
    if 'client' in args and args.client:
        client_path = pathlib.Path(args.client)
        if not client_path.is_dir():
            raise ValueError(f"{client_path} must be a directory")
        index_path = client_path / "index.html"
        if index_path.is_file() and os.access(index_path, os.R_OK):
            add_client_endpoint(client_path)
        else:
            logging.warning("%s not readable so `/client` endpoint will not be available", index_path)

    if args.benchmark or os.getenv("DVD_BENCHMARK", "off").lower() == "on":
        add_benchmark_endpoint()


    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info", access_log=False)
