from dataclasses import dataclass
from enum import auto as _auto
from typing import Any

from .parameters import AutoNameEnum
from .selections import SelectionBase


class EventType(AutoNameEnum):
    """Event type

    selection - a selection has been created, updated or deleted
    message - a message has been been received
    data - new data is available or data has changed
    """

    selection = _auto()
    message = _auto()
    data = _auto()


@dataclass
class DavidiaEvent:
    pass


@dataclass
class SelectionEvent(DavidiaEvent):
    selection: SelectionBase


@dataclass
class TaskResult:
    plot_id: str
    event: DavidiaEvent
    result: dict[str, Any]
