from dataclasses import dataclass
from typing import Any

from .selections import SelectionBase


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
