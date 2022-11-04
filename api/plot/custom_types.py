from dataclasses import asdict as _asdict
from typing import Any, Optional, Union
from pydantic import BaseModel
from enum import Enum


class StatusType(str, Enum):
    """Class for status type."""

    ready = "ready"
    busy = "busy"


class MsgType(str, Enum):
    """Class for message type."""

    status = "status"
    new_line_data = "new_line_data"
    new_multiline_data = "new_multiline_data"
    new_image_data = "new_image_data"
    clear_data = "clear_data"


class AxesParameters(BaseModel):
    """Class for representing plot parameters."""
    x_label = ''
    y_label = ''
    x_scale = "linear"
    y_scale = "linear"


class PlotMessage(BaseModel):
    """
    Class for communication messages to server

    Attributes
    ----------
    plot_id : str
        ID of plot to which to send data message
    type : MsgType
        The message type represented as a MsgType enum
    params : Any
        The message params
    plot_config : Any
        the plot configuration parameters.
    """

    plot_id: str
    type: MsgType
    params: Any
    plot_config: Optional[AxesParameters] = None


class LineData(BaseModel):
    """Class for representing a line."""

    key: str
    x: list[float]
    y: list[float]
    color: Optional[str] = None
    line_on = True
    point_size: Optional[int] = None


class DataMessage(BaseModel):
    """Class for representing a data message."""
    data: Any
    axes_parameters: AxesParameters
    type: str


class LineDataMessage(DataMessage):
    """Class for representing a line data message."""

    data: LineData
    axes_parameters = AxesParameters()
    type = "LineDataMessage"


class MultiLineDataMessage(DataMessage):
    """Class for representing a multiline data message."""

    data: list[LineData]
    axes_parameters = AxesParameters()
    type = "MultiLineDataMessage"


class ImageData(BaseModel):
    """Class for representing an image."""

    key: str
    values: list[float]
    domain: tuple[float, float]
    shape: tuple[int, int]
    heatmap_scale: str = "linear"


class ImageDataMessage(DataMessage):
    """Class for representing an image data message."""

    data: ImageData
    axes_parameters = AxesParameters()
    type = "ImageDataMessage"


class ClearPlotsMessage(BaseModel):
    """Class for representing a request to clear all plots."""

    plot_id: str
    type = "ClearPlotsMessage"


def asdict(obj):
    if isinstance(obj, BaseModel):
        return obj.dict()
    return _asdict(obj)


if __name__ == "__main__":
    print(PlotMessage.schema())
