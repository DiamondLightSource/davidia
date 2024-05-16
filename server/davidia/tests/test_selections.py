from math import pi

import numpy as np
import pytest
from davidia.models.selections import (
    AnySelection,
    AxialSelection,
    CircularSectorialSelection,
    CircularSelection,
    EllipticalSelection,
    LinearSelection,
    PolygonalSelection,
    RectangularSelection,
    SelectionBase,
    as_selection,
)
from pydantic.main import BaseModel

parameters = [
    (
        AxialSelection,
        dict(start=(1, 2), dimension=0, length=3.5),
        dict(length=3.5),
        dict(length=4),
    ),
    (
        LinearSelection,
        dict(start=(1, 2), length=3.5, degrees=30),
        dict(degrees=30),
        dict(angle=1),
    ),
    (
        RectangularSelection,
        dict(start=(1, 2), lengths=(3.5, 1.7), angle=pi / 3),
        dict(lengths=(3.5, 1.7)),
        dict(angle=1),
    ),
    (
        PolygonalSelection,
        dict(start=None, points=[(3.5, 1.7), (4.1, -3)]),
        dict(start=(3.5, 1.7)),
        dict(points=[(3.5, -1.7)]),
    ),
    (CircularSelection, dict(start=(1, 2), radius=3), dict(radius=3.0), dict(radius=2)),
    (
        EllipticalSelection,
        dict(start=(1, 2), semi_axes=(2, 3.5)),
        dict(semi_axes=(2, 3.5)),
        dict(semi_axes=(3.2, 8)),
    ),
    (
        CircularSectorialSelection,
        dict(start=(1, 2), radii=(3, 5)),
        dict(radii=(3.0, 5.0)),
        dict(radii=(2, 6)),
    ),
]


def create_from_parameters(param):
    return param[0](**param[1])


@pytest.mark.parametrize("s_cls,args,check,change", parameters)
def test_selection(s_cls, args, check, change):
    ts = s_cls(**args)
    print(repr(ts))
    for f, v in check.items():
        assert np.all(np.isclose(getattr(ts, f), v))
    print(ts.model_dump())
    for f, v in change.items():
        setattr(ts, f, v)
    for f, v in change.items():
        assert np.all(np.isclose(getattr(ts, f), v))
    assert isinstance(as_selection(ts.model_dump()), s_cls)


def test_polygonal():
    with pytest.raises(ValueError):
        PolygonalSelection()
    with pytest.raises(ValueError):
        PolygonalSelection(points=[])
    with pytest.raises(ValueError):
        PolygonalSelection(start=[1])
    with pytest.raises(ValueError):
        PolygonalSelection(start=[1, 2, 3])

    ps = PolygonalSelection(points=[(2, 3)])
    assert all(np.isclose(ps.start, ps.points[0]))
    ps = PolygonalSelection(start=(2, 3))
    assert all(np.isclose(ps.start, ps.points[0]))
    ps = PolygonalSelection(start=(2, 3), points=[])
    assert all(np.isclose(ps.start, ps.points[0]))
    ps = PolygonalSelection(start=(2, 3), points=[(3, 2)])  # warns
    assert all(np.isclose(ps.start, (3, 2)))
    assert ps.closed
    ps = PolygonalSelection(start=(2, 3), points=[(2, 3), (3, 2)], closed=False)
    assert all(np.isclose(ps.start, (2, 3)))
    assert not ps.closed


def test_degrees():
    ls = LinearSelection(start=(1, 2), length=3.5, degrees=30)
    assert np.isclose(ls.angle, pi / 6)
    assert np.isclose(ls.degrees, 30)
    ls = LinearSelection(start=(1, 2), length=3.5, angle=pi / 3)
    assert np.isclose(ls.angle, pi / 3)
    assert np.isclose(ls.degrees, 60)
    ls.set_degrees(45)
    assert np.isclose(ls.angle, pi / 4)
    assert np.isclose(ls.degrees, 45)
    cs = CircularSectorialSelection(start=(1, 2), radii=(3.5, 5))
    assert all(np.isclose(cs.angles, (0, 2 * pi)))
    assert all(np.isclose(cs.degrees, (0, 360)))
    cs = CircularSectorialSelection(start=(1, 2), radii=(3.5, 5), degrees=(30, 120))
    assert all(np.isclose(cs.angles, (pi / 6, 2 * pi / 3)))
    assert all(np.isclose(cs.degrees, (30, 120)))
    cs.set_degrees((45, 180))
    assert all(np.isclose(cs.angles, (pi / 4, pi)))
    assert all(np.isclose(cs.degrees, (45, 180)))


class MySBModel(BaseModel):
    base: SelectionBase
    any_sel: AnySelection


def test_generic_model():
    b = create_from_parameters(parameters[1])
    c = create_from_parameters(parameters[2])
    x = MySBModel(base=b, any_sel=c)
    dx = x.model_dump()
    print(dx)
    assert "start" in dx["base"]
    assert "angle" not in dx["base"]
    assert "length" not in dx["base"]
    assert "start" in dx["any_sel"]
    assert "angle" in dx["any_sel"]
    assert "lengths" in dx["any_sel"]


if __name__ == "__main__":
    test_generic_model()
    test_polygonal()
    p = create_from_parameters(parameters[3])
