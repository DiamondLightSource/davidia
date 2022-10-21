from dataclasses import dataclass
from py_ts_interfaces import Interface
from typing import Any, List, Tuple

from enum import IntEnum


# Use IntEnum as Enum not JSON serializable
class StatusType(IntEnum):
    """Class for status type."""

    ready = 1
    busy = 2


class MsgType(IntEnum):
    """Class for message type."""

    status = 0
    new_line_data = 1
    new_multiline_data = 2
    new_image_data = 3
    clear_data = 4


@dataclass(unsafe_hash=True)
class PlotMessage(Interface):
    """
    Class for communication messages to server

    Attributes
    ----------
    plot_id : str
        ID of plot to which to send data message
    type : int
        The message type represented as a MsgType enum
    params : Any
        The message params
    plot_config : Any
        the plot configuration parameters.
    """

    plot_id: str
    type: int
    params: Any
    plot_config: Any = None

    def __init__(self, plot_id, type, params, plot_config=None):
        if isinstance(type, str):
            self.type = MsgType[type]
        elif isinstance(type, int):
            self.type = MsgType(type)
        if plot_config is None:
            self.plot_config = {}
        else:
            self.plot_config = plot_config
        self.plot_id: str = plot_id
        self.params: Any = params


@dataclass(unsafe_hash=True)
class AxesParameters(Interface):
    '''Class for representing plot parameters.'''
    x_label: str = ''
    y_label: str = ''
    x_scale: str = "linear"
    y_scale: str = "linear"


@dataclass(unsafe_hash=True)
class LineData(Interface):
    """Class for representing a line."""

    key: str
    color: str
    x: List[float]
    y: List[float]
    line_on: bool = True
    points_on: bool = True
    point_size: int = 8


@dataclass(unsafe_hash=True)
class LineDataMessage(Interface):
    """Class for representing a line data message."""

    plot_id: str
    data: LineData
    axes_parameters: AxesParameters = AxesParameters()
    type: str = "LineDataMessage"


@dataclass(unsafe_hash=True)
class MultiLineDataMessage(Interface):
    """Class for representing a multiline data message."""

    plot_id: str
    data: List[LineData]
    axes_parameters: AxesParameters = AxesParameters()
    type: str = "MultiLineDataMessage"


@dataclass(unsafe_hash=True)
class ImageData(Interface):
    """Class for representing an image."""
    key: str
    values: List[float]
    domain: Tuple[float, float]
    shape: Tuple[int, int]
    heatmap_scale: str = "linear"


@dataclass(unsafe_hash=True)
class ImageDataMessage(Interface):
    """Class for representing an image data message."""

    plot_id: str
    data: ImageData
    axes_parameters: AxesParameters = AxesParameters()
    type: str = "ImageDataMessage"


@dataclass(unsafe_hash=True)
class ClearPlotsMessage(Interface):
    """Class for representing a request to clear all plots."""

    plot_id: str
    type: str = "ClearPlotsMessage"
