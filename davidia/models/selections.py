"""
2D selections

All points are [x,y]
All angles in radians
"""
from math import atan2, cos, hypot, sin
from pydantic import BaseModel, parse_obj_as


class SelectionBase(BaseModel):
    """Base class for representing any selection"""

    name: str = ""
    color: str | None = None
    alpha: float = 1
    fixed: bool = True
    start: tuple[float, float]


class OrientableSelection(SelectionBase):
    """Base class for representing any orientable selection"""

    angle: float = 0


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


def as_selection(raw: dict) -> SelectionBase:
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
