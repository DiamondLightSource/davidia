from dataclasses import asdict as _asdict
from enum import Enum
from typing import Any, Optional, Union

from pydantic import BaseModel
from pydantic_numpy import NDArray


class StatusType(str, Enum):
    """Class for status type."""

    ready = "ready"
    busy = "busy"


class MsgType(str, Enum):
    """Class for message type."""

    status = "status"
    new_multiline_data = "new_multiline_data"
    new_image_data = "new_image_data"
    new_scatter_data = "new_scatter_data"
    new_table_data = "new_table_data"
    clear_data = "clear_data"


class AxesParameters(BaseModel):
    """Class for representing plot parameters."""

    x_label = ""
    y_label = ""
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
    x: NDArray
    y: NDArray
    color: Optional[str] = None
    line_on = True
    point_size: Optional[int] = None


class ImageData(BaseModel):
    """Class for representing an image."""

    key: str
    values: NDArray


class HeatmapData(ImageData):
    """Class for representing heatmap data."""

    domain: tuple[float, float]
    heatmap_scale: str = "linear"


class ScatterData(BaseModel):
    """Class for representing scatter data."""

    key: str
    xData: NDArray
    yData: NDArray
    dataArray: NDArray
    domain: tuple[float, float]


class TableData(BaseModel):
    """Class for representing table data."""

    key: str
    dataArray: NDArray
    cellWidth: int


class DataMessage(BaseModel):
    """Class for representing a data message

    Make sure subclasses have unique fields so client can distinguish
    message type
    """

    axes_parameters: AxesParameters


class MultiLineDataMessage(DataMessage):
    """Class for representing a multiline data message."""

    axes_parameters = AxesParameters()
    ml_data: list[LineData]


class ImageDataMessage(DataMessage):
    """Class for representing an image data message."""

    axes_parameters = AxesParameters()
    im_data: Union[ImageData, HeatmapData]


class ScatterDataMessage(DataMessage):
    """Class for representing a scatter data message."""

    axes_parameters = AxesParameters()
    sc_data: ScatterData


class TableDataMessage(DataMessage):
    """Class for representing a table data message."""

    axes_parameters = AxesParameters()
    ta_data: TableData


class ClearPlotsMessage(BaseModel):
    """Class for representing a request to clear all plots."""

    plot_id: str


def asdict(obj):
    if isinstance(obj, BaseModel):
        return obj.dict()
    return _asdict(obj)


if __name__ == "__main__":
    print(PlotMessage.schema())
