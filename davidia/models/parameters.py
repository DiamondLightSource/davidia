from enum import Enum
from pydantic import BaseModel, validator
from pydantic_numpy import NDArray


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

    displayType: TableDisplayType | None
    numberDigits: int | None

    @validator("numberDigits")
    @classmethod
    def validate_numberDigits(cls, v, values):
        if not v:
            return v
        if values["displayType"] == "scientific":
            x = min(v, 21)
            x = max(x, 1)
            return x
        x = min(v, 20)
        x = max(x, 0)
        return x


class AxesParameters(BaseModel):
    """Class for representing plot parameters."""

    x_label: str = ""
    y_label: str = ""
    x_scale: ScaleType = "linear"
    y_scale: ScaleType = "linear"
    x_values: NDArray | None = None
    y_values: NDArray | None = None
    title: str = ""
