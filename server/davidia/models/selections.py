"""
2D selections

All points are [x,y]
All angles in radians
"""

import logging
from math import atan2, cos, degrees, hypot, inf, pi, radians, sin
from typing import Annotated, Any
from uuid import uuid4

from pydantic import (
    BeforeValidator,
    ConfigDict,
    Field,
    ValidationError,
    model_validator,
)

from .parameters import DvDModel

logger = logging.getLogger("main")


def _make_id():
    return uuid4().hex[-8:]  # use last 8 characters only


Number = float | int


def _make_float(x: Number) -> float:
    return x if isinstance(x, float) else float(x)


Float = Annotated[float, BeforeValidator(_make_float)]


def _make_tuple_floats(v: tuple[Number, Number]) -> tuple[float, float]:
    if len(v) != 2:
        raise ValidationError("tuple must have two items")
    if all(isinstance(i, float) for i in v):
        return v
    return (float(v[0]), float(v[1]))


FloatTuple = Annotated[tuple[float, float], BeforeValidator(_make_tuple_floats)]


def _update_minmax(minmax: list[FloatTuple], p: FloatTuple):
    """Update min and max with point"""
    x, y = p
    mn = minmax[0]
    mx = minmax[1]
    minmax[0] = min(mn[0], x), min(mn[1], y)
    minmax[1] = max(mx[0], x), max(mx[1], y)
    return minmax


def _offset_minmax(minmax: list[FloatTuple], p: FloatTuple):
    """Offset min and max by point"""
    x, y = p
    mn = minmax[0]
    mx = minmax[1]
    minmax[0] = mn[0] + x, mn[1] + y
    minmax[1] = mx[0] + x, mx[1] + y
    return minmax


class SelectionBase(DvDModel, validate_assignment=True):
    """Base class for representing any selection"""

    model_config = ConfigDict(
        extra="forbid"
    )  # need this to ensure dict validating to correct sub-models

    id: str = Field(default_factory=_make_id)
    name: str = ""
    colour: str | None = None
    alpha: float = 0.3
    fixed: bool = False
    permanent: bool = False
    start: FloatTuple

    def pts(self) -> list[FloatTuple]:
        """List of points"""
        return [self.start]

    def bounds(self) -> list[FloatTuple]:
        """Bounding box for selection as minimum and maximum points"""
        minmax = [(inf, inf), (-inf, -inf)]
        for p in self.pts():
            _update_minmax(minmax, p)
        return minmax


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

    def pts(self) -> list[FloatTuple]:
        delta = (self.length, 0.0) if self.dimension == 0 else (0.0, self.length)
        end = tuple(a + b for a, b in zip(self.start, delta))
        assert len(end) == 2
        return [self.start, end]


class OrientableSelectionBase(SelectionBase):
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


class LinearSelection(OrientableSelectionBase):
    """Class for representing the selection of a line"""

    length: Float

    def __init__(self, degrees=None, **data):  # for pyright
        super().__init__(degrees=degrees, **data)

    @property
    def end(self) -> FloatTuple:
        """Get end point"""
        ll = self.length
        ang = self.angle
        return cos(ang) * ll + self.start[0], sin(ang) * ll + self.start[1]

    def set_end(self, x: float, y: float):
        """Set from end point"""
        dx = x - self.start[0]
        dy = y - self.start[1]
        self.angle = atan2(dy, dx)
        self.length = hypot(dx, dy)

    def pts(self) -> list[FloatTuple]:
        return [self.start, self.end]


class RectangularSelection(OrientableSelectionBase):
    """Class for representing the selection of a rectangle"""

    lengths: FloatTuple

    def __init__(self, degrees=None, **data):  # for pyright
        super().__init__(degrees=degrees, **data)

    def point(self, u: float, v: float) -> FloatTuple:
        """Get point in normalized coordinates"""
        a = self.angle
        c = cos(a)
        s = sin(a)
        dx = u * self.lengths[0]
        dy = v * self.lengths[1]
        return self.start[0] + c * dx - s * dy, self.start[1] + s * dx + c * dy

    @property
    def end(self) -> FloatTuple:
        """Get end point"""
        return self.point(1, 1)

    def set_end(self, x: float, y: float):
        """Set from end point (preserving angle of orientation)"""
        dx = x - self.start[0]
        dy = y - self.start[1]
        a = self.angle
        c = cos(a)
        s = sin(a)
        self.lengths = c * dx + s * dy, -s * dx + c * dy

    def pts(self):
        return [self.start, self.point(1, 0), self.end, self.point(0, 1)]


class PolygonalSelection(SelectionBase):
    """Class for representing the selection of a polygon"""

    points: list[FloatTuple]
    closed: bool = True

    @model_validator(mode="before")
    @classmethod
    def check_start_and_points(cls, values: Any) -> Any:
        if not isinstance(values, dict):
            return values

        # Note start is ignored and duplicated from first point
        start = values.get("start", None)
        points = values.get("points", None)
        if start is not None:
            if len(start) != 2:
                raise ValueError("Start must have two values")
            if points is None or len(points) == 0:
                values["points"] = points = [start]
        else:
            if points is None or len(points) == 0:
                raise ValueError("At least one point must be specified")
            values["start"] = points[0]
        return values

    @model_validator(mode="after")
    def check_start(self) -> "PolygonalSelection":
        if len(self.points) == 0:
            raise ValueError("At least one point must be specified")
        pt = self.points[0]
        if self.start is not pt and (self.start[0] != pt[0] or self.start[1] != pt[1]):
            self.start = pt
            logger.warning("Overwriting start with first point")
        return self

    def pts(self) -> list[FloatTuple]:
        return list(self.points)


class EllipticalSelection(OrientableSelectionBase):
    """Class for representing the selection of an ellipse"""

    semi_axes: FloatTuple

    def __init__(self, degrees=None, **data):  # for pyright
        super().__init__(degrees=degrees, **data)

    def rel_point(self, a: float) -> FloatTuple:
        """Get point relative to centre in angle relative to major semiaxis"""
        ca = cos(self.angle)
        sa = sin(self.angle)
        cb = cos(a)
        sb = sin(a)
        # fmt: off
        return (self.semi_axes[0] * ca * cb - self.semi_axes[1] * sa * sb,
                self.semi_axes[0] * sa * cb + self.semi_axes[1] * ca * sb)
        # fmt: on

    def bounds(self) -> list[FloatTuple]:
        """Bounding box for selection as minimum and maximum points"""
        ca = cos(self.angle)
        sa = sin(self.angle)
        # angles which produce stationary points in x and y
        angles = (
            atan2(-self.semi_axes[1] * sa, self.semi_axes[0] * ca),
            atan2(self.semi_axes[1] * ca, self.semi_axes[0] * sa),
        )
        mn = self.rel_point(angles[0])
        minmax = [mn, mn]
        for b in (angles[0] + pi, angles[1], angles[1] + pi):
            p = self.rel_point(b)
            _update_minmax(minmax, p)

        _offset_minmax(minmax, self.start)
        return minmax


class CircularSelection(SelectionBase):
    """Class for representing the selection of a circle"""

    radius: Float

    def bounds(self) -> list[FloatTuple]:
        """Bounding box for selection as minimum and maximum points"""
        mn = tuple(s - self.radius for s in self.start)
        mx = tuple(s + self.radius for s in self.start)
        assert len(mn) == 2 and len(mx) == 2
        return [mn, mx]


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

    def point(self, a: float, radius: int) -> FloatTuple:
        """Get point at angle for given radius [0,1]"""
        ca = cos(a)
        sa = sin(a)
        r = self.radii[radius]
        return r * ca + self.start[0], r * sa + self.start[1]

    def pts(self):
        return [self.point(a, r) for a in self.angles for r in range(2)]

    def bounds(self) -> list[FloatTuple]:
        """Bounding box for selection as minimum and maximum points"""
        minmax = super().bounds()
        d90 = pi / 2
        a1, a2 = self.angles
        q1 = int(a1 / d90)  # quadrant index
        q2 = int(a2 / d90)
        for m in range(4):  # include enclosed cardinal points
            n = (q1 + m) % 4
            if n == q2:
                break
            _update_minmax(
                minmax, self.point((n + 1) * d90, 1)
            )  # add next cardinal point
        return minmax


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

    oc: type[AnySelection]
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
