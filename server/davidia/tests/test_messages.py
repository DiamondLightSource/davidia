import numpy as np
import pytest

from davidia.models.parameters import PlotConfig
from davidia.models.messages import GlyphType
from davidia.models.messages import (
    DvDNDArray,
    LineData,
    LineParams,
    MultiLineMessage,
)
from davidia.server.plotserver import (
    add_indices,
    add_default_indices,
    add_colour_to_lines,
    check_line_names,
    combine_line_messages,
)


def test_validate_line_params():
    lp = LineParams.model_validate(dict())
    assert lp.glyph_type == GlyphType.Circle


def test_validate_line_data():
    lp = LineParams.model_validate(dict())
    ld = LineData.model_validate(dict(y=np.arange(12), line_params=lp))
    assert ld.default_indices

    ld = LineData.model_validate(dict(x=np.array([]), y=np.arange(12), line_params=lp))
    assert ld.default_indices

    ld = LineData.model_validate(dict(x=np.arange(12), y=np.arange(12), line_params=lp))
    assert not ld.default_indices


@pytest.mark.parametrize(
    "name,key,x,default_indices",
    [
        ("zero_x", "100", np.array([]), True),
        ("x_and_y", "101", np.array([0, 2]), False),
    ],
)
def test_line_data_initialization(name, key: str, x: list, default_indices: bool):
    a = LineData(
        key=key,
        line_params=LineParams(colour="blue", point_size=None),
        x=np.array(x),
        y=np.array([4, 2]),
    )
    assert a.default_indices == default_indices


def _array_equal(a: DvDNDArray | None, b: DvDNDArray | None):
    if a is None:
        return b is None
    if b is None:
        return False
    return np.array_equal(a, b)


def assert_line_data_are_equal(a: LineData, b: LineData):
    assert_line_params_are_equal(a.line_params, b.line_params)
    assert a.default_indices == b.default_indices
    assert _array_equal(a.x, b.x)
    assert np.array_equal(a.y, b.y)


def assert_line_params_are_equal(a: LineParams, b: LineParams):
    assert a.colour == b.colour
    assert a.line_on == b.line_on
    assert a.point_size == b.point_size
    assert a.glyph_type == b.glyph_type
    assert a.name == b.name


def assert_line_data_messages_are_equal(
    a: MultiLineMessage,
    b: MultiLineMessage,
):
    assert a.plot_config == b.plot_config
    assert a.append == b.append
    assert len(a.ml_data) == len(b.ml_data)
    for c, d in zip(a.ml_data, b.ml_data):
        assert_line_data_are_equal(c, d)


def generate_test_data(
    key,
    x=True,
    default_indices=False,
    combined=False,
    high=False,
    name="",
    colour=None,
):
    if key == "100":
        if combined:
            x_data = [0, 1, 2, 3, 4, 5, 6]
            y_data = [10, 20, 30, 70, 60, 50, 40]
        else:
            x_data = [0, 1, 2]
            y_data = [10, 20, 30]

    elif key == "200":
        if combined:
            y_data = [5, 10, 15, 20, 50, 70, 90]
            x_data = [2, 3, 4, 7, 8, 9, 10] if high else [0, 1, 2, 3, 4, 5, 6]
        else:
            y_data = [5, 10, 15]
            x_data = [2, 3, 4] if high else [0, 1, 2]

    elif key == "300":
        y_data = [14, 12, 10, 8]
        x_data = [2, 3, 7, 9] if high else [0, 1, 2, 3]

    elif key == "010":
        x_data = [3, 4, 5, 6]
        y_data = [70, 60, 50, 40]

    elif key == "020":
        x_data = [7, 8, 9, 10] if high else [3, 4, 5, 6]
        y_data = [20, 50, 70, 90]

    elif key == "030":
        x_data = [2, 3, 7, 9] if high else [0, 1, 2, 3]
        y_data = [14, 12, 10, 8]
    else:
        raise ValueError("Unknown key", key)

    return LineData(
        key=key,
        line_params=LineParams(name=name, colour=colour),
        x=np.array(x_data) if x else np.array([]),
        y=np.array(y_data),
        default_indices=default_indices,
    )


@pytest.mark.parametrize(
    "name,plot_id,current_data,new_points_msg,expected",
    [
        (
            "equal_length_no_default",
            "plot_0",
            MultiLineMessage(
                ml_data=[generate_test_data("100"), generate_test_data("200")]
            ),
            MultiLineMessage(
                append=True,
                ml_data=[generate_test_data("010"), generate_test_data("020")],
            ),
            (
                MultiLineMessage(
                    ml_data=[
                        generate_test_data("100", combined=True),
                        generate_test_data("200", combined=True),
                    ]
                ),
                MultiLineMessage(
                    append=True,
                    ml_data=[
                        generate_test_data("010", colour="#009e73"),
                        generate_test_data("020", colour="#e69d00"),
                    ],
                ),
            ),
        ),
        (
            "more_current_data_no_default",
            "plot_0",
            MultiLineMessage(
                ml_data=[
                    generate_test_data("100"),
                    generate_test_data("200", x=True, high=True),
                    generate_test_data("300", high=True),
                ]
            ),
            MultiLineMessage(
                append=True,
                ml_data=[
                    generate_test_data("010"),
                    generate_test_data("020", high=True),
                ],
            ),
            (
                MultiLineMessage(
                    ml_data=[
                        generate_test_data("100", combined=True),
                        generate_test_data("200", combined=True, high=True),
                        generate_test_data("300", high=True),
                    ]
                ),
                MultiLineMessage(
                    append=True,
                    ml_data=[
                        generate_test_data("010", colour="#009e73"),
                        generate_test_data("020", high=True, colour="#e69d00"),
                    ],
                ),
            ),
        ),
        (
            "more_append_data_no_default",
            "plot_0",
            MultiLineMessage(
                ml_data=[
                    generate_test_data("100"),
                    generate_test_data("200", high=True),
                ]
            ),
            MultiLineMessage(
                append=True,
                ml_data=[
                    generate_test_data("010"),
                    generate_test_data("020", high=True),
                    generate_test_data("030", high=True),
                ],
            ),
            (
                MultiLineMessage(
                    ml_data=[
                        generate_test_data("100", combined=True),
                        generate_test_data("200", combined=True, high=True),
                        generate_test_data("030", high=True, colour="#56b3e9"),
                    ]
                ),
                MultiLineMessage(
                    append=True,
                    ml_data=[
                        generate_test_data("010", colour="#009e73"),
                        generate_test_data("020", high=True, colour="#e69d00"),
                        generate_test_data("030", high=True, colour="#56b3e9"),
                    ],
                ),
            ),
        ),
        (
            "equal_length_default_indices",
            "plot_1",
            MultiLineMessage(
                ml_data=[
                    generate_test_data("100", default_indices=True, colour="#009e73"),
                    generate_test_data("200", default_indices=True, colour="#e69d00"),
                ]
            ),
            MultiLineMessage(
                append=True,
                ml_data=[
                    generate_test_data("010", x=False),
                    generate_test_data("020", high=False),
                ],
            ),
            (
                MultiLineMessage(
                    ml_data=[
                        generate_test_data(
                            "100", default_indices=True, combined=True, colour="#009e73"
                        ),
                        generate_test_data(
                            "200", default_indices=True, combined=True, colour="#e69d00"
                        ),
                    ]
                ),
                MultiLineMessage(
                    append=True,
                    ml_data=[
                        generate_test_data(
                            "010", default_indices=True, colour="#009e73"
                        ),
                        generate_test_data(
                            "020", default_indices=True, colour="#e69d00"
                        ),
                    ],
                ),
            ),
        ),
        (
            "more_current_data_default_indices",
            "plot_0",
            MultiLineMessage(
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("200", default_indices=True),
                    generate_test_data("300", default_indices=True),
                ]
            ),
            MultiLineMessage(
                append=True,
                ml_data=[
                    generate_test_data("010", x=False),
                    generate_test_data("020", x=False),
                ],
            ),
            (
                MultiLineMessage(
                    ml_data=[
                        generate_test_data("100", default_indices=True, combined=True),
                        generate_test_data("200", default_indices=True, combined=True),
                        generate_test_data("300", default_indices=True),
                    ]
                ),
                MultiLineMessage(
                    append=True,
                    ml_data=[
                        generate_test_data(
                            "010", default_indices=True, colour="#009e73"
                        ),
                        generate_test_data(
                            "020", default_indices=True, colour="#e69d00"
                        ),
                    ],
                ),
            ),
        ),
        (
            "more_current_data_default_indices_some_indices_given",
            "plot_0",
            MultiLineMessage(
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("200", default_indices=True),
                    generate_test_data("300", default_indices=True),
                ]
            ),
            MultiLineMessage(
                append=True,
                ml_data=[
                    generate_test_data("010", x=False),
                    generate_test_data("020", high=True),
                ],
            ),
            (
                MultiLineMessage(
                    ml_data=[
                        generate_test_data("100", default_indices=True, combined=True),
                        generate_test_data("200", default_indices=True, combined=True),
                        generate_test_data("300", default_indices=True),
                    ]
                ),
                MultiLineMessage(
                    append=True,
                    ml_data=[
                        generate_test_data(
                            "010", default_indices=True, colour="#009e73"
                        ),
                        generate_test_data(
                            "020", default_indices=True, colour="#e69d00"
                        ),
                    ],
                ),
            ),
        ),
        (
            "more_append_data_default_indices_indices_given",
            "plot_0",
            MultiLineMessage(
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("200", default_indices=True),
                ]
            ),
            MultiLineMessage(
                append=True,
                ml_data=[
                    generate_test_data("010"),
                    generate_test_data("020", high=True),
                    generate_test_data("030", high=True),
                ],
            ),
            (
                MultiLineMessage(
                    ml_data=[
                        generate_test_data("100", default_indices=True, combined=True),
                        generate_test_data("200", default_indices=True, combined=True),
                        generate_test_data(
                            "030", default_indices=True, colour="#56b3e9"
                        ),
                    ]
                ),
                MultiLineMessage(
                    append=True,
                    ml_data=[
                        generate_test_data(
                            "010", default_indices=True, colour="#009e73"
                        ),
                        generate_test_data(
                            "020", default_indices=True, colour="#e69d00"
                        ),
                        generate_test_data(
                            "030", default_indices=True, colour="#56b3e9"
                        ),
                    ],
                ),
            ),
        ),
        (
            "more_append_data_default_indices",
            "plot_0",
            MultiLineMessage(
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("200", default_indices=True),
                ]
            ),
            MultiLineMessage(
                append=True,
                ml_data=[
                    generate_test_data("010", x=False),
                    generate_test_data("020", x=False),
                    generate_test_data("030", x=False),
                ],
            ),
            (
                MultiLineMessage(
                    ml_data=[
                        generate_test_data("100", default_indices=True, combined=True),
                        generate_test_data("200", default_indices=True, combined=True),
                        generate_test_data(
                            "030", default_indices=True, colour="#56b3e9"
                        ),
                    ]
                ),
                MultiLineMessage(
                    append=True,
                    ml_data=[
                        generate_test_data(
                            "010", default_indices=True, colour="#009e73"
                        ),
                        generate_test_data(
                            "020", default_indices=True, colour="#e69d00"
                        ),
                        generate_test_data(
                            "030", default_indices=True, colour="#56b3e9"
                        ),
                    ],
                ),
            ),
        ),
    ],
)
def test_combine_line_messages(
    name: str,
    plot_id: str,
    current_data: MultiLineMessage,
    new_points_msg: MultiLineMessage,
    expected: tuple[MultiLineMessage, MultiLineMessage],
):
    ml_msg, al_msg = combine_line_messages(current_data, new_points_msg)

    assert_line_data_messages_are_equal(ml_msg, expected[0])
    assert_line_data_messages_are_equal(al_msg, expected[1])


@pytest.mark.parametrize(
    "name,msg,expected",
    [
        (
            "no_default_indices",
            MultiLineMessage(
                plot_config=PlotConfig(),
                ml_data=[generate_test_data("100"), generate_test_data("200")],
            ),
            MultiLineMessage(
                plot_config=PlotConfig(),
                ml_data=[generate_test_data("100"), generate_test_data("200")],
            ),
        ),
        (
            "default_indices",
            MultiLineMessage(
                plot_config=PlotConfig(),
                ml_data=[
                    generate_test_data("100", x=False),
                    generate_test_data("030", x=False),
                ],
            ),
            MultiLineMessage(
                plot_config=PlotConfig(),
                ml_data=[
                    generate_test_data("100", default_indices=True),
                    generate_test_data("030", default_indices=True),
                ],
            ),
        ),
    ],
)
def test_add_indices(name, msg: MultiLineMessage, expected: MultiLineMessage):
    add_indices(msg)

    assert_line_data_messages_are_equal(msg, expected)


@pytest.mark.parametrize(
    "name,msg,expected",
    [
        (
            "no_default_indices",
            MultiLineMessage(
                append=True,
                plot_config=PlotConfig(),
                ml_data=[generate_test_data("100"), generate_test_data("200")],
            ),
            MultiLineMessage(
                plot_config=PlotConfig(),
                ml_data=[
                    generate_test_data("100", colour="#009e73"),
                    generate_test_data("200", colour="#e69d00"),
                ],
            ),
        ),
        (
            "all_default_indices",
            MultiLineMessage(
                append=True,
                plot_config=PlotConfig(),
                ml_data=[
                    generate_test_data("100", x=False),
                    generate_test_data("030", x=False),
                ],
            ),
            MultiLineMessage(
                plot_config=PlotConfig(),
                ml_data=[
                    generate_test_data("100", default_indices=True, colour="#009e73"),
                    generate_test_data("030", default_indices=True, colour="#e69d00"),
                ],
            ),
        ),
        (
            "some_default_indices",
            MultiLineMessage(
                append=True,
                plot_config=PlotConfig(),
                ml_data=[generate_test_data("100"), generate_test_data("030", x=False)],
            ),
            MultiLineMessage(
                plot_config=PlotConfig(),
                ml_data=[
                    generate_test_data("100", default_indices=True, colour="#009e73"),
                    generate_test_data("030", default_indices=True, colour="#e69d00"),
                ],
            ),
        ),
    ],
)
def test_convert_append_to_multi_line_data_message(
    name, msg: MultiLineMessage, expected: MultiLineMessage
):
    add_default_indices(msg)
    add_colour_to_lines(msg.ml_data)
    msg.append = False
    assert_line_data_messages_are_equal(msg, expected)


@pytest.mark.parametrize(
    "name,input,expected",
    [
        (
            "all_lines_named",
            [
                generate_test_data(key="100", name="first"),
                generate_test_data(key="200", name="second"),
                generate_test_data(key="300", name="third"),
            ],
            [
                generate_test_data(key="100", name="first"),
                generate_test_data(key="200", name="second"),
                generate_test_data(key="300", name="third"),
            ],
        ),
        (
            "no_lines_named",
            [
                generate_test_data(key="100"),
                generate_test_data(key="200"),
                generate_test_data(key="300"),
            ],
            [
                generate_test_data(key="100", name="Line 0"),
                generate_test_data(key="200", name="Line 1"),
                generate_test_data(key="300", name="Line 2"),
            ],
        ),
        (
            "empty list",
            [],
            [],
        ),
        (
            "single_line_data",
            [generate_test_data(key="100", name="first")],
            [generate_test_data(key="100", name="first")],
        ),
        (
            "original_names_repeated",
            [
                generate_test_data(key="100", name="first"),
                generate_test_data(key="200", name="first"),
                generate_test_data(key="300", name="third"),
            ],
            [
                generate_test_data(key="100", name="first"),
                generate_test_data(key="200", name="first"),
                generate_test_data(key="300", name="third"),
            ],
        ),
        (
            "names_will_repeat",
            [
                generate_test_data(key="100", name="first"),
                generate_test_data(key="200", name="Line 1"),
                generate_test_data(key="300"),
            ],
            [
                generate_test_data(key="100", name="first"),
                generate_test_data(key="200", name="Line 1"),
                generate_test_data(key="300", name="Line 0"),
            ],
        ),
        (
            "multiple_names_will_repeat",
            [
                generate_test_data(key="100", name="Line 1"),
                generate_test_data(key="200"),
                generate_test_data(key="300"),
                generate_test_data(key="010", name="Line 0"),
                generate_test_data(key="020"),
            ],
            [
                generate_test_data(key="100", name="Line 1"),
                generate_test_data(key="200", name="Line 2"),
                generate_test_data(key="300", name="Line 3"),
                generate_test_data(key="010", name="Line 0"),
                generate_test_data(key="020", name="Line 4"),
            ],
        ),
    ],
)
def test_check_line_names(name, input: list[LineData], expected: list[LineData]):
    renamed_lines = check_line_names(input)

    for a, b in zip(expected, renamed_lines):
        assert_line_data_are_equal(a, b)
