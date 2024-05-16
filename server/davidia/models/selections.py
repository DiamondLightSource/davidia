"""
2D selections

All points are [x,y]
All angles in radians
"""
import logging
from math import atan2, cos, degrees, hypot, pi, radians, sin
from uuid import uuid4

from pydantic import BeforeValidator, Field, model_validator
from typing import Annotated, Type

from .parameters import DvDModel


def _make_id():
    return uuid4().hex[-8:]  # use last 8 characters only


Number = float | int


def _make_float(x: Number) -> float:
    return x if isinstance(x, float) else float(x)


Float = Annotated[float, BeforeValidator(_make_float)]


def _make_tuple_floats(v: tuple[Number, Number]) -> tuple[float, float]:
    if all(isinstance(i, float) for i in v):
        return v
    return (float(v[0]), float(v[1]))


FloatTuple = Annotated[tuple[float, float], BeforeValidator(_make_tuple_floats)]


class SelectionBase(DvDModel, validate_assignment=True):
    """Base class for representing any selection"""

    id: str = Field(default_factory=_make_id)
    name: str = ""
    colour: str | None = None
    alpha: float = 0.3
    fixed: bool = True
    start: FloatTuple


#    @property  # make read-only by omitting setter
#    def id(self):
#        return self.id


class AxialSelection(SelectionBase):
    """Class for representing the selection of part of an axis"""

    length: Float
    dimension: int

    def _end_get(self) -> tuple[float, float]:
        """Get end point"""
        dx = self.length if self.dimension == 0 else 0
        dy = self.length if self.dimension == 1 else 0
        return self.start[0] + dx, self.start[1] + dy

    def _end_set(self, end: tuple[float, float]) -> None:
        d = self.dimension
        s = self.start[d]
        e = end[d] if len(end) == 2 else end[0]
        if e < s:
            self.start = (e, self.start[1]) if d == 0 else (self.start[0], e)
            self.length = s - e
        else:
            self.length = e - s

    end = property(_end_get, _end_set)


class OrientableSelection(SelectionBase):
    """Base class for representing any orientable selection"""

    angle: Float = 0.0

    def __init__(self, degrees=None, **data):
        """Initialize angle in degrees"""
        if degrees is not None:
            if "angle" in data:
                raise ValueError("Both angle and degrees must not be specified")
            data["angle"] = radians(degrees)
        super().__init__(**data)

    @property
    def degrees(self) -> float:
        """Get angle in degrees"""
        return degrees(self.angle)

    def set_degrees(self, degrees: float):
        """Set angle in degrees"""
        self.angle = radians(degrees)


class LinearSelection(OrientableSelection):
    """Class for representing the selection of a line"""

    length: Float

    def __init__(self, degrees=None, **data):  # for pyright
        super().__init__(degrees=degrees, **data)

    @property
    def end(self) -> tuple[float, float]:
        """Get end point"""
        ll = self.length
        ang = self.alpha
        return cos(ang) * ll, sin(ang) * ll

    def set_end(self, x: float, y: float):
        """Set from end point"""
        dx = x - self.start[0]
        dy = y - self.start[1]
        self.angle = atan2(dy, dx)
        self.length = hypot(dx, dy)


class RectangularSelection(OrientableSelection):
    """Class for representing the selection of a rectangle"""

    lengths: FloatTuple

    def __init__(self, degrees=None, **data):  # for pyright
        super().__init__(degrees=degrees, **data)

    @property
    def end(self) -> tuple[float, float]:
        """Get end point"""
        a = self.alpha
        c = cos(a)
        s = sin(a)
        dx = self.lengths[0]
        dy = self.lengths[0]
        return self.start[0] + c * dx - s * dy, self.start[1] + s * dx + c * dy

    def set_end(self, x: float, y: float):
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
    closed: bool

    def __init__(self, closed=True, **data):
        """Note start is ignored and duplicated from first point"""
        start = data.get("start", None)
        points = data.get("points", None)
        if start is not None:
            if len(start) != 2:
                raise ValueError("Start must have two values")
            if points is None or len(points) == 0:
                data["points"] = points = [start]
        else:
            if points is None or len(points) == 0:
                raise ValueError("At least one point must be specified")
            data["start"] = points[0]

        for p in points:
            if len(p) != 2:
                raise ValueError("Every point must have two values")
        super().__init__(closed=closed, **data)

    @model_validator(mode="after")
    def check_start(self) -> "PolygonalSelection":
        if len(self.points) == 0:
            raise ValueError("At least one point must be specified")
        pt = self.points[0]
        if self.start is not pt and (self.start[0] != pt[0] or self.start[1] != pt[1]):
            self.start = pt
            logging.warning("Overwriting start with first point")
        return self


class EllipticalSelection(OrientableSelection):
    """Class for representing the selection of an ellipse"""

    semi_axes: FloatTuple

    def __init__(self, degrees=None, **data):  # for pyright
        super().__init__(degrees=degrees, **data)


class CircularSelection(SelectionBase):
    """Class for representing the selection of a circle"""

    radius: Float


class CircularSectorialSelection(SelectionBase):
    """Class for representing the selection of a circular sector"""

    radii: FloatTuple
    angles: FloatTuple = (0.0, 2 * pi)

    def __init__(self, degrees=None, **data):
        """Initialize angles in degrees"""
        if degrees is not None:
            if "angles" in data:
                raise ValueError("Both angles and degrees must not be specified")
            data["angles"] = tuple(radians(d) for d in degrees)
        super().__init__(**data)

    @property
    def degrees(self) -> tuple[float, float]:
        """Get angle in degrees"""
        return (degrees(self.angles[0]), degrees(self.angles[1]))

    def set_degrees(self, degrees: tuple[Number, Number]):
        """Set angles in degrees"""
        self.angles = (radians(degrees[0]), radians(degrees[1]))


AnySelection = (
    AxialSelection
    | LinearSelection
    | RectangularSelection
    | PolygonalSelection
    | CircularSelection
    | EllipticalSelection
    | CircularSectorialSelection
    | SelectionBase
)


def as_selection(raw: dict | SelectionBase) -> AnySelection:
    if isinstance(raw, SelectionBase):
        return raw

    oc: Type[AnySelection]
    if "dimension" in raw:
        oc = AxialSelection
    elif "length" in raw:
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
        raise ValueError(f"Unknown selection that has {raw}")

    return oc.model_validate(raw)
