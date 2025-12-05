from enum import auto as _auto, Enum
from typing import Any, Annotated

import numpy as np
from pydantic import BaseModel, ConfigDict, field_validator
from pydantic.alias_generators import to_camel
from pydantic_numpy.helper.annotation import NpArrayPydanticAnnotation
from pydantic_numpy.model import NumpyModel

DvDNDArray = Annotated[
    np.ndarray[Any, np.dtype[Any]],
    NpArrayPydanticAnnotation.factory(
        data_type=None,
        dimensions=None,
        strict_data_typing=None,
    ),
]


class AutoNameEnum(str, Enum):
    @staticmethod
    def _generate_next_value_(name, start, count, last_values):
        return name


class Aspect(AutoNameEnum):
    """Class for aspect type."""

    auto = _auto()
    equal = _auto()


class ScaleType(AutoNameEnum):
    """Class for scale type"""

    linear = _auto()
    log = _auto()
    symlog = _auto()
    sqrt = _auto()
    gamma = _auto()


class TableDisplayType(AutoNameEnum):
    """
    Class for table display type
    standard: plain number formatting with decimal places
    scientific: order-of-magnitude.
    """

    standard = _auto()
    scientific = _auto()


class DvDModel(BaseModel):
    """Base model can serialize to and validate camelCase aliases of its attributes"""

    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, use_enum_values=True
    )


class DvDNpModel(NumpyModel):
    """Base model can serialize to and validate camelCase aliases of its attributes"""

    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, use_enum_values=True
    )


class TableDisplayParams(DvDModel):
    """
    Class for representing table display type and number of digits

    Attributes
    ----------
    display_type : TableDisplayType | None
        Type of notation for table display
    number_digits : int | None
        The number of significant figures if scientific notation (between 1 and 21)
         or the number of decimal places if standard notation (between 0 and 20).
    """

    model_config = ConfigDict(
        extra="forbid"
    )  # need this to prevent any dict validating as all fields have default values

    display_type: TableDisplayType | None = None
    number_digits: int | None = None

    @field_validator("display_type")
    @classmethod
    def validate_display_type(cls, v: TableDisplayType | str):
        if isinstance(v, str):
            v = TableDisplayType[v]
        return v

    @field_validator("number_digits")
    @classmethod
    def validate_number_digits(cls, v, info):
        if not v:
            return v
        if info.data["display_type"] == TableDisplayType.scientific:
            x = min(v, 21)
            x = max(x, 1)
            return x
        x = min(v, 20)
        x = max(x, 0)
        return x


def validate_scale_type(v: ScaleType | str) -> ScaleType:
    if isinstance(v, str):
        v = ScaleType[v]
    return v


class PlotConfig(DvDNpModel):
    """Class for representing plot configuration."""

    model_config = ConfigDict(
        extra="forbid"
    )  # need this to prevent any dict validating as all fields have default values

    x_label: str = ""
    x_scale: ScaleType = ScaleType.linear
    x_values: DvDNDArray | None = None
    y_label: str = ""
    y_scale: ScaleType = ScaleType.linear
    y_values: DvDNDArray | None = None
    title: str = ""

    validate_x_scale = field_validator("x_scale")(validate_scale_type)
    validate_y_scale = field_validator("y_scale")(validate_scale_type)
