from dataclasses import asdict as _asdict
from enum import Enum
from typing import Any, Optional, Union

from pydantic import BaseModel, validator
from pydantic_numpy import NDArray


class ScaleType(str, Enum):
    """Class for scale type"""

    linear = "linear"
    log = "log"
    symlog = "symlog"
    sqrt = "sqrt"
    gamma = "gamma"


class StatusType(str, Enum):
    """Class for status type."""

    ready = "ready"
    busy = "busy"


class TableDisplayType(str, Enum):
    """
    Class for table display type
    standard: plain number formatting with decimal places
    scientific: order-of-magnitude.
    """

    standard = "standard"
    scientific = "scientific"


class TableDisplayParams(BaseModel):
    """
    Class for representing table display type and number of digits

    Attributes
    ----------
    displayType : TableDisplayType | None
        Type of notation for table display
    numberDigits : int | None
        The number of significant figures if scientific notation (between 1 and 21)
         or the number of decimal places if standard notation (between 0 and 20).
    """

    displayType: TableDisplayType | None
    numberDigits: int | None

    @validator('numberDigits')
    @classmethod
    def validate_numberDigits(cls, v, values):
        if not v:
            return v
        if values['displayType'] == "scientific":
            x = min(v, 21)
            x = max(x, 1)
            return x
        x = min(v, 20)
        x = max(x, 0)
        return x


class MsgType(str, Enum):
    """Class for message type."""

    status = "status"
    new_multiline_data = "new_multiline_data"
    append_line_data = "append_line_data"
    new_image_data = "new_image_data"
    new_scatter_data = "new_scatter_data"
    new_table_data = "new_table_data"
    clear_data = "clear_data"


class AxesParameters(BaseModel):
    """Class for representing plot parameters."""

    x_label: str = ""
    y_label: str = ""
    x_scale: ScaleType = "linear"
    y_scale: ScaleType = "linear"
    x_values: Optional[NDArray] = None
    y_values: Optional[NDArray] = None
    title: str = ""


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
    plot_config: AxesParameters | None = None


class LineData(BaseModel):
    """Class for representing a line."""

    key: str
    x: NDArray
    y: NDArray
    color: str | None = None
    line_on = True
    point_size: int | None = None


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
    displayParams: TableDisplayParams | None




class DataMessage(BaseModel):
    """Class for representing a data message

    Make sure subclasses have unique fields so client can distinguish
    message type
    """

    axes_parameters: AxesParameters


class AppendLineDataMessage(DataMessage):
    """Class for representing an append line data message."""

    axes_parameters = AxesParameters()
    al_data: list[LineData]


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
