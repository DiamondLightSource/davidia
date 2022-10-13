from __future__ import annotations

import datetime
import logging
import msgpack
import requests
import time

from dataclasses import asdict

from plot.custom_types import LineData, PlotMessage, ImageData


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
    headers = {'Content-Type': 'application/x-msgpack', 'Accept': 'application/x-msgpack'}
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

    response = requests.put(
        f'http://localhost:8000/clear_data/{plot_id}',
        headers={'Content-Type': 'application/json'},
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
    time_id = datetime.datetime.now().strftime('%Y%m%d%H%M%S')

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
    headers = {'Content-Type': 'application/x-msgpack', 'Accept': 'application/x-msgpack'}

    start_time = time.time()
    response = await requests.post(url, data=msg, headers=headers)
    end_time = time.time()

    logging.info(f"{points} plotted in {end_time - start_time}s with response status code is {response.status_code}.\n")

    return response


def line_demo(p):
    ld = LineData(id="whatever", colour="red", x=[5, 10, 15], y=[1.5, 4.5, 3.5], curve_type="OnlyLine")
    mp = PlotMessage(f"plot_{p}", "new_line_data", ld)
    plot_data(mp)

def multiline_demo(p):
    lds = []
    for i,c in enumerate(("red", "green", "blue")):
        lds.append(LineData(id=f"whatever_{i}", colour=c, x=[5, 10, 15], y=[(v + 0.2*i) for v in (1.5, 4.5, 3.5)], curve_type=("OnlyLine" if (i % 2 == 0) else "OnlyGlyphs")))
    mp = PlotMessage(f"plot_{p}", "new_multiline_data", lds)
    plot_data(mp)

def image_demo(p):
    d = ImageData(id="whatever", values=[5, 10, 15, 1.5, 4.5, 3.5], shape=[2,3], domain=[0, 20])
    mp = PlotMessage(f"plot_{p}", "new_image_data", d)
    plot_data(mp)


if __name__ == "__main__":
    from time import sleep
    WAIT=3
    p = 0
    for i in range(5):
        line_demo(p)
        sleep(WAIT)

        p = 1 - p
        clear_data(f"plot_{p}")
        image_demo(p)
        sleep(WAIT)

        p = 1 - p
        clear_data(f"plot_{p}")
        multiline_demo(p)
        sleep(WAIT)

        p = 1 - p
        clear_data(f"plot_{p}")
