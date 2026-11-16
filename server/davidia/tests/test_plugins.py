import numpy as np

from davidia.models.messages import (
    ALL_MODELS,
    ClientConfigMessage,
    EventConfigModel,
    SourceConfigModel,
)
from davidia.models.selections import RectangularSelection
from davidia.server.fastapi_utils import as_model
from davidia.server.plugins import SourcePlugin
from davidia.server.plugins_lib import AABoxProfilePlugin, crossings, find_data_posns


class ExampleSourceConfig(SourceConfigModel):
    shape: tuple[int, int]
    period: float = 0.5


class ExampleSourcePlugin(SourcePlugin):
    def __init__(self, shape: tuple[int, int], period: float):
        self.shape = shape
        self.period = period


class ExampleEventConfig(EventConfigModel):
    x: bool = True
    period: float = 0.5


ALL_MODELS.insert(0, ExampleSourceConfig)
ALL_MODELS.insert(1, ExampleEventConfig)


def test_deserialization():
    ex_src_conf = ExampleSourceConfig(
        plugin=ExampleSourcePlugin.__name__, shape=(4, 3), period=1.5, activate=False
    )
    assert ex_src_conf == as_model(
        dict(
            plugin=ExampleSourcePlugin.__name__,
            shape=(4, 3),
            period=1.5,
            activate=False,
        )
    )

    ex_evt_conf = ExampleEventConfig(
        plugin=ExampleSourcePlugin.__name__, x=False, period=2.5
    )
    assert ex_evt_conf == as_model(
        dict(plugin=ExampleSourcePlugin.__name__, x=False, period=2.5)
    )

    ccm = ClientConfigMessage.model_validate(
        dict(
            source=dict(
                plugin=ExampleSourcePlugin.__name__,
                shape=(4, 3),
                period=1.5,
                activate=False,
            ),
            events=[dict(plugin=ExampleSourcePlugin.__name__, x=False, period=2.5)],
        )
    )
    print(ccm)
    assert ccm.source is not None
    assert ex_src_conf.model_dump() == ccm.source.model_dump()
    assert ccm.events is not None
    assert len(ccm.events) == 1
    assert ex_evt_conf.model_dump() == ccm.events[0].model_dump()


def test_crossings():
    d = np.array([-2, 0.5, 3.2, 2.7, -1.0])
    cs = crossings(d)
    assert np.all(cs == [0, 3])


def test_find_data_posns():
    a = np.array([-3.5, -2, -0.5, 1.2, 2.7, 3.7])
    posns = find_data_posns(-1.5, 1.8, a)
    assert posns == (1, 4)
    posns = find_data_posns(-4, 1.8, a)
    assert posns == (0, 4)
    posns = find_data_posns(-4, 3.8, a)
    assert posns == (0, 6)
    posns = find_data_posns(-6, -4.7, a)
    assert posns == (0, 0)
    posns = find_data_posns(4, 5.7, a)
    assert posns == (6, 6)
    a = a[::-1]  # [3.7, 2.7, 1.2, -0.5, -2, -3.5]
    posns = find_data_posns(-1.5, 1.8, a)
    assert posns == (2, 5)
    posns = find_data_posns(-4, 1.8, a)
    assert posns == (2, 6)
    posns = find_data_posns(-4, 3.8, a)
    assert posns == (0, 6)
    posns = find_data_posns(-6, -4.7, a)
    assert posns == (6, 6)
    posns = find_data_posns(4, 5.7, a)
    assert posns == (0, 0)


def test_aabox_profile():
    plugin = AABoxProfilePlugin()
    plugin.plot_id = ""
    rect = RectangularSelection(start=(1.7, 12), lengths=(23, 48.5))
    data = np.arange(32 * 64.0).reshape((64, 32))
    profx, profy = plugin.profile(rect, data)["plot_msg"].ml_data
    # slicing 12:61, 1:25
    assert np.all(profx.x == np.arange(1, 25))
    assert np.all(profx.y == (np.arange(24) * 49 + 56497))
    assert np.all(profy.x == np.arange(12, 61))
    assert np.all(profy.y == (np.arange(49) * 768 + 9516))
    assert profx.y.sum() == 1369452.0
    assert profx.y.sum() == profy.y.sum()

    # reverse axes
    axes = np.arange(data.shape[0])[::-1], np.arange(data.shape[1])[::-1]
    profx, profy = plugin.profile(rect, data, axes)["plot_msg"].ml_data
    # slicing 3:52, 7:31
    assert np.all(profx.x == np.arange(1, 25)[::-1])
    assert np.all(profx.y == (np.arange(24) * 49 + 42679))
    assert np.all(profy.x == np.arange(12, 61)[::-1])
    assert np.all(profy.y == (np.arange(49) * 768 + 2748))
    assert profx.y.sum() == 1037820.0
    assert profx.y.sum() == profy.y.sum()
