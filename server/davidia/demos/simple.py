import numpy as np
from davidia.models.parameters import Aspect, TableDisplayType
from davidia.plot import (
    LinearSelection,
    RectangularSelection,
    clear,
    image,
    line,
    region,
    scatter,
    surface,
    table,
)


def line_demo(p, no_x=False):
    if no_x:
        x = [1.5, 4.5, 3.5]
        y = None
        x_label = "index"
    else:
        x = [4.8, 10, 15.1]
        y = [1.5, 4.5, 3.5]
        x_label = "x-axis"
    line(
        x=x,
        y=y,
        plot_config={
            "x_label": x_label,
            "y_label": "y-axis",
            "x_scale": "linear",
            "y_scale": "linear",
            "title": "line demo plot",
        },
        plot_id=f"plot_{p}",
        line_on=False,
        point_size=8,
        glyph_type="Circle",
        colour="red",
    )


def multiline_demo(p, no_x=False):
    if no_x:
        x = [[(v + 0.2 * i) for v in (1.5, 4.5, 3.5)] for i in range(3)]
        yds = None
        x_label = "index"
    else:
        x = [4.8, 10, 15.1]
        yds = [[(v + 0.2 * i) for v in (1.5, 4.5, 3.5)] for i in range(3)]
        x_label = "x-axis"
    line(
        x=x,
        y=yds,
        plot_config={
            "x_label": x_label,
            "y_label": "y-axis",
            "x_scale": "linear",
            "y_scale": "linear",
            "title": "multiline demo plot",
        },
        plot_id=f"plot_{p}",
        line_on=True,
    )


def append_lines_demo(p, no_x=False):
    if no_x:
        x = [[-2.5, 0, 2.5], [], [14, 15, 14.2]]
        yds = None
    else:
        x = [[20, 25, 30], [], [20, 25, 30]]
        yds = [[-2.5, 0, 2.5], [], [14, 15, 14.2]]
    line(x=x, y=yds, append=True, plot_id=f"plot_{p}", line_on=True)


def append_more_lines_demo(p, no_x=False):
    if no_x:
        x = [[6, 10, 8], [5, 10, 17.2], []]
        yds = None
    else:
        x = [[35, 40, 45], [20, 25, 30], []]
        yds = [[6, 10, 8], [5, 10, 17.2], []]
    line(x=x, y=yds, append=True, plot_id=f"plot_{p}", line_on=True)


def heatmap_demo(p, high=False):
    image(
        [[5, 30, 45], [1.5, 4.5, 3.5]] if high else [[5, 10, 15], [1.5, 4.5, 3.5]],
        domain=[0, 50] if high else [0, 20],
        heatmap_scale="linear",
        colour_map="Inferno",
        aspect=Aspect.auto,
        plot_config={
            "x_label": "x-axis",
            "y_label": "y-axis",
            "x_values": [18, 20, 22, 24],
            "y_values": [-4, 0, 4],
            "title": "heatmap demo plot",
        },
        plot_id=f"plot_{p}",
    )


def image_demo(p):
    image(
        [
            [[0, 255, 255], [255, 0, 255], [255, 255, 0], [0, 0, 255]],
            [[0, 0, 0], [85, 85, 85], [255, 255, 255], [170, 170, 170]],
        ],
        aspect="equal",
        plot_config={
            "x_label": "x-axis",
            "y_label": "y-axis",
            "x_values": [4, 5, 6, 7, 8],
            "y_values": [7, 10, 13],
            "title": "image demo plot",
        },
        plot_id=f"plot_{p}",
    )


def scatter_demo(p):
    scatter(
        x=[max(0.1, x) % 20 for x in range(20)],
        y=[y % 10 for y in range(20)],
        point_values=[6 * i for i in range(20)],
        domain=(0, 114),
        plot_config={
            "x_label": "x-axis",
            "y_label": "y-axis",
            "x_scale": "log",
            "y_scale": "linear",
            "title": "scatter demo plot",
        },
        plot_id=f"plot_{p}",
        colour_map="Cividis",
    )


def surface_demo(p):
    xx, yy = np.meshgrid(np.arange(-3, 6.0), np.array([-2, -0.5, 0, 1, 2.5, 1, 0, -1]))
    surface_data = np.sin(xx) + yy
    surface(
        surface_data,
        domain=(-4, 4),
        surface_scale="linear",
        colour_map="Turbo",
        plot_config={
            "x_label": "x-axis",
            "y_label": "y-axis",
            "x_values": [18, 20, 22, 24, 26, 28, 30, 32],
            "y_values": [-12, -10, -8, -4, 0, 4, 8, 10, 12],
            "title": "surface demo plot",
        },
        plot_id=f"plot_{p}",
    )


def table_demo(p):
    table(
        [[6.23 * i for i in range(20)]] * 5,
        cell_width=120,
        display_style=TableDisplayType.scientific,
        number_digits=1,
        plot_id=f"plot_{p}",
    )


def regions_demo(p):
    region(
        selections=[
            RectangularSelection(
                start=(3.5, 6.5),
                lengths=(3.2, 2.0),
                angle=0.1,
                colour="green",
                alpha=0.7,
            ),
            LinearSelection(
                start=(6.9, 10.5), length=2.0, angle=1.1, colour="cyan", alpha=0.6
            ),
        ],
        plot_id=f"plot_{p}",
    )
    rs = region(plot_id=f"plot_{p}")
    print(rs)
    return rs


def run_all_demos(wait=3, repeats=5):
    """Run all demos in example app which has plot_0 and plot_1

    Parameters
    ----------
    wait : int, optional
        time to wait between plot changes, by default 3
    repeats : int, optional
        number of times to show all demos, by default 5
    """
    from time import sleep

    p = 0
    for _ in range(repeats):
        line_demo(p)
        sleep(wait)

        p = 1 - p
        clear(f"plot_{p}")
        line_demo(p, True)
        sleep(wait)

        p = 1 - p
        clear(f"plot_{p}")
        heatmap_demo(p)
        sleep(wait)

        p = 1 - p
        clear(f"plot_{p}")
        multiline_demo(p)
        sleep(wait)
        append_lines_demo(p)
        sleep(wait)
        append_more_lines_demo(p)
        sleep(wait)

        p = 1 - p
        clear(f"plot_{p}")
        multiline_demo(p, True)
        sleep(wait)
        append_lines_demo(p, True)
        sleep(wait)
        append_more_lines_demo(p, True)
        sleep(wait)

        p = 1 - p
        clear(f"plot_{p}")
        image_demo(p)
        regions_demo(p)
        sleep(wait)

        p = 1 - p
        clear(f"plot_{p}")
        scatter_demo(p)
        sleep(wait)

        p = 1 - p
        clear(f"plot_{p}")
        surface_demo(p)
        sleep(wait)

        p = 1 - p
        clear(f"plot_{p}")
        table_demo(p)
        sleep(wait)

        p = 1 - p
        clear(f"plot_{p}")


if __name__ == "__main__":
    run_all_demos()
