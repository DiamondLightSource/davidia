from enum import Enum
from pydantic import BaseModel
from pydantic_numpy import NDArray
from typing import Any

from .parameters import Aspect, AxesParameters, TableDisplayParams
from .selections import SelectionBase, as_selection


class MsgType(str, Enum):
    """Class for message type."""

    status = "status"
    new_multiline_data = "new_multiline_data"
    append_line_data = "append_line_data"
    new_image_data = "new_image_data"
    new_scatter_data = "new_scatter_data"
    new_surface_data = "new_surface_data"
    new_table_data = "new_table_data"
    new_selection_data = "new_selection_data"
    append_selection_data = "append_selection_data"
    clear_selection_data = "clear_selection_data"
    clear_data = "clear_data"
    client_new_selection = "client_new_selection"


class StatusType(str, Enum):
    """Class for status type."""

    ready = "ready"
    busy = "busy"
    closing = "closing"


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
    aspect: Aspect | float | int | None


class HeatmapData(ImageData):
    """Class for representing heatmap data."""

    domain: tuple[float, float]
    heatmap_scale: str = "linear"
    colorMap: str


class ScatterData(BaseModel):
    """Class for representing scatter data."""

    key: str
    xData: NDArray
    yData: NDArray
    dataArray: NDArray
    domain: tuple[float, float]


class SurfaceData(BaseModel):
    """Class for representing surface data."""

    key: str
    values: NDArray
    domain: tuple[float, float]
    surface_scale: str = "linear"
    colorMap: str


class TableData(BaseModel):
    """Class for representing table data."""

    key: str
    dataArray: NDArray
    cellWidth: int
    displayParams: TableDisplayParams | None


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
    im_data: ImageData | HeatmapData


class ScatterDataMessage(DataMessage):
    """Class for representing a scatter data message."""

    axes_parameters = AxesParameters()
    sc_data: ScatterData


class SurfaceDataMessage(DataMessage):
    """Class for representing a surface data message."""

    axes_parameters = AxesParameters()
    su_data: SurfaceData


class TableDataMessage(DataMessage):
    """Class for representing a table data message."""

    axes_parameters = AxesParameters()
    ta_data: TableData


class ClearPlotsMessage(BaseModel):
    """Class for representing a request to clear all plots."""

    plot_id: str


class ClientSelectionMessage(BaseModel):
    """Class for representing a client selection"""

    selection: SelectionBase

    @classmethod
    def parse_obj(cls, obj: dict):
        return cls(selection=as_selection(obj["selection"]))


class SelectionsMessage(BaseModel):
    """Class for representing a request to set selections"""

    set_selections: list[SelectionBase]


class AppendSelectionsMessage(BaseModel):
    """Class for representing a request to appending selections"""

    append_selections: list[SelectionBase]


class ClearSelectionsMessage(BaseModel):
    """Class for representing a request to clear all selections."""

    plot_id_selections: str


if __name__ == "__main__":
    print(PlotMessage.schema())
