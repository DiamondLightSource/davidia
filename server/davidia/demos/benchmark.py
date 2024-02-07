import logging

import requests
from davidia.server.benchmarks import BENCHMARK_HELP, BenchmarkParams, PlotType

logger = logging.getLogger("benchmark")


def start_benchmark(
    params: BenchmarkParams, plot_id: str = "plot_0"
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

    url = f"http://localhost:8000/benchmark/{plot_id}"

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
    parser.add_argument(
        "-t", "--type", help="Plot type", choices=plot_types, default=plot_types[0]
    )
    parser.add_argument(
        "-r", "--repetitions", help="Number of repeats", type=int, default=1
    )
    parser.add_argument(
        "-p",
        "--pause",
        help="Period to pause between changes (in seconds, default=0.2)",
        type=float,
        default=0.2,
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
        )
    )
    print(f"{response.status_code}: {response.content.decode()}")


if __name__ == "__main__":
    logging.getLogger().setLevel(logging.DEBUG)
    main()
