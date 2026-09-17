import logging
from importlib import import_module
from importlib.metadata import entry_points
from inspect import getmembers, isclass
from types import ModuleType

from ..models.messages import (
    ALL_MODELS,
    ConfigModel,
    EventConfigModel,
    SourceConfigModel,
)
from . import plugins_lib
from .plugins import DavidiaPlugin, EventPlugin, SelectionEventPlugin, SourcePlugin
from .plugins_lib import DavidiaProfilePlugin

DAVIDIA_PLUGINS = "davidia.plugins"

logger = logging.getLogger("main")


class PluginManager:
    """
    Handle plugins, their configs and deserialization from client messages
    """

    def __init__(self):
        self.events: dict[str, type[EventPlugin]] = {}
        self.sources: dict[str, type[SourcePlugin]] = {}
        # register from import
        evt_configs = set()
        src_configs = set()
        if ConfigModel in ALL_MODELS:
            ALL_MODELS.remove(ConfigModel)

        def gather_models(module: ModuleType, all_dvd_plugins=False):
            for n, o in getmembers(module):
                if isclass(o):
                    if issubclass(o, DavidiaPlugin) and all_dvd_plugins:
                        self.register(n, o)
                    elif issubclass(o, ConfigModel) and o not in ALL_MODELS:
                        extended = False
                        if (
                            issubclass(o, SourceConfigModel)
                            and o is not SourceConfigModel
                        ):
                            src_configs.add(o)
                            extended = True
                        elif (
                            issubclass(o, EventConfigModel)
                            and o is not EventConfigModel
                        ):
                            evt_configs.add(o)
                            extended = True

                        if extended:
                            logger.debug("Extending models: %s", o)
                            ALL_MODELS.insert(0, o)

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

    def register(self, name: str, clazz: type[DavidiaPlugin]):
        if issubclass(clazz, SourcePlugin):
            if clazz is not SourcePlugin:
                logger.debug("Register source: %s (%s)", name, clazz)
                self.sources[name] = clazz
        elif issubclass(clazz, EventPlugin):
            if clazz not in (EventPlugin, SelectionEventPlugin, DavidiaProfilePlugin):
                logger.debug("Register event: %s (%s)", name, clazz)
                self.events[name] = clazz
        elif clazz is not DavidiaPlugin:
            raise TypeError(f"Plugin {name} class ({clazz}) is not supported")

    def get_event_plugin(self, name: str) -> type[EventPlugin] | None:
        return self.events.get(name)

    def get_source_plugin(self, name: str) -> type[SourcePlugin] | None:
        return self.sources.get(name)
