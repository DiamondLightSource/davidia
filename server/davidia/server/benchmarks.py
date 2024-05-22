import logging
from datetime import datetime
from enum import Enum
from pathlib import Path

import numpy as np
from PIL import Image as im
from pydantic import BaseModel

from ..models.messages import (
    AppendLineDataMessage,
    HeatmapData,
    ImageData,
    ImageDataMessage,
    LineData,
    LineParams,
    MultiLineDataMessage,
)
from ..models.parameters import Aspect, PlotConfig, ScaleType

logger = logging.getLogger("benchmarks")


class PlotType(str, Enum):
    """Class for plot type"""

    multiline = "multiline"
    add_data = "add_data"
    heatmap = "heatmap"
    image = "image"


class BenchmarkParams(BaseModel):
    """Parameters for benchmark"""

    plot_type: PlotType
    params: list[int | float]
    iterations: int = 1
    pause: float


def _timestamp():
    return datetime.now().strftime("%Y%m%d%H%M%S")


DATA_PATH = Path(__file__).parents[1] / "data"
BENCHMARK_HELP: dict[PlotType, str] = {}


ML_DEFAULT_PARAMS = [5, 10240]
BENCHMARK_HELP[PlotType.multiline] = f"""number of lines, number of initial points,
    {ML_DEFAULT_PARAMS}"""


def multiline(params: list[int | float]):
    f"""Generate messages for benchmarking the plotting of lines

    Parameters
    ----------
    params: [int, int] = {BENCHMARK_HELP[PlotType.multiline]}

    Returns
    -------
    Generator of messages
    """
    params.extend(ML_DEFAULT_PARAMS[len(params) :])
    lines, points = (int(p) for p in params)
    multilines = []
    logger.debug("Using %i points:", points)
    xi = np.arange(points, dtype=np.int32)
    for n in range(lines):
        offset = 1000 - n * 160
        x = xi - offset
        y = (x % 1000 + x % 100 + x % 10).astype(np.float64)
        multilines.append(
            LineData(key=_timestamp(), line_params=LineParams(), x=xi, y=y)
        )
    yield MultiLineDataMessage(ml_data=multilines)


AD_DEFAULT_PARAMS = [5, 10240, 512, 32]
BENCHMARK_HELP[PlotType.add_data] = f"""number of lines, number of initial points,
    number of additional points, number of batches,
    {AD_DEFAULT_PARAMS}"""


def add_data(params: list[int | float]):
    f"""Generate messages for benchmarking the plotting of extra data for lines

    Parameters
    ----------
    params: [int, int, int, int] = {BENCHMARK_HELP[PlotType.add_data]}

    Returns
    -------
    Generator of plot messages
    """
    params.extend(AD_DEFAULT_PARAMS[len(params) :])
    params = [int(p) for p in params]
    logger.debug("Using parameters: %s", params)
    total = list(params)
    lines, points, added, batches = (int(p) for p in params)
    yield from multiline(params[:2])

    total = points
    for _ in range(batches):
        multilines = []
        xi = np.arange(added, dtype=np.int32) + total
        for n in range(lines):
            offset = 1000 - n * 160
            x = xi - offset
            y = (x % 1000 + x % 100 + x % 10).astype(np.float64)
            multilines.append(
                LineData(key=_timestamp(), x=xi, y=y, line_params=LineParams())
            )

        total += added
        yield AppendLineDataMessage(al_data=multilines)


def get_image(cache: list, name: str, i: int):
    if len(cache) <= i:
        cache.append(np.asarray(im.open(DATA_PATH / name)))
    return cache[i]


IMAGES_CACHE = []


def image(params: list[int | float]):
    """Generate plot messages for benchmarking the plotting of an image

    Parameters
    ----------
    params : list[int|float]

    Returns
    -------
    Generator of plot messages

    """
    for i in range(10):
        values = get_image(IMAGES_CACHE, f"label-{i}.png", i)
        x_values = np.arange(values.shape[1])
        y_values = np.arange(values.shape[0])
        data = ImageData(values=values, aspect=Aspect.equal)
        plot_config = PlotConfig(
            x_label="x-axis",
            y_label="y-axis",
            x_values=x_values,
            y_values=y_values,
            title="image benchmarking plot",
        )
        yield ImageDataMessage(im_data=data, plot_config=plot_config)


HEATMAPS_CACHE = []


def heatmap(params: list[int | float]):
    """Generate plot messages for benchmarking the plotting of a heatmap

    Parameters
    ----------
    params : list[int|float]

    Returns
    -------
    Generator of plot messages

    """
    for i in range(10):
        values = get_image(HEATMAPS_CACHE, f"blobs-{i}.png", i)
        x_values = np.arange(values.shape[1])
        y_values = np.arange(values.shape[0])
        data = HeatmapData(
            values=values,
            domain=(0, 255),
            aspect=Aspect.auto,
            heatmap_scale=ScaleType.linear,
            colour_map="RdBu",
        )
        plot_config = PlotConfig(
            x_label="x-axis",
            y_label="y-axis",
            x_values=x_values,
            y_values=y_values,
            title="heatmap benchmarking plot",
        )
        yield ImageDataMessage(im_data=data, plot_config=plot_config)
