
import datetime
import requests
from dataclasses import asdict

from plot.custom_types import PlotMessage

from msgpack import packb as mp_packb

import logging

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

    x = [i for i in range(points)]
    y = [j % 10 for j in x]
    time_id = datetime.datetime.now().strftime(f"%Y%m%d%H%M%S")

    new_line = PlotMessage(
        plot_id="plot_0",
        type="new_line_data",
        params={
            "id": time_id,
            "colour": "purple",
            "x": x,
            "y": y,
            "curve_type": "OnlyLine",
        }
    )

    msg = mp_packb(asdict(new_line))
    url = 'http://localhost:8000/push_data'
    headers = {'Content-Type': 'application/x-msgpack', 'Accept': 'application/x-msgpack'}

    response = requests.post(url, data=msg, headers=headers)

    logging.info(f"{points} (size {len(msg)}b) plotted in {response.elapsed}s with response status code is {response.status_code}.\n")

    return response

if __name__ == "__main__":
    logging.getLogger().setLevel(logging.DEBUG)
    # more than 64 fails as msgpack-asgi middleware does not copy with requests containing more_body
    for i in (4, 16, 64, ):
        points = 1024 * i
        logging.info(f"Using {points} points:")
        benchmark_plotting(points)
