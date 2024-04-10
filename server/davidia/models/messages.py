import random
from enum import Enum
from typing import Any
from uuid import uuid4

from numpy import asanyarray as _asanyarray
from pydantic import BaseModel, Field, field_validator, model_validator
from pydantic_numpy.model import NumpyModel

from .parameters import (Aspect, AxesParameters, DvDNDArray, ScaleType,
                         TableDisplayParams)
from .selections import AnySelection


class MsgType(str, Enum):
    """Class for message type."""

    status = "status"
    baton_request = "baton_request"
    baton_approval = "baton_approval"
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
    client_update_line_parameters = "client_update_line_parameters"


class StatusType(str, Enum):
    """Class for status type."""

    ready = "ready"
    busy = "busy"
    closing = "closing"


class GlyphType(str, Enum):
    """Class for glyph type."""

    Circle = "Circle"
    Cross = "Cross"
    Square = "Square"
    Cap = "Cap"


class LineParams(BaseModel):
    """Class for representing a line."""

    name: str = ""
    colour: str | None = None
    line_on: bool
    point_size: int | None = None
    glyph_type: GlyphType = GlyphType.Circle

    @model_validator(mode="before")
    @classmethod
    def check_glyph_type(cls, values: dict):
        if values.get("glyph_type") is None:
            values["glyph_type"] = GlyphType.Circle
        return values


class LineData(NumpyModel):
    """Class for representing a line."""

    @staticmethod
    def get_default_key() -> str:
        return uuid4().hex[-8:]

    key: str = Field(default_factory=get_default_key)
    x: DvDNDArray | None = None
    y: DvDNDArray
    line_params: LineParams
    default_indices: bool | None = None

    @field_validator("y")
    @classmethod
    def equal_axes(cls, v, values):
        x_size = getattr(values.data.get("x", 0), "size", 0)
        if x_size != 0:
            y_size = getattr(v, "size", 0)
            if x_size != y_size and x_size != y_size + 1:
                raise ValueError(
                    "x and y arrays must be equal length if provided: "
                    f"{x_size}, {y_size}"
                )
        return v

    @model_validator(mode="before")
    @classmethod
    def are_indices_default(cls, values: dict):
        for k in ("x", "y"):
            if k in values:
                v = values[k]
                if v is None:
                    values.pop(k)
                else:
                    values[k] = _asanyarray(v)

        if not values.get("default_indices"):
            values["default_indices"] = (
                "y" not in values or "x" not in values or values["x"].size == 0
            )

        if not values.get("key"):
            values["key"] = f"_{random.randrange(1000)}"

        if not values.get("name"):
            values["name"] = values["key"]

        if values.get("glyph_type") is None:
            values["glyph_type"] = GlyphType.Circle
        return values


class ImageData(NumpyModel):
    """Class for representing an image."""

    key: str
    values: DvDNDArray
    aspect: Aspect | float | int | None = None


class HeatmapData(ImageData):
    """Class for representing heatmap data."""

    domain: tuple[float, float]
    heatmap_scale: ScaleType = Field(default=ScaleType.linear)
    colourMap: str

    @field_validator("heatmap_scale")
    @classmethod
    def validate_scale(cls, v: ScaleType | None):
        if v is None:
            return ScaleType.linear
        if v == ScaleType.gamma:
            raise ValueError("Heatmap scale of 'gamma' not allowed")
        return v


class ScatterData(NumpyModel):
    """Class for representing scatter data."""

    key: str
    xData: DvDNDArray
    yData: DvDNDArray
    dataArray: DvDNDArray
    domain: tuple[float, float]
    colourMap: str


class SurfaceData(NumpyModel):
    """Class for representing surface data."""

    key: str
    values: DvDNDArray
    domain: tuple[float, float]
    surface_scale: ScaleType = ScaleType.linear
    colourMap: str


class TableData(NumpyModel):
    """Class for representing table data."""

    key: str
    dataArray: DvDNDArray
    cellWidth: int
    displayParams: TableDisplayParams | None = None


class PlotMessage(NumpyModel):
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
    params: Any = None
    plot_config: AxesParameters | None = None


class BatonMessage(BaseModel):
    """Class for representing a baton message."""

    baton: str | None
    uuids: list[str]


class BatonApprovalRequestMessage(BaseModel):
    """Class for representing a baton approval request message."""

    requester: str


class DataMessage(NumpyModel):
    """Class for representing a data message

    Make sure subclasses have unique fields so client can distinguish
    message type
    """

    axes_parameters: AxesParameters = AxesParameters()


class AppendLineDataMessage(DataMessage):
    """Class for representing an append line data message."""

    al_data: list[LineData]


class MultiLineDataMessage(DataMessage):
    """Class for representing a multiline data message."""

    ml_data: list[LineData]

    @field_validator("ml_data")
    @classmethod
    def ml_data_is_not_empty(cls, v):
        if len(v) > 0:
            return v
        raise ValueError("ml_data contains no LineData", v)

    @field_validator("ml_data")
    @classmethod
    def line_keys_are_unique(cls, v):
        keys = []
        for line in v:
            k = line.key
            if k in keys:
                new_key = f"_{random.randrange(1000)}"
                line.key = new_key
                if line.name == k:
                    line.name = new_key
                print(f"Duplicate line key {k} replaced with {new_key}")
            else:
                keys.append(k)

        keys = [line.key for line in v]
        if len(keys) != len(set(keys)):
            raise ValueError("Duplicate keys remain", v)
        return v

    @field_validator("ml_data")
    @classmethod
    def default_indices_match(cls, v):
        default_indices = [ld.default_indices for ld in v]
        if all(default_indices) or not any(default_indices):
            return v
        raise ValueError(
            "default_indices must be all True or all False in every LineData object", v
        )


class ImageDataMessage(DataMessage):
    """Class for representing an image data message."""

    im_data: ImageData | HeatmapData


class ScatterDataMessage(DataMessage):
    """Class for representing a scatter data message."""

    sc_data: ScatterData


class SurfaceDataMessage(DataMessage):
    """Class for representing a surface data message."""

    su_data: SurfaceData


class TableDataMessage(DataMessage):
    """Class for representing a table data message."""

    ta_data: TableData


class ClearPlotsMessage(BaseModel):
    """Class for representing a request to clear all plots."""

    plot_id: str


class SelectionMessage(BaseModel):
    """Class to mark selections"""


class ClientSelectionMessage(SelectionMessage):
    """Class for representing a client selection"""

    selection: AnySelection


class ClientLineParametersMessage(DataMessage):
    """Class for representing a client selection"""

    line_params: LineParams
    key: str


class SelectionsMessage(SelectionMessage):
    """Class for representing a request to set selections"""

    set_selections: list[AnySelection]


class UpdateSelectionsMessage(SelectionMessage):
    """Class for representing a request to update selections"""

    update_selections: list[AnySelection]


class ClearSelectionsMessage(SelectionMessage):
    """Class for representing a request to clear listed or all selections."""

    selection_ids: list[str]


ALL_MODELS = (
    PlotMessage,
    ClearPlotsMessage,
    AppendLineDataMessage,
    MultiLineDataMessage,
    ImageDataMessage,
    ScatterDataMessage,
    TableDataMessage,
    ClientSelectionMessage,
    ClientLineParametersMessage,
    SelectionsMessage,
    UpdateSelectionsMessage,
    ClearSelectionsMessage,
    LineData,
    LineParams,
    ImageData,
    HeatmapData,
    ScatterData,
    SurfaceData,
    TableData,
    AxesParameters,
    BatonMessage,
    BatonApprovalRequestMessage,
)

if __name__ == "__main__":
    import json

    print(json.dumps(PlotMessage.model_json_schema(), indent=2))
