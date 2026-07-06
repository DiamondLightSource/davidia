import asyncio
import logging
from abc import ABC, abstractmethod
from asyncio import AbstractEventLoop
from threading import Thread

from davidia.models.messages import _BasePlotMessage

from .plotserver import PlotServer

DAVIDIA_PLUGINS = "davidia.plugins"

logger = logging.getLogger("main")


class DavidiaPlugin(ABC):
    """Plugin specification for Davidia

    setup.py has:
    setup(
        name="dvd-myplugin",
        install_requires=["davidia"],
        entry_points={"davidia.plugins": ["myplugin = dvd_evtplugins:dvd_myplugin_a"]},
        py_modules=["dvd_evtplugins"],
    )

    pyproject.toml has:
    [project.entry-points."davidia.plugins"]
    myplugin = "dvd_evtplugins:dvd_myplugin_a"

    # name = "module:class"
    """

    @abstractmethod
    def name(self) -> str:
        """Return name of plugin"""

    @abstractmethod
    def description(self) -> str:
        """Return description of plugin"""


class SourcePlugin(DavidiaPlugin):
    """
    Hooks an external source and pushes data to plot server for a named plot
    """

    server: PlotServer
    plot_id: str
    def _bind(self, server: PlotServer, plot_id: str):
        """
        Bind plugin
        server: plot server
        plot_id: name of plot
        """
        self.server = server
        self.plot_id = plot_id
        self.loop: AbstractEventLoop | None = None

    @abstractmethod
    def next_data(self) -> _BasePlotMessage | None:
        """
        Return next data
        """

    @abstractmethod
    async def has_next(self) -> bool:
        """
        Return true if has more data
        """

    async def start(self):
        """
        Start hook
        """
        self.loop = loop = asyncio.new_event_loop()

        def start_loop():
            asyncio.set_event_loop(loop)
            logger.debug("Looping forever %s", self.name())
            try:
                loop.run_forever()
            finally:
                logger.debug("Closing loop %s", self.name())
                loop.close()

        thd = Thread(target=start_loop, args=())
        thd.start()

        async def loop_task():
            logger.debug("Starting loop task %s", self.name())
            while True:
                data = self.next_data()
                if data:
                    await self.push_data(data)
                if not await self.has_next():
                    break
            logger.debug("Stopped loop task %s", self.name())
        
        asyncio.run_coroutine_threadsafe(loop_task(), loop)

    def stop(self):
        if self.loop is None:
            return
        self.loop.stop()
        self.loop = None

    async def push_data(self, data: _BasePlotMessage):
        """
        Push data to plot server and send to clients
        """
        await self.server._update_and_add_message(self.plot_id, data, None)
        await self.server.send_next_message()
