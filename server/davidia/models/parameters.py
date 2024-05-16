from enum import Enum
from typing import Any, Annotated

import numpy as np
from pydantic import BaseModel, ConfigDict, field_validator
from pydantic.alias_generators import to_camel
from pydantic_numpy.helper.annotation import NpArrayPydanticAnnotation
from pydantic_numpy.model import NumpyModel

DvDNDArray = Annotated[
    np.ndarray[Any, None],
    NpArrayPydanticAnnotation.factory(
        data_type=None,
        dimensions=None,
        strict_data_typing=None,
    ),
]


class Aspect(str, Enum):
    """Class for aspect type."""

    auto = "auto"
    equal = "equal"


class ScaleType(str, Enum):
    """Class for scale type"""

    linear = "linear"
    log = "log"
    symlog = "symlog"
    sqrt = "sqrt"
    gamma = "gamma"


class TableDisplayType(str, Enum):
    """
    Class for table display type
    standard: plain number formatting with decimal places
    scientific: order-of-magnitude.
    """

    standard = "standard"
    scientific = "scientific"


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
