from __future__ import annotations

import logging
import numpy as np
import requests

from numpy.typing import ArrayLike
from time import time_ns
from typing import Union

from plot.custom_types import (
    asdict,
    HeatmapData,
    ImageData,
    LineData,
    MsgType,
    PlotMessage,
)
from plot.fastapi_utils import j_loads, j_dumps, mp_packb


OptionalArrayLike = ArrayLike | None
OptionalLists = Union[OptionalArrayLike, list[OptionalArrayLike], None]


class PlotConnection:
    def __init__(self, plot_id, host="localhost", port=8000, use_msgpack=True):
        self.plot_id = plot_id
        self.host = host
        self.port = port
        self.url_prefix = f"http://{host}:{port}/"
        self.use_msgpack = use_msgpack

    def _prepare_request(self, data):
        if data is None:
            return None, None
        if self.use_msgpack:
            data = mp_packb(asdict(data))
            return data, {
                "Content-Type": "application/x-msgpack",
            }
        data = j_dumps(asdict(data))
        return data, None

    def _post(self, params, msg_type=MsgType.new_multiline_data, endpoint="push_data"):
        url = self.url_prefix + endpoint
        data = PlotMessage(plot_id=self.plot_id, type=msg_type, params=params)
        start = time_ns()
        data, headers = self._prepare_request(data)
        resp = requests.post(url, data=data, headers=headers)
        elapsed = (time_ns() - start) // 1000000
        logging.info(f"plot_server.post {resp.status_code}, {elapsed}ms")
        return resp

    def _put(self, data, endpoint):
        url = self.url_prefix + endpoint
        start = time_ns()
        data, headers = self._prepare_request(data)
        resp = requests.put(url, data=data, headers=headers)
        elapsed = (time_ns() - start) // 1000000
        logging.info(f"plot_server.put {resp.status_code}, {elapsed}ms")
        return resp

    def _get(self, endpoint):
        url = self.url_prefix + endpoint
        start = time_ns()
        resp = requests.get(url)
        elapsed = (time_ns() - start) // 1000000
        logging.info(f"plot_server.get {resp.status_code}, {elapsed}ms")
        return resp

    def get_plots_ids(self):
        return j_loads(self._get("get_plot_ids").content)

    @staticmethod
    def _as_list(item_list, n):
        if isinstance(item_list, list):
            n_items = len(item_list)
            if n_items < n:
                logging.warning(f"Supplied list is too short {n_items} cf {n}")
                return item_list * (n // n_items) + item_list[: (n % n_items)]
            return item_list
        return [item_list] * n

    def line(
        self,
        x: OptionalLists,
        y: OptionalLists = None,
        title: Union[str, None] = None,
        **attribs,
    ):
        """Plot line

        Parameters
        ----------
        x: x (or y if y not given) array
        y: y array (if x given)
        title: title of plot
        attribs: dict of attributes for plot

        Returns
        -------
        response: Response
            Response from push_data POST request
        """
        if y is None:
            y = x
            x = None
        if y is None:
            return

        if "line_on" not in attribs:
            attribs["line_on"] = True

        if isinstance(y[0], (list, np.ndarray)):
            n_plots = len(y)
            if x is None:
                x = [[]] * n_plots
            elif not isinstance(x[0], (list, np.ndarray)):
                x = [x] * n_plots

            global_attribs = dict(attribs)
            lines_on = PlotConnection._as_list(global_attribs.pop("line_on"), n_plots)
            if "color" in attribs:
                colors = PlotConnection._as_list(global_attribs.pop("color"), n_plots)
            else:
                colors = [None] * n_plots
            if "point_size" in attribs:
                point_sizes = PlotConnection._as_list(
                    global_attribs.pop("point_size"), n_plots
                )
            else:
                colors = [None] * n_plots
            lds = [
                LineData(
                    key="",
                    x=np.asanyarray(xi),
                    y=np.asanyarray(yi),
                    color=ci,
                    line_on=li,
                    point_size=ps,
                    **global_attribs,
                )
                for xi, yi, ci, li, ps in zip(x, y, colors, lines_on, point_sizes)
            ]
        else:
            lds = [LineData(key="", x=np.asanyarray(x), y=np.asanyarray(y), **attribs)]
        return self._post(lds)

    def image(
        self,
        image: OptionalLists,
        x: OptionalArrayLike = None,
        y: OptionalArrayLike = None,
        title: Union[str, None] = None,
        **attribs,
    ):
        """Plot image

        Parameters
        ----------
        image: array
        x: x array
        y: y array
        title: title of plot
        Returns
        -------
        response: Response
            Response from push_data POST request
        """
        values = np.asanyarray(image)
        if "domain" in attribs and values.ndim == 2:
            im = HeatmapData(key="", values=values, **attribs)
        elif values.ndim == 3 and values.shape[2] == 3:
            im = ImageData(key="", values=values, **attribs)
        else:
            raise ValueError(f"Data cannot be interpreted as heatmap or image data")
        return self._post(im, msg_type=MsgType.new_image_data)

    def clear(self) -> requests.Response:
        """Sends request to clear a plot

        Parameters
        ----------
        plot_id : str
            the plot to clear

        Returns
        -------
        response: Response
            Response from clear_data GET request
        """
        return self._put(None, f"clear_data/{self.plot_id}")


_ALL_PLOTS: dict[str, PlotConnection] = dict()
_DEF_PLOT_ID = None


def get_plot_connection(plot_id="", host="localhost", port=8000):
    """Get a connection to plot server that has plot with given ID

    Parameters
    ----------
    plot_id : str
        if empty then creates a connection
    host : str
        name or IP of plot server
    port : int
        port number of plot server
    Returns
    -------
        instance of PlotConnection

    Side effects
    ------------
    Populates a global dict/cache that maps plot ID to connection
    Sets default plot ID from given plot ID or first ID on server
    """
    if plot_id and plot_id in _ALL_PLOTS:
        return _ALL_PLOTS[plot_id]
    pc = PlotConnection(plot_id, host, port)
    ids = pc.get_plots_ids()
    if len(ids) == 0:
        raise ValueError("Plot connection has no plots")
    if plot_id and plot_id not in ids:
        raise ValueError(f"Plot connection does not contain {plot_id}")

    global _DEF_PLOT_ID
    if plot_id:
        if plot_id in _ALL_PLOTS and pc is not _ALL_PLOTS[plot_id]:
            logging.warning(
                f"Plot ID {plot_id} already exists in another connection, replacing"
                " with new connection"
            )
        _DEF_PLOT_ID = plot_id
    else:
        _DEF_PLOT_ID = ids[0]
        pc = PlotConnection(_DEF_PLOT_ID, host, port)
    _ALL_PLOTS[_DEF_PLOT_ID] = pc
    return pc


def set_default_plot_id(plot_id: str):
    if not plot_id:
        raise ValueError("Plot ID must not be None or empty")
    get_plot_connection(plot_id)


def _get_default_plot_id(plot_id=None):
    if plot_id:
        return plot_id
    if _DEF_PLOT_ID is None:
        get_plot_connection()
        return _DEF_PLOT_ID
    return _DEF_PLOT_ID


def line(
    x: OptionalLists,
    y: OptionalLists = None,
    title: Union[str, None] = None,
    plot_id: Union[str, None] = None,
    **attribs,
):
    """Plot line

    Parameters
    ----------
    x: x (or y if y not given) array
    y: y array (if x given)
    title: title of plot
    plot_id: ID of plot where line is added
    **attribs: keywords specific to line
    """
    plot_id = _get_default_plot_id(plot_id)
    pc = get_plot_connection(plot_id)
    pc.line(x, y, title, **attribs)


def image(
    values: OptionalLists,
    x: OptionalArrayLike = None,
    y: OptionalArrayLike = None,
    title: Union[str, None] = None,
    plot_id: Union[str, None] = None,
    **attribs,
):
    """Plot image

    Parameters
    ----------
    values: array
    x: x array
    y: y array
    title: title of plot
    plot_id : str
        the plot from which to clear data
    **attribs: keywords specific to image
    Returns
    -------
    response: Response
        Response from push_data POST request
    """
    plot_id = _get_default_plot_id(plot_id)
    pc = get_plot_connection(plot_id)
    pc.image(values, x, y, title, **attribs)


def clear(plot_id: Union[str, None] = None):
    """Sends request to clear a plot

    Parameters
    ----------
    plot_id : str
        the plot from which to clear data

    Returns
    -------
    response: Response
        Response from clear_data GET request
    """
    plot_id = _get_default_plot_id(plot_id)
    pc = get_plot_connection(plot_id)
    pc.clear()

    response = requests.put(
        f"http://localhost:8000/clear_data/{plot_id}",
        headers={"Content-Type": "application/json"},
    )
    return response
