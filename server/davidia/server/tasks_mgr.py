from abc import ABC, abstractmethod
from collections.abc import Callable
from concurrent.futures import Future, ThreadPoolExecutor
from typing import Generic, TypeVar

H = TypeVar("H")  # task hook
P = TypeVar("P")  # task params
R = TypeVar("R")  # task result


class SimpleTaskManager(ABC, Generic[H, P, R]):
    """
    Manages tasks
    """

    def __init__(self, result_cb: Callable[[Future[R]], None], max_workers=None):
        self.callback = result_cb
        self.pool = ThreadPoolExecutor(max_workers=max_workers)

    @abstractmethod
    def add_task(self, hook: H, params: P) -> None:
        """
        Add task
        """
