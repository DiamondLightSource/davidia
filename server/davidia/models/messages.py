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


class BatonDonateMessage(DvDModel):
    """Class for representing a baton donate message."""

    receiver: str


class BatonRequestMessage(DvDModel):
    """Class for representing a baton request message."""

    requester: str


class _BasePlotMessage(DvDModel):
    """
    Base class for a plot message

    Attributes
    ----------
    plot_id : str
        ID of plot to which to send data message
    """

    plot_id: str = "plot_0"


class _PlotDataMessage(DvDNpModel, _BasePlotMessage):
    """Class for representing a plot message

    Make sure subclasses have unique fields so client can distinguish
    message type
    """

    plot_config: PlotConfig = PlotConfig()


class MultiLineMessage(_PlotDataMessage):
    """Class for representing a multiline message."""

    append: bool = False
    ml_data: list[LineData]

    @field_validator("ml_data")
    @classmethod
    def ml_data_is_not_empty(cls, v):
        if len(v) > 0:
            return v
        raise ValueError("ml_data contains no LineData", v)

    @model_validator(mode="after")
    def default_indices_match(self):
        if self.append:
            return self

        default_indices = [ld.default_indices for ld in self.ml_data]
        if all(default_indices) or not any(default_indices):
            return self
        raise ValueError(
            "default_indices must be all True or all False in every LineData object",
            self.ml_data,
        )


class ScatterMessage(_PlotDataMessage):
    """Class for representing a scatter message."""

    sc_data: ScatterData


class ImageMessage(_PlotDataMessage):
    """Class for representing an image message."""

    im_data: ImageData | HeatmapData


class SurfaceMessage(_PlotDataMessage):
    """Class for representing a surface message."""

    su_data: SurfaceData


class TableMessage(_PlotDataMessage):
    """Class for representing a table message."""

    ta_data: TableData


class _BaseSelectionsMessage(_BasePlotMessage):
    """Class to mark selections"""


class SelectionsMessage(_BaseSelectionsMessage):
    """Class for representing selections to set"""

    update: bool = False
    set_selections: list[AnySelection]


class ClearSelectionsMessage(_BaseSelectionsMessage):
    """Class for representing selections to clear"""

    selection_ids: list[str]


class ClientSelectionMessage(DvDModel):
    """Class for representing a client selection"""

    selection: AnySelection = Field(union_mode="left_to_right")


class ClearPlotMessage(DvDModel):
    """Class for representing a request to clear plot."""

    plot_id: str


class ClientStatusMessage(DvDModel):
    """Class for representing a client status"""

    status: str


class ClientLineParametersMessage(DvDModel):
    """Class for representing a client selection"""

    line_params: LineParams
    key: str


class ClientScatterParametersMessage(DvDModel):
    """Class for representing client scatter parameters"""

    point_size: Float


EndPointMessage = (
    MultiLineMessage
    | ScatterMessage
    | ImageMessage
    | SurfaceMessage
    | TableMessage
    | SelectionsMessage
    | ClearSelectionsMessage
)


ClientMessage = (
    ClientStatusMessage
    | ClientSelectionMessage
    | ClientLineParametersMessage
    | ClientScatterParametersMessage
    | ClearSelectionsMessage
    | BatonRequestMessage
    | BatonDonateMessage
)


ALL_MESSAGES = (
    MultiLineMessage,
    ScatterMessage,
    ImageMessage,
    SurfaceMessage,
    TableMessage,
    BatonMessage,
    BatonRequestMessage,
    SelectionsMessage,
    ClearSelectionsMessage,
    ClientStatusMessage,
    ClientSelectionMessage,
    ClientLineParametersMessage,
    ClientScatterParametersMessage,
    ClearPlotMessage,
)

ALL_MODELS = (
    LineData,
    LineParams,
    ScatterData,
    HeatmapData,
    ImageData,
    SurfaceData,
    TableData,
    PlotConfig,
) + ALL_MESSAGES

if __name__ == "__main__":
    import json

    for m in ALL_MESSAGES:
        print(json.dumps(m.model_json_schema(), indent=2))
