from enum import Enum
from typing import Any

from pydantic import BaseModel, root_validator, validator
from pydantic_numpy import NDArray

from .parameters import Aspect, AxesParameters, TableDisplayParams
from .selections import SelectionBase, as_selection


class MsgType(str, Enum):
    """Class for message type."""

    status = "status"
    baton_request = "baton_request"
    new_multiline_data = "new_multiline_data"
    append_line_data = "append_line_data"
    new_image_data = "new_image_data"
    new_scatter_data = "new_scatter_data"
    new_surface_data = "new_surface_data"
    new_table_data = "new_table_data"
    new_selection_data = "new_selection_data"
    update_selection_data = "update_selection_data"
    clear_selection_data = "clear_selection_data"
    clear_data = "clear_data"
    client_new_selection = "client_new_selection"
    client_update_selection = "client_update_selection"


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
    colour: str | None = None
    line_on = True
    point_size: int | None = None
    default_indices: bool | None

    @validator("y")
    def equal_axes(cls, v, values, **kwargs):
        x_size = getattr(getattr(values, "x", 0), "size", 0)
        y_size = getattr(v, "size", 0)
        if x_size == 0 and y_size == 0:
            raise ValueError(f"Must have one non-zero axis, {v}")
        if x_size != 0:
            if x_size != y_size or x_size != y_size + 1:
                raise ValueError(
                    "x and y arrays must be equal length if provided: "
                    f"{x_size}, {y_size}"
                )
        return v

    @root_validator
    def are_indices_default(cls, values):
        if not values["default_indices"]:
            values["default_indices"] = (
                "y" not in values or "x" not in values or values["x"].size == 0
            )
        return values


class ImageData(BaseModel):
    """Class for representing an image."""

    key: str
    values: NDArray
    aspect: Aspect | float | int | None


class HeatmapData(ImageData):
    """Class for representing heatmap data."""

    domain: tuple[float, float]
    heatmap_scale: str = "linear"
    colourMap: str


class ScatterData(BaseModel):
    """Class for representing scatter data."""

    key: str
    xData: NDArray
    yData: NDArray
    dataArray: NDArray
    domain: tuple[float, float]
    colourMap: str


class SurfaceData(BaseModel):
    """Class for representing surface data."""

    key: str
    values: NDArray
    domain: tuple[float, float]
    surface_scale: str = "linear"
    colourMap: str


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


class BatonMessage(BaseModel):
    """Class for representing a baton message."""

    baton: str | None
    uuids: list[str]


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

    @validator("ml_data")
    def ml_data_is_not_empty(cls, v):
        if len(v) > 0:
            return v
        raise ValueError("ml_data contains no LineData", v)

    @validator("ml_data")
    def default_indices_match(cls, v):
        default_indices = [ld.default_indices for ld in v]
        if all(default_indices) or not any(default_indices):
            return v
        raise ValueError(
            "default_indices must be all True or all False in every LineData object", v
        )


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


class SelectionMessage(BaseModel):
    """Class to mark selections"""


class ClientSelectionMessage(SelectionMessage):
    """Class for representing a client selection"""

    selection: SelectionBase

    @classmethod
    def parse_obj(cls, obj: dict):
        return cls(selection=as_selection(obj["selection"]))


class SelectionsMessage(SelectionMessage):
    """Class for representing a request to set selections"""

    set_selections: list[SelectionBase]

    @classmethod
    def parse_obj(cls, obj: dict):
        return cls(set_selections=[as_selection(s) for s in obj["set_selections"]])


class UpdateSelectionsMessage(SelectionMessage):
    """Class for representing a request to update selections"""

    update_selections: list[SelectionBase]

    @classmethod
    def parse_obj(cls, obj: dict):
        return cls(
            update_selections=[as_selection(s) for s in obj["update_selections"]]
        )


class ClearSelectionsMessage(SelectionMessage):
    """Class for representing a request to clear listed or all selections."""

    selection_ids: list[str]


if __name__ == "__main__":
    print(PlotMessage.schema())
