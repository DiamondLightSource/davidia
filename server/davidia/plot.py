"""colourMap str options are listed in INTERPOLATORS in h5web https://github.com/silx-kit/h5web/blob/main/packages/lib/src/vis/heatmap/interpolators.ts
ScaleType enum options are linear, log, symlog, sqrt, gamma
"""

from __future__ import annotations

import logging
import warnings
from time import time_ns
from typing import Any

import numpy as np
import requests
from davidia.models.messages import (
    ClearSelectionsMessage,
    ColourMap,
    GlyphType,
    HeatmapData,
    ImageData,
    LineData,
    LineParams,
    MsgType,
    PlotMessage,
    ScaleType,
    ScatterData,
    SelectionsMessage,
    SurfaceData,
    TableData,
    UpdateSelectionsMessage,
)
from davidia.models.parameters import PlotConfig, TableDisplayParams, TableDisplayType
from davidia.models.selections import (
    AnySelection,
    AxialSelection,
    CircularSectorialSelection,
    CircularSelection,
    EllipticalSelection,
    LinearSelection,
    PolygonalSelection,
    RectangularSelection,
)
from davidia.server.fastapi_utils import j_dumps, j_loads, ws_pack
from numpy.typing import ArrayLike

OptionalArrayLike = ArrayLike | None
OptionalLists = OptionalArrayLike | list[OptionalArrayLike] | None

Selections = AnySelection | list[AnySelection]


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
            data = ws_pack(data)
            return data, {
                "Content-Type": "application/x-msgpack",
            }
        data = j_dumps(data)
        return data, None

    def _post(
        self,
        params,
        msg_type=MsgType.new_multiline_data,
        plot_config=None,
        endpoint="push_data",
    ):
        url = self.url_prefix + endpoint
        data = PlotMessage(
            plot_id=self.plot_id, type=msg_type, params=params, plot_config=plot_config
        )
        logging.debug("posting PM: %s", data)
        start = time_ns()
        data, headers = self._prepare_request(data)
        resp = requests.post(url, data=data, headers=headers)
        elapsed = (time_ns() - start) // 1000000
        logging.info("plot_server.post %d, %dms", resp.status_code, elapsed)
        return resp

    def _put(self, data, endpoint):
        url = self.url_prefix + endpoint
        start = time_ns()
        data, headers = self._prepare_request(data)
        resp = requests.put(url, data=data, headers=headers)
        elapsed = (time_ns() - start) // 1000000
        logging.info("plot_server.put %d, %dms", resp.status_code, elapsed)
        return resp

    def _get(self, endpoint):
        url = self.url_prefix + endpoint
        start = time_ns()
        resp = requests.get(url)
        elapsed = (time_ns() - start) // 1000000
        logging.info("plot_server.get %d, %dms", resp.status_code, elapsed)
        return resp

    def get_plots_ids(self) -> list[str]:
        ids = j_loads(self._get("get_plot_ids").content)
        if isinstance(ids, list):
            return ids
        logging.warning("Fetched values not a list (%s): %s", type(ids), ids)
        return []

    @staticmethod
    def _as_list(item_list, n):
        if isinstance(item_list, list):
            n_items = len(item_list)
            if n_items < n:
                logging.warning("Supplied list is too short: %d cf %d", n_items, n)
                return item_list * (n // n_items) + item_list[: (n % n_items)]
            return item_list
        return [item_list] * n

    @staticmethod
    def _populate_plot_config(
        plot_config: dict[str, Any] | None,
        x: OptionalArrayLike = None,
        y: OptionalArrayLike = None,
    ) -> PlotConfig:
        plot_config = dict(plot_config) if plot_config is not None else {}

        if hasattr(plot_config, "x_values"):
            plot_config["x_values"] = np.asanyarray(plot_config["x_values"])
        if x is not None:
            plot_config["x_values"] = np.asanyarray(x)
        if hasattr(plot_config, "y_values"):
            plot_config["y_values"] = np.asanyarray(plot_config["y_values"])
        if y is not None:
            plot_config["y_values"] = np.asanyarray(y)
        return PlotConfig.model_validate(plot_config)

    def line(
        self,
        x: OptionalLists,
        y: OptionalLists = None,
        plot_config: dict[str, Any] | None = None,
        append: bool = False,
        **attribs,
    ):
        """Plot line

        Parameters
        ----------
        x: x (or y if y not given) array
        y: y array (if x given)
        plot_config: plot config
        append: add line to existing multiline plot
        attribs: dict of attributes for plot

        Returns
        -------
        response: Response
            Response from push_data POST request
        """
        if y is None:
            xf = None
            yf = x
        else:
            xf = x
            yf = y
        if yf is None:
            return

        if append:
            msg_type = MsgType.append_line_data
        else:
            msg_type = MsgType.new_multiline_data

        def _asanyarray(x):
            return x if x is None else np.asanyarray(x)

        global_attribs = dict(attribs)
        line_on = global_attribs.pop("line_on", True)
        glyph_type = global_attribs.pop("glyph_type", None)
        glyph_type = (
            glyph_type
            if glyph_type is None or isinstance(glyph_type, GlyphType)
            else GlyphType[glyph_type]
        )
        colour = global_attribs.pop("colour", None)
        point_size = global_attribs.pop("point_size", None)

        if isinstance(yf, list) and isinstance(yf[0], (list, np.ndarray)):
            n_plots = len(yf)
            xl: list[OptionalArrayLike] = []
            if xf is None:
                xl = [[]] * n_plots
            elif isinstance(xf, np.ndarray):
                xl = [xf] * n_plots
            elif isinstance(xf, list):
                if isinstance(xf[0], (list, np.ndarray)):
                    n_x = len(xf)
                    if n_x == 1:
                        xl = [_asanyarray(xf[0])] * n_plots
                    elif n_x < n_plots:
                        raise ValueError("Number of x arrays must be match y arrays")
                    else:
                        xl = [_asanyarray(xi) for xi in xf]
                else:
                    xl = [_asanyarray(xf)] * n_plots

            lines_on = PlotConnection._as_list(line_on, n_plots)
            glyph_types = PlotConnection._as_list(glyph_type, n_plots)
            glyph_types = [
                g if g is None or isinstance(g, GlyphType) else GlyphType[g]
                for g in glyph_types
            ]
            colours = PlotConnection._as_list(colour, n_plots)
            point_sizes = PlotConnection._as_list(point_size, n_plots)
            plot_config = PlotConnection._populate_plot_config(plot_config)
            lds = []
            for xi, yi, ci, li, ps, gt in zip(
                xl, yf, colours, lines_on, point_sizes, glyph_types
            ):
                if yi is None:
                    raise ValueError("The y data must not contain None")
                line_params = LineParams(
                    colour=ci,
                    line_on=li,
                    point_size=ps,
                    glyph_type=gt,
                )

                lds.append(
                    LineData(
                        line_params=line_params,
                        x=_asanyarray(xi),
                        y=_asanyarray(yi),
                        **global_attribs,
                    )
                )
        else:
            lds = [
                LineData(
                    line_params=LineParams(
                        colour=colour,
                        line_on=line_on,
                        point_size=point_size,
                        glyph_type=glyph_type,
                    ),
                    x=_asanyarray(xf),
                    y=_asanyarray(yf),
                    **global_attribs,
                )
            ]
        return self._post(lds, msg_type=msg_type, plot_config=plot_config)

    def image(
        self,
        image: OptionalLists,
        x: OptionalArrayLike = None,
        y: OptionalArrayLike = None,
        plot_config: dict[str, Any] | None = None,
        **attribs,
    ):
        """Plot image

        Parameters
        ----------
        image: array
        x: x array
        y: y array
        plot_config: plot config
        Returns
        -------
        response: Response
            Response from push_data POST request
        """
        values = np.asanyarray(image)
        if values.ndim == 2:
            if "domain" not in attribs:
                attribs["domain"] = values.min(), values.max()
            im = HeatmapData(values=values, **attribs)
        elif values.ndim == 3 and values.shape[2] == 3:
            im = ImageData(values=values, **attribs)
        else:
            raise ValueError("Data cannot be interpreted as heatmap or image data")
        plot_config = PlotConnection._populate_plot_config(plot_config, x, y)
        return self._post(im, msg_type=MsgType.new_image_data, plot_config=plot_config)

    def scatter(
        self,
        x: ArrayLike,
        y: ArrayLike,
        point_values: OptionalLists,
        domain: tuple[float, float],
        plot_config: dict[str, Any] | None = None,
        **attribs,
    ):
        """Plot scatter data
        Parameters
        ----------
        x: x coordinates
        y: y coordinates
        point_values: array
        domain: tuple
        plot_config: plot config
        Returns
        -------
        response: Response
            Response from push_data POST request
        """
        sc = ScatterData(
            x=np.asanyarray(x),
            y=np.asanyarray(y),
            point_values=np.asanyarray(point_values),
            domain=domain,
            **attribs,
        )
        plot_config = PlotConnection._populate_plot_config(plot_config)
        return self._post(
            sc, msg_type=MsgType.new_scatter_data, plot_config=plot_config
        )

    def surface(
        self,
        values: OptionalLists,
        domain: tuple[float, float],
        x: OptionalArrayLike = None,
        y: OptionalArrayLike = None,
        plot_config: dict[str, Any] | None = None,
        **attribs,
    ):
        """Plot surface

        Parameters
        ----------
        values: array
        x: x array
        y: y array
        domain: tuple
        plot_config: plot config
        Returns
        -------
        response: Response
            Response from push_data POST request
        """
        su = SurfaceData(height_values=np.asanyarray(values), domain=domain, **attribs)
        plot_config = PlotConnection._populate_plot_config(plot_config, x, y)
        return self._post(
            su, msg_type=MsgType.new_surface_data, plot_config=plot_config
        )

    def table(
        self,
        data: OptionalLists,
        cell_width: int,
        display_style: TableDisplayType | None = None,
        number_digits: int | None = None,
        title: str | None = None,
        **attribs,
    ):
        """Show table of data

        Parameters
        ----------
        data: array
        cell_width: int
        display_style: notation type for displaying data
        number_digits: number significant or fractional digits to display
        title: title of plot
        Returns
        -------
        response: Response
            Response from push_data POST request
        """
        ta = TableData(
            cell_values=np.asanyarray(data),
            cell_width=cell_width,
            display_params=TableDisplayParams(
                display_type=display_style, number_digits=number_digits
            ),
            **attribs,
        )
        return self._post(ta, msg_type=MsgType.new_table_data)

    def clear(self) -> requests.Response:
        """Sends request to clear a plot

        Returns
        -------
        response: Response
            Response from clear_data GET request
        """
        return self._put(None, f"clear_data/{self.plot_id}")

    def region(
        self,
        selections: Selections | None,
        update: bool = False,
        delete: bool | str | list[str] = False,
    ):
        """Get, set or delete regions of selection

        Parameters
        ----------
        selections : Selections | None
            a selection or list of selections to set or None to get them
        update : bool
            update or add to existing selections
        delete : bool | str | list[str]
            True - remove given selections or all selections if None given
            str | list - remove selection(s) with given ID(s)

        Returns
        -------
        response: Response
            Response from push_data POST request
        """
        if selections is None and delete is False:
            return j_loads(self._get(f"get_regions/{self.plot_id}").content)

        if selections and not isinstance(selections, (tuple, list)):
            selections = [selections]

        if delete:
            if isinstance(delete, str):
                remove = [delete]
            elif isinstance(delete, (tuple, list)):
                remove = list(delete)
            elif selections is None:
                remove = []
            else:
                remove = [s.id for s in selections]
            msg_type = MsgType.clear_selection_data
            sm = ClearSelectionsMessage(selection_ids=remove)
        elif update and selections is not None:
            msg_type = MsgType.update_selection_data
            sm = UpdateSelectionsMessage(update_selections=selections)
        elif selections is not None:
            msg_type = MsgType.new_selection_data
            sm = SelectionsMessage(set_selections=selections)
        else:
            raise ValueError("Should not be reached")
        return self._post(sm, msg_type=msg_type)


_ALL_PLOTS: dict[str, PlotConnection] = dict()
_DEF_PLOT_ID = None

_DEF_PS_HOST = "localhost"
_DEF_PS_PORT = 8000


def set_default_plot_server(host: str, port: int):
    """Set default host and port for plot server

    Parameters
    ----------
    host : str
        host as IP address or name
    port : int
        port number
    """
    global _DEF_PS_HOST, _DEF_PS_PORT
    _DEF_PS_HOST = host
    _DEF_PS_PORT = port


def get_plot_connection(plot_id="", host=None, port=None):
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

    if host is None:
        host = _DEF_PS_HOST
    if port is None:
        port = _DEF_PS_PORT
    pc = PlotConnection(plot_id, host, port)
    ids = pc.get_plots_ids()
    if len(ids) == 0:
        raise ValueError("Plot connection has no plots")
    if plot_id and plot_id not in ids:
        warnings.warn(f"Plot connection does not contain {plot_id}", Warning)

    global _DEF_PLOT_ID
    if plot_id:
        if plot_id in _ALL_PLOTS and pc is not _ALL_PLOTS[plot_id]:
            logging.warning(
                "Plot ID %s already exists in another connection, replacing"
                " with new connection",
                plot_id,
            )
        _DEF_PLOT_ID = plot_id
    else:
        _DEF_PLOT_ID = ids[0]
        pc = PlotConnection(_DEF_PLOT_ID, host, port)
    _ALL_PLOTS[_DEF_PLOT_ID] = pc
    return pc


def set_default_plot_id(plot_id: str | None):
    if not plot_id:
        raise ValueError("Plot ID must not be None or empty")
    get_plot_connection(plot_id)


def _get_default_plot_id(plot_id: str | None = None):
    if plot_id:
        return plot_id
    if _DEF_PLOT_ID is None:
        get_plot_connection()
        if _DEF_PLOT_ID is None:
            raise ValueError("No default plot ID - please specify as parameter")
    return _DEF_PLOT_ID


def line(
    x: OptionalLists,
    y: OptionalLists = None,
    plot_config: dict[str, Any] | None = None,
    plot_id: str | None = None,
    append: bool = False,
    **attribs,
):
    """Plot line

    Parameters
    ----------
    x: x (or y if y not given) array
    y: y array (if x given)
    plot_config: plot config
    plot_id: ID of plot where line is added
    append: add line to existing multiline plot
    **attribs: keywords specific to line
    Keyword options for attribs are
    {
        "name": str
        "colour": str | None  # str is a CSS color value https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
        "line_on": bool
        "point_size": int | None
        "glyph_type": str | GlyphType  # enum options are Circle, Cross, Square, Cap
    }

    Returns
    -------
    response: Response
        Response from push_data POST request
    """
    plot_id = _get_default_plot_id(plot_id)
    pc = get_plot_connection(plot_id)
    return pc.line(x, y, plot_config, append, **attribs)


def image(
    values: OptionalLists,
    x: OptionalArrayLike = None,
    y: OptionalArrayLike = None,
    plot_config: dict | None = None,
    plot_id: str | None = None,
    **attribs,
):
    """Plot image

    Parameters
    ----------
    values: array
    x: x array
    y: y array
    plot_config: plot config
    plot_id: ID of plot where image is added
    **attribs: keywords specific to image
    Keyword options for attribs are
    {
        "aspect": Aspect | float | int | None  # Aspect enum options are auto, equal
        "domain": tuple[float, float]
        "heatmap_scale": ScaleType
        "colour_map": str | ColourMap
    }

    Returns
    -------
    response: Response
        Response from push_data POST request
    """
    plot_id = _get_default_plot_id(plot_id)
    pc = get_plot_connection(plot_id)
    return pc.image(values, x, y, plot_config, **attribs)


def scatter(
    x: ArrayLike,
    y: ArrayLike,
    point_values: OptionalLists,
    domain: tuple[float, float],
    plot_config: dict | None = None,
    plot_id: str | None = None,
    **attribs,
):
    """Plot scatter data
    Parameters
    ----------
    x: x coordinates
    y: y coordinates
    point_values: array
    domain: tuple
    plot_config: plot config
    plot_id: ID of plot where scatter points are added
    **attribs: keywords specific to scatter
    Keyword options for attribs are
    {
        "colour_map": str | ColourMap
        "point_size": float
    }

    Returns
    -------
    response: Response
        Response from push_data POST request
    """
    plot_id = _get_default_plot_id(plot_id)
    pc = get_plot_connection(plot_id)
    return pc.scatter(x, y, point_values, domain, plot_config, **attribs)


def surface(
    values: OptionalLists,
    domain: tuple[float, float],
    x: OptionalArrayLike = None,
    y: OptionalArrayLike = None,
    plot_config: dict | None = None,
    plot_id: str | None = None,
    **attribs,
):
    """Plot surface

    Parameters
    ----------
    values: array
    domain: tuple
    x: x array
    y: y array
    plot_config: plot config
    plot_id: ID of plot where surface is added
    **attribs: keywords specific to surface
    Keyword options for attribs are
    {
        "surface_scale": str | ScaleType,
        "colour_map": str | ColourMap
    }

    Returns
    -------
    response: Response
        Response from push_data POST request
    """
    plot_id = _get_default_plot_id(plot_id)
    pc = get_plot_connection(plot_id)
    return pc.surface(values, domain, x, y, plot_config, **attribs)


def table(
    data: OptionalLists,
    cell_width: int = 120,
    display_style: TableDisplayType | None = None,
    number_digits: int | None = None,
    title: str | None = None,
    plot_id: str | None = None,
    **attribs,
):
    """Show table of data
    Parameters
    ----------
    data: array
    cell_width: int
    display_style: notation type for displaying data
    number_digits: number significant or fractional digits to display
    title: title of plot
    plot_id: ID of plot where as table is shown
    **attribs: keywords specific to table
    Returns
    -------
    response: Response
        Response from push_data POST request
    """
    plot_id = _get_default_plot_id(plot_id)
    pc = get_plot_connection(plot_id)
    return pc.table(data, cell_width, display_style, number_digits, title, **attribs)


def clear(plot_id: str | None = None):
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
    return pc.clear()


def region(
    selections: Selections | None = None,
    update: bool = False,
    delete: bool | str | list[str] = False,
    plot_id: str | None = None,
):
    """Get, set or delete regions of selection on plot

    Parameters
    ----------
    selections : Selections | None
        a selection or list of selections to set or None to get them
    update : bool
        update or add to existing selections
    delete : bool | str | list[str]
        True - remove given selections or all selections if None given
        str | list - remove selection(s) with given ID(s)
    plot_id : str
        the plot from which to clear data

    Returns
    -------
    response: Response
        Response from push_data POST request
    """
    plot_id = _get_default_plot_id(plot_id)
    pc = get_plot_connection(plot_id)
    return pc.region(selections, update, delete)


__all__ = [  # pyright: ignore[reportUnsupportedDunderAll]
    PlotConnection,
    get_plot_connection,
    set_default_plot_id,
    AxialSelection,
    LinearSelection,
    RectangularSelection,
    PolygonalSelection,
    CircularSelection,
    EllipticalSelection,
    CircularSectorialSelection,
    ColourMap,
    GlyphType,
    ScaleType,
    TableDisplayType,
    line,
    image,
    scatter,
    surface,
    table,
    region,
    clear,
]
