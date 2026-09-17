from __future__ import annotations

import asyncio
import logging
from abc import ABC, abstractmethod
from asyncio import AbstractEventLoop
from threading import Thread
from typing import TYPE_CHECKING, ClassVar

from ..models.events import DavidiaEvent, EventType, SelectionEvent, TaskResult
from ..models.messages import _BasePlotMessage
from ..models.selections import SelectionBase

if TYPE_CHECKING:
    from .plot_server import PlotServer, PlotState

from .tasks_mgr import SimpleTaskManager

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

    name: ClassVar[str]
    """Name of plugin"""

    @abstractmethod
    def description(self) -> str:
        """Return description of plugin"""


class SourcePlugin(DavidiaPlugin):
    """
    Hooks an external source and pushes data to plot server for a named plot
    """

    server: PlotServer
    plot_id: str

    def _bind(self, server: PlotServer, plot_id: str) -> None:
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

    async def start(self) -> None:
        self.loop = loop = asyncio.new_event_loop()

        def start_loop() -> None:
            asyncio.set_event_loop(loop)
            logger.debug("Looping forever %s", self.name)
            try:
                loop.run_forever()
            finally:
                logger.debug("Closing loop %s", self.name)
                loop.close()

        thd = Thread(target=start_loop, args=())
        thd.start()

        async def loop_task() -> None:
            logger.debug("Starting loop task %s", self.name)
            while True:
                data = self.next_data()
                if data:
                    await self.push_data(data)
                if not await self.has_next():
                    break
            logger.debug("Stopped loop task %s", self.name)

        asyncio.run_coroutine_threadsafe(loop_task(), loop)

    def stop(self) -> None:
        if self.loop is None:
            return
        self.loop.stop()
        self.loop = None

    async def push_data(self, data: _BasePlotMessage) -> None:
        """
        Push data to plot server and send to clients
        """
        await self.server._update_and_add_message(self.plot_id, data, None)
        await self.server.send_next_message()


class EventPlugin(DavidiaPlugin):
    """
    Responds to an event from client
    and can compute data for another plot.
    Should also recompute for new data
    """

    event_type: ClassVar[EventType]
    plot_id: str
    state: PlotState

    def _bind(self, plot_id: str, state: PlotState) -> None:
        """
        Bind plugin
        plot_id: name of plot
        state: plot state
        """
        self.plot_id = plot_id
        self.state = state

    @abstractmethod
    def _process(self, event: DavidiaEvent) -> TaskResult:
        """Process any event"""

    @abstractmethod
    def process(self, event: DavidiaEvent) -> TaskResult:
        """Process event"""


class SelectionEventPlugin(EventPlugin):
    """
    Responds to a selection event from client
    and can compute data for another plot.
    Should also recompute for new data
    """

    selection_type: ClassVar[type[SelectionBase]]

    def _process(self, event: DavidiaEvent) -> TaskResult:
        """Process event as create data for a profile"""
        # check if event is a selection, get data and axes
        if not isinstance(event, SelectionEvent):
            raise TypeError(f"Event type must be a selection: {type(event)}")
        return self.process(event)


class PluginTaskManager(SimpleTaskManager):
    def add_task(self, hook: EventPlugin, event: DavidiaEvent) -> None:
        if isinstance(hook, SelectionEventPlugin):
            assert isinstance(event, SelectionEvent)
            fut = self.pool.submit(hook._process, event)
            fut.add_done_callback(self.callback)
