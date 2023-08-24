import math
import numpy as np

from davidia.models.selections import (
    AxisSelection,
    LinearSelection,
    RectangularSelection,
    SelectionBase,
    AnySelection,
)

from pydantic.main import BaseModel


def create_axial():
    xs = AxisSelection(start=(1, 2), dimension=0, length=3.5)
    print(repr(xs))
    print(xs.model_dump())
    return xs


def create_linear():
    ls = LinearSelection(start=(1, 2), length=3.5, degrees=30)
    print(repr(ls))
    print(ls.model_dump())
    return ls


def create_rectangular():
    rs = RectangularSelection(start=(1, 2), lengths=(3.5, 1.7), angle=math.pi / 3)
    print(repr(rs))
    print(rs.model_dump())
    return rs


class MySBModel(BaseModel):
    base: SelectionBase
    any_sel: AnySelection


def test_generic_model():
    a = create_axial()
    assert np.isclose(a.length, 3.5)
    b = create_linear()
    assert np.isclose(b.degrees, 30)
    c = create_rectangular()
    assert np.isclose(c.degrees, 60)
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
