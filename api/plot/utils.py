from __future__ import annotations

import datetime
import msgpack
import requests
import time

from dataclasses import asdict

from plot.custom_types import PlotMessage


def plot_data(msg: PlotMessage) -> requests.Response:
    """Sends request to plot data

    Parameters
    ----------
    msg : PlotMessage
        Message containing data to plot

    Returns
    -------
    response: Response
        Response from push_data POST request
    """

    msg = msgpack.packb(asdict(msg), use_bin_type=True)
    headers = {'content-type': 'application/x-msgpack', 'accept': 'application/x-msgpack'}
    response = requests.post('http://localhost:8000/push_data', data=msg, headers=headers)
    return response


def clear_data(plot_id: str) -> requests.Response:
    """Sends request to clear a plot

    Parameters
    ----------
    plot_id : str
        The plot of which data is to be cleared

    Returns
    -------
    response: Response
        Response from clear_data GET request
    """

    response = requests.get(
        f'http://localhost:8000/clear_data/{plot_id}',
        headers={'Content-type': 'application/json'},
        auth=('user', 'pass')
        )
    return response


async def benchmark_plotting(points: int) -> requests.Response:
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
        type="new_line_data",
        params={
            "plot_id": "0",
            "id": time_id,
            "colour": "purple",
            "x": x,
            "y": y}
        )

    msg = msgpack.packb(asdict(new_line), use_bin_type=True)
    url = 'http://localhost:8000/push_data'
    headers = {'content-type': 'application/x-msgpack', 'accept': 'application/x-msgpack'}

    start_time = time.time()
    response = await requests.post(url, data=msg, headers=headers, auth=('user', 'pass'))
    end_time = time.time()

    print(f"{points} plotted in {end_time - start_time}s with response status code is {response.status_code}.\n")

    return response
