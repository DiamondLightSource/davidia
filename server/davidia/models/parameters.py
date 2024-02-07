from enum import Enum
from typing import Any

import numpy as np
from numpy.typing import DTypeLike
from pydantic import BaseModel, ConfigDict, field_validator
from pydantic.functional_serializers import PlainSerializer
from pydantic_numpy.helper.annotation import (NpArrayPydanticAnnotation,
                                              _data_type_resolver, _int_to_dim_type)
from pydantic_numpy.model import NumpyModel
from typing_extensions import Annotated


def dvd_np_array_pydantic_annotated_typing(  # hacked version to remove FilePath and MultiArrayNumpyFile so type is ArrayLike
    data_type: DTypeLike = None,
    dimensions: int | None = None,
    strict_data_typing: bool = False,
):
    """
    Generates typing and pydantic annotation of a np.ndarray parametrized with given constraints

    Parameters
    ----------
    data_type: DTypeLike
    dimensions: Optional[int]
        Number of dimensions determine the depth of the numpy array.
    strict_data_typing: bool
        If True, the dtype of the numpy array must be identical to the data_type. No conversion attempts.

    Returns
    -------
    type-hint for np.ndarray with Pydantic support
    """
    return Annotated[
        np.ndarray[
            _int_to_dim_type[dimensions]  # pyright: ignore[reportGeneralTypeIssues]
            if dimensions
            else Any,
            np.dtype[data_type]  # pyright: ignore[reportGeneralTypeIssues]
            if _data_type_resolver(data_type)
            else data_type,  # pyright: ignore[reportGeneralTypeIssues]
        ],
        NpArrayPydanticAnnotation.factory(
            data_type=data_type,
            dimensions=dimensions,
            strict_data_typing=strict_data_typing,
        ),
        PlainSerializer(
            lambda x: x.tolist(), return_type=list, when_used="json-unless-none"
        ),
    ]


DvDNDArray = dvd_np_array_pydantic_annotated_typing()


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

    displayType: TableDisplayType | None = None
    numberDigits: int | None = None

    @field_validator("numberDigits")
    @classmethod
    def validate_numberDigits(cls, v, info):
        if not v:
            return v
        if info.data["displayType"] == TableDisplayType.scientific:
            x = min(v, 21)
            x = max(x, 1)
            return x
        x = min(v, 20)
        x = max(x, 0)
        return x


class AxesParameters(NumpyModel):
    """Class for representing plot parameters."""

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
