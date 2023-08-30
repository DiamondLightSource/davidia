"""
2D selections

All points are [x,y]
All angles in radians
"""
from math import atan2, cos, degrees, hypot, radians, sin
from uuid import uuid4

from pydantic import BaseModel, Field


def _make_id():
    return str(uuid4())[-8:]  # use last 8 characters only


class SelectionBase(BaseModel):
    """Base class for representing any selection"""

    id: str = Field(default_factory=_make_id)
    name: str = ""
    colour: str | None = None
    alpha: float = 0.3
    fixed: bool = True
    start: tuple[float, float]


#    @property  # make read-only by omitting setter
#    def id(self):
#        return self.id


class AxialSelection(SelectionBase):
    """Class for representing the selection of part of an axis"""

    length: float
    dimension: int

    @property
    def end(self) -> tuple[float, float]:
        """Get end point"""
        dx = self.length if self.dimension == 0 else 0
        dy = self.length if self.dimension == 1 else 0
        return self.start[0] + dx, self.start[1] + dy

    @end.setter
    def end_set(self, x: float, y: float) -> None:
        d = self.dimension
        s = self.start[d]
        e = x if d == 0 else y
        if e < s:
            self.start = (e, self.start[1]) if d == 0 else (self.start[0], e)
            self.length = s - e
        else:
            self.length = e - s


class OrientableSelection(SelectionBase):
    """Base class for representing any orientable selection"""

    angle: float = 0

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

    @degrees.setter
    def degrees_set(self, degrees: float):
        """Set angle in degrees"""
        self.angle = radians(degrees)


class LinearSelection(OrientableSelection):
    """Class for representing the selection of a line"""

    length: float

    def __init__(self, degrees=None, **data):  # for pyright
        super().__init__(degrees=degrees, **data)

    @property
    def end(self) -> tuple[float, float]:
        """Get end point"""
        ll = self.length
        ang = self.alpha
        return cos(ang) * ll, sin(ang) * ll

    @end.setter
    def end_set(self, x: float, y: float):
        """Set from end point"""
        dx = x - self.start[0]
        dy = y - self.start[1]
        self.angle = atan2(dy, dx)
        self.length = hypot(dx, dy)


class RectangularSelection(OrientableSelection):
    """Class for representing the selection of a rectangle"""

    lengths: tuple[float, float]

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

    @end.setter
    def end_set(self, x: float, y: float):
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


class EllipticalSelection(OrientableSelection):
    """Class for representing the selection of an ellipse"""

    semi_axes: tuple[float, float]

    def __init__(self, degrees=None, **data):  # for pyright
        super().__init__(degrees=degrees, **data)


class CircularSelection(SelectionBase):
    """Class for representing the selection of a circle"""

    radius: float


class CircularSectorialSelection(SelectionBase):
    """Class for representing the selection of a circular sector"""

    radii: tuple[float, float]
    angles: tuple[float, float]


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
        raise ValueError(f"Unknown selection that has {list(raw.keys())}")

    return oc.model_validate(raw)
