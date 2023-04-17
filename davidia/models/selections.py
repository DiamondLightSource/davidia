"""
2D selections

All points are [x,y]
All angles in radians
"""
from math import atan2, cos, degrees, hypot, radians, sin
from uuid import uuid4

from pydantic import BaseModel, Field, parse_obj_as


def _make_id():
    return str(uuid4())[-8:]  # use last 8 characters only


class SelectionBase(BaseModel):
    """Base class for representing any selection"""

    id: str = Field(default_factory=_make_id)
    name: str = ""
    colour: str | None = None
    alpha: float = 1
    fixed: bool = True
    start: tuple[float, float]


#    @property  # make read-only by omitting setter
#    def id(self):
#        return self.id


class OrientableSelection(SelectionBase):
    """Base class for representing any orientable selection"""

    angle: float = 0

    def __init__(self, degrees=None, **kw):
        """Initialize angle in degrees"""
        super().__init__(**kw)
        if degrees is not None:
            self.angle = radians(degrees)

    def __setattr__(self, key, val):
        method = self.__config__.property_set_methods.get(key)
        if method is None:
            super().__setattr__(key, val)
        else:
            getattr(self, method)(val)

    @property
    def degrees(self):
        """Get angle in degrees"""
        return degrees(self.angle)

    def _set_degrees(self, degrees):
        """Set angle in degrees"""
        self.angle = radians(degrees)

    class Config:
        property_set_methods = {"degrees": "_set_degrees"}


class LinearSelection(OrientableSelection):
    """Class for representing the selection of a line"""

    length: float

    @property
    def end(self) -> tuple[float, float]:
        """Get end point"""
        ll = self.length
        ang = self.alpha
        return cos(ang) * ll, sin(ang) * ll

    @end.setter
    def end(self, x: float, y: float):
        """Set from end point"""
        dx = x - self.start[0]
        dy = y - self.start[1]
        self.angle = atan2(dy, dx)
        self.length = hypot(dx, dy)


class RectangularSelection(OrientableSelection):
    """Class for representing the selection of a rectangle"""

    lengths: tuple[float, float]

    @property
    def end(self) -> tuple[float, float]:
        """Get end point"""
        a = self.alpha
        c = cos(a)
        s = sin(a)
        dx = self.lengths[0]
        dy = self.lengths[0]
        return self.start[0] + c * dx - s * dy, self.start[1] + s * dx + c * dy

    @end.setter
    def end(self, x: float, y: float):
        """Set from end point (preserving angle of orientation)"""
        dx = x - self.start[0]
        dy = y - self.start[1]
        a = self.alpha
        c = cos(a)
        s = sin(a)
        self.lengths = c * dx + s * dy, -s * dx + c * dy


class PolygonalSelection(SelectionBase):
    """Class for representing the selection of a polygon"""

    points: list[tuple[float, float]]


class EllipticalSelection(OrientableSelection):
    """Class for representing the selection of an ellipse"""

    semi_axes: tuple[float, float]


class CircularSelection(SelectionBase):
    """Class for representing the selection of a circle"""

    radius: float


class CircularSectorialSelection(SelectionBase):
    """Class for representing the selection of a circular sector"""

    radii: tuple[float, float]
    angles: tuple[float, float]


AnySelection = (
    LinearSelection
    | RectangularSelection
    | PolygonalSelection
    | CircularSelection
    | EllipticalSelection
    | CircularSectorialSelection
    | SelectionBase
)


def as_selection(raw: dict) -> AnySelection:
    if "length" in raw:
        oc = LinearSelection
    elif "lengths" in raw:
        oc = RectangularSelection
    elif "points" in raw:
        oc = PolygonalSelection
    elif "semi_axes" in raw:
        oc = EllipticalSelection
    elif "radius" in raw:
        oc = CircularSelection
    elif "radii" in raw:
        oc = CircularSectorialSelection
    else:
        raise ValueError(f"Unknown selection that has {list(raw.keys())}")
    return parse_obj_as(oc, raw)
