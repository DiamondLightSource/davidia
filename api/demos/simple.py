from plot.utils import line, image, clear


def line_demo(p):
    line([5, 10, 15], [1.5, 4.5, 3.5], plot_id=f"plot_{p}")


def multiline_demo(p):
    yds = []
    for i in range(3):
        yds.append([(v + 0.2 * i) for v in (1.5, 4.5, 3.5)])
    line(
        [5, 10, 15],
        yds,
        plot_id=f"plot_{p}",
        color=["red", "green", "blue"],
        line_on=False,
        points_on=True
    )


def image_demo(p):
    image(
        values=[5, 10, 15, 1.5, 4.5, 3.5],
        shape=[2, 3],
        domain=[0, 20],
        plot_id=f"plot_{p}",
    )


if __name__ == "__main__":
    from time import sleep

    WAIT = 3
    p = 0
    for i in range(5):
        line_demo(p)
        sleep(WAIT)

        p = 1 - p
        clear(f"plot_{p}")
        image_demo(p)
        sleep(WAIT)

        p = 1 - p
        clear(f"plot_{p}")
        multiline_demo(p)
        sleep(WAIT)

        p = 1 - p
        clear(f"plot_{p}")
