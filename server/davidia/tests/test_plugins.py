from davidia.models.messages import (
    ALL_MODELS,
    ClientConfigMessage,
    EventConfigModel,
    SourceConfigModel,
)
from davidia.server.fastapi_utils import as_model
from davidia.server.plugins import SourcePlugin


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
