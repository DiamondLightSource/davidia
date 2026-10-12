from abc import ABC, abstractmethod
from collections.abc import Callable
from concurrent.futures import Future, ThreadPoolExecutor


class SimpleTaskManager[H, P, R](ABC):
    """
    Manages tasks (H - hook, P - params, R - result)
    """

    def __init__(self, result_cb: Callable[[Future[R]], None], max_workers=None):
        self.callback = result_cb
        self.pool = ThreadPoolExecutor(max_workers=max_workers)

    @abstractmethod
    def add_task(self, hook: H, params: P) -> None:
        """
        Add task
        """
