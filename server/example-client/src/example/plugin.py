from asyncio import sleep

from davidia.models.messages import ImageData, ImageMessage, SourceConfigModel
from davidia.server.plugins import SourcePlugin
from numpy import uint8
from numpy.random import default_rng


class ExampleSourceConfig(SourceConfigModel):
    shape: tuple[int, int]
    period: float = 0.5


class ExampleSourcePlugin(SourcePlugin):
    def __init__(self, shape: tuple[int, int], period: float):
        self.shape = shape
        self.period = period
        self.rng = default_rng()

    def name(self):
        return "example source"

    def description(self):
        return f"generates a 2D array of uint8s {self.shape} every {self.period}s"

    async def has_next(self):
        await sleep(self.period)
        return True

    def next_data(self):
        data = ImageData(values=self.rng.integers(0, 256, size=self.shape, dtype=uint8))
        return ImageMessage(plot_id=self.plot_id, im_data=data)
