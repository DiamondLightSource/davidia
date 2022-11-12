import datetime
import logging

import numpy as np
import requests

from plot.custom_types import PlotMessage
from plot.fastapi_utils import ws_pack


def benchmark_plotting(points: int) -> requests.Response:
    """Sends request to plot data and prints time taken

    Parameters
    ----------
    points : int
        Number of points to plot

    Returns
    -------
    response: Response
        Response from push_data POST request
    """

    x = np.array([i for i in range(points)]).astype(np.int32)
    y = np.array([j % 10 for j in x]).astype(np.float64)
    time_id = datetime.datetime.now().strftime("%Y%m%d%H%M%S")

    new_line = PlotMessage(
        plot_id="plot_0",
        type="new_multiline_data",
        params=[
            {
                "key": time_id,
                "color": "purple",
                "x": x,
                "y": y,
                "line_on": True,
            }
        ],
    )

    msg = ws_pack(new_line)
    url = "http://localhost:8000/push_data"
    headers = {
        "Content-Type": "application/x-msgpack",
        "Accept": "application/x-msgpack",
    }

    response = requests.post(url, data=msg, headers=headers)

    logging.info(
        f"{points} (size {len(msg)}b) plotted in {response.elapsed}s with response"
        f" status code is {response.status_code}.\n"
    )

    return response


if __name__ == "__main__":
    logging.getLogger().setLevel(logging.DEBUG)
    for i in (4, 16, 64, 256, 1024):
        points = 1024 * i
        logging.info(f"Using {points} points:")
        benchmark_plotting(points)
