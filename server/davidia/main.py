from __future__ import annotations

import logging
import os
import pathlib

import uvicorn
from davidia.models.messages import PlotMessage
from davidia.models.selections import AnySelection
from davidia.server.benchmarks import BenchmarkParams
from davidia.server.fastapi_utils import message_unpack
from davidia.server.plotserver import PlotServer, handle_client
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware  # comment this on deployment
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles

_PM_SCHEMA = PlotMessage.model_json_schema(
    ref_template="#/components/schemas/{model}", by_alias=True
)
_PM_NESTED_MODELS = _PM_SCHEMA.pop("$defs")

logger = logging.getLogger("main")

from davidia import __version__

def _create_bare_app(add_benchmark=False):
    app = FastAPI()

    def customize_openapi():
        if app.openapi_schema:
            return app.openapi_schema

        o_schema = get_openapi(title="Davidia API", version=__version__, routes=app.routes)
        o_schema["components"]["schemas"].update(_PM_NESTED_MODELS)
        app.openapi_schema = o_schema
        return o_schema

    app.openapi = customize_openapi
    origins = ["*"]
    app.add_middleware(
        CORSMiddleware, allow_origins=origins
    )  # comment this on deployment
    ps = PlotServer()
    setattr(app, "_plot_server", ps)

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

    if add_benchmark:

        @app.post("/benchmark/{plot_id}")
        async def benchmark(plot_id: str, params: BenchmarkParams) -> str:
            """
            Benchmark davidia
            """
            return await ps.benchmark(plot_id, params)

    return app


def _setup_logger():
    ch = logging.StreamHandler()
    ch.setFormatter(
        logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    )
    logger.addHandler(ch)
    logger.setLevel(logging.DEBUG)


def add_client_endpoint(app, client_path):
    index_path = client_path / "index.html"
    if index_path.is_file() and os.access(index_path, os.R_OK):
        logger.debug("Adding /client endpoint which uses %s", client_path)
        app.mount("/", StaticFiles(directory=client_path, html=True), name="webui")
    else:
        logger.warning(
            "%s not readable so '/' endpoint will not be available", index_path
        )


def find_client_build():
    dvd_pkg_dir = pathlib.Path(__file__).parent
    # example client packaged
    client_dir = dvd_pkg_dir / "client"
    if client_dir.is_dir():
        return client_dir
    # or developing in source tree
    client_dir = dvd_pkg_dir.parent / "example-client/sdist"
    if client_dir.is_dir():
        return client_dir
    logger.warning(
        "Client directory not found in %s (if developing, then build example app)",
        dvd_pkg_dir,
    )


CLIENT_BUILD_PATH = find_client_build()


def create_parser():
    from argparse import ArgumentParser, ArgumentDefaultsHelpFormatter, SUPPRESS

    CLIENT_BUILD_DIR = str(CLIENT_BUILD_PATH)
    parser = ArgumentParser(
        description="Davidia plot server", formatter_class=ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "-b", "--benchmark", help="Add /benchmark endpoint", action="store_true"
    )
    parser.add_argument(
        "-c",
        "--client",
        help=f"Add /client endpoint using given build directory (or '{CLIENT_BUILD_DIR}')",
        nargs="?",
        const=CLIENT_BUILD_DIR,
        default=SUPPRESS,
    )
    parser.add_argument(
        "-H", "--host", help="Set the host address for server", default="127.0.0.1"
    )
    parser.add_argument(
        "-P", "--port", help="Set the port number for server", type=int, default=80
    )
    return parser


def create_app(client_path=CLIENT_BUILD_PATH, benchmark=False):
    _setup_logger()
    app = _create_bare_app(
        benchmark or os.getenv("DVD_BENCHMARK", "off").lower() == "on"
    )
    if client_path:
        if client_path.is_dir():
            add_client_endpoint(app, client_path)
    return app


def run_app(
    client_path=CLIENT_BUILD_PATH, benchmark=False, host="127.0.0.1", port=80
):
    app = create_app(client_path=client_path, benchmark=benchmark)
    uvicorn.run(app, host=host, port=port, log_level="info", access_log=False)


def main():
    args = create_parser().parse_args()
    client_path = getattr(args, "client", None)
    run_app(
        client_path=pathlib.Path(client_path) if client_path else None,
        benchmark=args.benchmark,
        host=args.host,
        port=args.port,
    )


if __name__ == "__main__":
    main()
