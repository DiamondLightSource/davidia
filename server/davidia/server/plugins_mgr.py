import logging
from importlib import import_module
from importlib.metadata import entry_points
from inspect import getmembers, isclass
from types import ModuleType, NoneType
from typing import Annotated, TypeVar, Union

from pydantic import ConfigDict, Field, create_model

from ..models.messages import (
    ALL_MODELS,
    ClientConfigMessage,
    ConfigModel,
    SourceConfigModel,
)
from ..models.parameters import DvDModel
from . import plugins_lib
from .plugins import DavidiaPlugin, SourcePlugin

DAVIDIA_PLUGINS = "davidia.plugins"

logger = logging.getLogger("main")

DvDModelT = TypeVar("DvDModelT", bound=type[DvDModel])
DvDModelU = TypeVar("DvDModelU", bound=type[DvDModel])


def redefine_field_type(
    name: str, model_class: DvDModelT, field_types: dict[str, tuple[DvDModelU]]
) -> DvDModelT:
    new_fields = {}
    for n, i in model_class.model_fields.items():
        if n in field_types:
            ftypes = field_types[n]
            fi_dict = i.asdict()
            logger.info("Field '%s' had info: %s (%s)", n, i, ftypes)
            # pyrefly: ignore [not-a-type]
            i = Annotated[
                # pyrefly: ignore [not-a-type]
                Union[ftypes] if ftypes else NoneType,  # noqa: UP007
                *fi_dict["metadata"],
                Field(**fi_dict["attributes"]),
            ]
            logger.info("Field '%s' has info: %s", n, i)
        new_fields[n] = i
    # pyrefly: ignore [no-matching-overload]
    return create_model(
        name,
        __base__=model_class,
        __config__=ConfigDict(arbitrary_types_allowed=True),
        **new_fields,
    )


PluginClientConfigMessage = None


class PluginManager:
    """
    Handle plugins, their configs and deserialization from client messages
    """

    def __init__(self):
        self.sources: dict[str, type[SourcePlugin]] = {}
        # register from import
        src_configs = set()
        if ConfigModel in ALL_MODELS:
            ALL_MODELS.remove(ConfigModel)

        def gather_models(module: ModuleType, all_dvd_plugins=False):
            for n, o in getmembers(module):
                if isclass(o):
                    if issubclass(o, DavidiaPlugin) and all_dvd_plugins:
                        self.register(n, o)
                    elif issubclass(o, ConfigModel) and o not in ALL_MODELS:
                        logger.info("Extending models: %s", o)
                        ALL_MODELS.insert(0, o)
                        if (
                            issubclass(o, SourceConfigModel)
                            and o is not SourceConfigModel
                        ):
                            src_configs.add(o)

        gather_models(plugins_lib, True)

        # load and register from installation
        epts = entry_points(group=DAVIDIA_PLUGINS)
        for ept in epts:
            p = ept.load()
            if not issubclass(p, DavidiaPlugin):
                logger.warning(
                    "Ignoring entry point '%s' (%s) from '%s' package: must be a subclass of DavidiaPlugin (is %s)",
                    ept.name,
                    ept.value,
                    ept.dist,
                    type(p),
                )
                continue
            self.register(p.__name__, p)
            gather_models(import_module(ept.module))

        # update ClientConfigMessage's fields with all new source and event models
        if ClientConfigMessage in ALL_MODELS:
            ALL_MODELS.remove(ClientConfigMessage)

        global PluginClientConfigMessage
        if PluginClientConfigMessage is None:
            PluginClientConfigMessage = redefine_field_type(
                "PluginClientConfigMessage",
                ClientConfigMessage,
                # pyrefly: ignore [bad-argument-type]
                dict(source=tuple(src_configs)),
            )
            ALL_MODELS.append(PluginClientConfigMessage)

    def register(self, name: str, clazz: type[DavidiaPlugin]):
        if issubclass(clazz, SourcePlugin):
            if clazz is not SourcePlugin:
                logger.info("Register source: %s (%s)", name, clazz)
                self.sources[name] = clazz
        else:
            raise TypeError(f"Plugin {name} class ({type}) is not supported")

    def get_source_plugin(self, name: str) -> type[SourcePlugin] | None:
        return self.sources.get(name)
