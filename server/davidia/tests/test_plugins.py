from davidia.models.messages import ALL_MODELS, ClientConfigMessage, SourceConfigModel
from davidia.server.fastapi_utils import as_model
from davidia.server.plugins import SourcePlugin
from davidia.server.plugins_mgr import redefine_field_type


class ExampleSourceConfig(SourceConfigModel):
    shape: tuple[int, int]
    period: float = 0.5


class ExampleSourcePlugin(SourcePlugin):
    def __init__(self, shape: tuple[int, int], period: float):
        self.shape = shape
        self.period = period


ALL_MODELS.insert(0, ExampleSourceConfig)
CCM = redefine_field_type(
    "CCCM", ClientConfigMessage, {"source": (ExampleSourceConfig,)}
)


def test_deserialization():
    ex_conf = ExampleSourceConfig(
        plugin=ExampleSourcePlugin.__name__, shape=(4, 3), period=1.5, activate=False
    )
    assert ex_conf == as_model(
        dict(
            plugin=ExampleSourcePlugin.__name__,
            shape=(4, 3),
            period=1.5,
            activate=False,
        )
    )

    ccm = CCM.model_validate(
        dict(
            source=dict(
                plugin=ExampleSourcePlugin.__name__,
                shape=(4, 3),
                period=1.5,
                activate=False,
            ),
            events=None,
        )
    )
    print(ccm)
    assert ex_conf == ccm.source
