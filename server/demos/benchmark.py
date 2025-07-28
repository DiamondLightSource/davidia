import logging

import requests
from davidia.server.benchmarks import BENCHMARK_HELP, BenchmarkParams, PlotType

logger = logging.getLogger("benchmark")


def start_benchmark(
    params: BenchmarkParams,
    plot_id: str = "plot_0",
    host: str = "127.0.0.1",
    port: int = 8000,
) -> requests.Response:
    """Start benchmark

    Parameters
    ----------
    params: BenchmarkParams
    plot_id: str

    Returns
    -------
    response: Response
        Response from push_data POST request
    """

    url = f"http://{host}:{port}/benchmark/{plot_id}"
    logger.debug("Sending POST to %s: %s", url, params)
    response = requests.post(url, data=params.model_dump_json())

    logger.debug(
        f"{params} plotted in {response.elapsed}s with response"
        f" status code is {response.status_code}.\n"
    )

    return response


def create_parser():
    from argparse import ArgumentParser, ArgumentDefaultsHelpFormatter

    parser = ArgumentParser(
        description="Benchmark plotting client",
        formatter_class=ArgumentDefaultsHelpFormatter,
    )
    plot_types = list(p.name for p in PlotType)
    parser.add_argument("-i", "--id", help="Plot ID", default="plot_0")
    parser.add_argument(
        "-t", "--type", help="Plot type", choices=plot_types, default=plot_types[0]
    )
    parser.add_argument(
        "-r", "--repetitions", help="Number of repeats", type=int, default=1
    )
    parser.add_argument(
        "-p",
        "--pause",
        help="Period to pause between changes (in seconds)",
        type=float,
        default=0.2,
    )
    parser.add_argument(
        "-H", "--host", help="Set the host address for server", default="127.0.0.1"
    )
    parser.add_argument(
        "-P", "--port", help="Set the port number for server", type=int, default=8000
    )
    plot_help = [
        f"{n}: {h}"
        for n, h in ((p.name, BENCHMARK_HELP.get(p, None)) for p in PlotType)
        if h is not None
    ]
    parser.add_argument("params", nargs="*", help="; ".join(plot_help), type=float)
    return parser


def main():
    args = create_parser().parse_args()
    response = start_benchmark(
        BenchmarkParams(
            plot_type=args.type,
            params=args.params,
            iterations=args.repetitions,
            pause=args.pause,
        ),
        plot_id=args.id,
        host=args.host,
        port=args.port,
    )
    print(f"{response.status_code}: {response.content.decode()}")


if __name__ == "__main__":
    logger.setLevel(logging.DEBUG)
    main()
