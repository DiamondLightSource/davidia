from enum import auto
from typing import Any
from uuid import uuid4

from numpy import asanyarray as _asanyarray
from pydantic import ConfigDict, Field, field_validator, model_validator

from .parameters import (
    Aspect,
    AutoNameEnum,
    PlotConfig,
    DvDModel,
    DvDNDArray,
    DvDNpModel,
    ScaleType,
    TableDisplayParams,
    validate_scale_type,
)
from .selections import AnySelection, Float, FloatTuple


class MsgType(AutoNameEnum):
    """Class for message type."""

    status = auto()
    baton_request = auto()
    baton_offer = auto()
    new_multiline_data = auto()
    append_line_data = auto()
    new_image_data = auto()
    new_scatter_data = auto()
    new_surface_data = auto()
    new_table_data = auto()
    new_selection_data = auto()
    update_selection_data = auto()
    clear_selection_data = auto()
    clear_data = auto()
    client_new_selection = auto()
    client_update_selection = auto()
    client_update_line_parameters = auto()
    client_update_scatter_parameters = auto()


class StatusType(AutoNameEnum):
    """Class for status type."""

    ready = auto()
    busy = auto()
    closing = auto()


class GlyphType(AutoNameEnum):
    """Class for glyph type."""

    Circle = auto()
    Cross = auto()
    Square = auto()
    Cap = auto()


class ColourMap(AutoNameEnum):
    Blues = auto()
    Greens = auto()
    Greys = auto()
    Oranges = auto()
    Purples = auto()
    Reds = auto()
    Turbo = auto()
    Viridis = auto()
    Inferno = auto()
    Magma = auto()
    Plasma = auto()
    Cividis = auto()
    Warm = auto()
    Cool = auto()
    Cubehelix = auto()
    BuGn = auto()
    BuPu = auto()
    GnBu = auto()
    OrRd = auto()
    PuBuGn = auto()
    PuBu = auto()
    PuRd = auto()
    RdPu = auto()
    YlGnBu = auto()
    YlGn = auto()
    YlOrBr = auto()
    YlOrRd = auto()
    Rainbow = auto()
    Sinebow = auto()
    HSL = auto()
    BrBG = auto()
    PRGn = auto()
    PiYG = auto()
    PuOr = auto()
    RdBu = auto()
    RdGy = auto()
    RdYlBu = auto()
    RdYlGn = auto()
    Spectral = auto()


class LineParams(DvDModel):
    """Class for representing a line."""

    model_config = ConfigDict(
        extra="forbid",
    )  # need this to prevent any dict validating as all fields have default values

    name: str = ""
    colour: str | None = None
    line_on: bool = True
    point_size: int | None = None
    glyph_type: GlyphType = GlyphType.Circle

    @field_validator("glyph_type")
    @classmethod
    def validate_glyph_type(cls, v: GlyphType | str):
        if isinstance(v, str):
            v = GlyphType[v]
        return v

    @model_validator(mode="before")
    @classmethod
    def check_glyph_type(cls, values: dict):
        if "glyphType" not in values and values.get("glyph_type") is None:
            values["glyph_type"] = GlyphType.Circle
        return values


class LineData(DvDNpModel):
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
    def are_indices_default(cls, values: Any):
        if not isinstance(values, dict):
            return values

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
        return values


class ImageData(DvDNpModel):
    """Class for representing an image."""

    values: DvDNDArray
    aspect: Aspect | float | int | None = None
    model_config = ConfigDict(
        extra="forbid"
    )  # need this to prevent any dict validating as all fields have default values


def validate_colour_map(v: ColourMap | str):
    if isinstance(v, str):
        return ColourMap[v]
    return v


class HeatmapData(ImageData):
    """Class for representing heatmap data."""

    domain: FloatTuple
    heatmap_scale: ScaleType = ScaleType.linear
    colour_map: ColourMap | None = None
    "An optional parameter which if None uses the last colour map defined in the plot server which is initialised to a default colour map"

    validate_scale = field_validator("heatmap_scale")(validate_scale_type)
    validate_local_colour_map = field_validator("colour_map")(validate_colour_map)

    @field_validator("colour_map")
    @classmethod
    def validate_colour_map(cls, v: ColourMap | str):
        if isinstance(v, str):
            return ColourMap[v]
        return v


class ScatterData(DvDNpModel):
    """Class for representing scatter data."""

    x: DvDNDArray
    y: DvDNDArray
    point_values: DvDNDArray
    domain: FloatTuple
    colour_map: ColourMap | None = None
    point_size: Float = 10

    validate_local_colour_map = field_validator("colour_map")(validate_colour_map)


class SurfaceData(DvDNpModel):
    """Class for representing surface data."""

    height_values: DvDNDArray
    domain: FloatTuple
    colour_map: ColourMap | None = None
    surface_scale: ScaleType = ScaleType.linear

    validate_scale = field_validator("surface_scale")(validate_scale_type)
    validate_local_colour_map = field_validator("colour_map")(validate_colour_map)


class TableData(DvDNpModel):
    """Class for representing table data."""

    cell_values: DvDNDArray
    cell_width: int
    display_params: TableDisplayParams | None = None


class BatonMessage(DvDModel):
    """Class for representing a baton message."""

    baton: str | None
    uuids: list[str]


class BatonRequestMessage(DvDModel):
    """Class for representing a baton request message."""

    requester: str


class DataMessage(DvDNpModel):
    """Class for representing a data message

    Make sure subclasses have unique fields so client can distinguish
    message type
    """

    plot_config: PlotConfig = PlotConfig()


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


class ClearPlotsMessage(DvDModel):
    """Class for representing a request to clear all plots."""

    plot_id: str


class SelectionMessage(DvDModel):
    """Class to mark selections"""


class ClientSelectionMessage(SelectionMessage):
    """Class for representing a client selection"""

    selection: AnySelection


class ClientLineParametersMessage(DvDModel):
    """Class for representing a client selection"""

    line_params: LineParams
    key: str


class ClientScatterParametersMessage(DvDModel):
    """Class for representing client scatter parameters"""

    point_size: Float


class SelectionsMessage(SelectionMessage):
    """Class for representing a request to set selections"""

    set_selections: list[AnySelection]


class UpdateSelectionsMessage(SelectionMessage):
    """Class for representing a request to update selections"""

    update_selections: list[AnySelection]


class ClearSelectionsMessage(SelectionMessage):
    """Class for representing a request to clear listed or all selections."""

    selection_ids: list[str]


ANY_PM_PARAMS = (
    str
    | list[LineData]
    | HeatmapData
    | ImageData
    | ScatterData
    | SurfaceData
    | TableData
    | ClientSelectionMessage
    | ClientLineParametersMessage
    | ClientScatterParametersMessage
    | SelectionsMessage
    | UpdateSelectionsMessage
    | ClearSelectionsMessage
)


class PlotMessage(DvDNpModel):
    """
    Class for communication messages to push_data endpoint

    Attributes
    ----------
    plot_id : str
        ID of plot to which to send data message
    type : MsgType
        The message type represented as a MsgType enum
    params : Any
        The message params
    plot_config: PlotConfig
        The plot configuration parameters
    """

    plot_id: str
    type: MsgType
    params: ANY_PM_PARAMS = Field(union_mode="left_to_right")
    plot_config: PlotConfig | None = None


ALL_MESSAGES = (
    ClearPlotsMessage,
    AppendLineDataMessage,
    MultiLineDataMessage,
    ImageDataMessage,
    ScatterDataMessage,
    TableDataMessage,
    ClientSelectionMessage,
    ClientLineParametersMessage,
    ClientScatterParametersMessage,
    SelectionsMessage,
    UpdateSelectionsMessage,
    ClearSelectionsMessage,
    BatonMessage,
    BatonRequestMessage,
)

ALL_MODELS = (
    PlotMessage,
    LineData,
    LineParams,
    HeatmapData,
    ImageData,
    ScatterData,
    SurfaceData,
    TableData,
    PlotConfig,
) + ALL_MESSAGES

if __name__ == "__main__":
    import json

    print(json.dumps(PlotMessage.model_json_schema(), indent=2))
