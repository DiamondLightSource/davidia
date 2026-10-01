import logging
from collections.abc import Sequence
from typing import Any

import numpy as np

from ..models.events import DavidiaEvent, SelectionEvent
from ..models.messages import (
    EventConfigModel,
    ImageMessage,
    LineData,
    LineParams,
    MultiLineMessage,
)
from ..models.selections import RectangularSelection, SelectionBase
from .plugins import DavidiaPlugin, SelectionEventPlugin, TaskResult

logger = logging.getLogger("main")


def crossings(data, level=0):
    above = data > level
    below = ~above
    return ((above[:-1] & below[1:]) | (below[:-1] & above[1:])).nonzero()[0]


def lower(axis, x):
    return 0 if x < axis[0] else axis.size


def upper(axis, x):
    return axis.size if x > axis[-1] else 0


def find_data_posns(start: float, stop: float, axis: np.ndarray):
    b, e = crossings(axis, start), crossings(axis, stop)
    return int(b[0]) if b.size else lower(axis, start), int(e[0]) if e.size else upper(
        axis, stop
    )


class DavidiaProfilePlugin(SelectionEventPlugin):
    """Profile plugin specification for Davidia events"""

    def process(self, event: DavidiaEvent) -> TaskResult:
        """Process event as create data for a profile"""
        # check if event is a selection, get data and axes
        if not isinstance(event, SelectionEvent):
            raise TypeError(f"Event type must be a selection: {type(event)}")
        if isinstance(self.state.current_data, ImageMessage):
            image = self.state.current_data.im_data.values
            return TaskResult(self.plot_id, event, self.profile(event.selection, image))
        raise TypeError(f"Data does meet requirements for {DavidiaPlugin.name}")

    def profile(
        self,
        selection: SelectionBase,
        data: np.ndarray,
        axes: Sequence[np.ndarray | None] | None = None,
    ) -> dict[str, Any]:
        """Compute profile from parameters

        Parameters
        ----------
        selection : SelectionBase
            region to profile
        data : np.ndarray
            data to profile
        axes : Sequence[np.ndarray | None] | None
            sequence of arrays for each axis in data storage order

        Returns
        -------
        Dictionary of results
        """
        return {}

    @staticmethod
    def _check_data_axes(
        data: np.ndarray,
        axes: Sequence[np.ndarray | None] | None = None,
        midsample: bool = False,
    ) -> tuple[np.ndarray, Sequence[np.ndarray]]:
        if data.ndim != 2:
            raise ValueError("Data must be 2D")

        if axes is None or len(axes) == 0:
            axes = [None, None]
        elif len(axes) == 1:
            axes = [axes[0], None]

        new_axes = []
        for a, s in zip(axes, data.shape):
            if a is None:
                a = np.arange(s)
                if midsample:
                    a += 0.5
            elif a.size != s:
                raise ValueError(f"axis size must match data shape: {a.size} cf {s}")
            else:
                a = a.ravel()
                if midsample:
                    da = np.diff(a) * 0.5
                    da.resize(a.size)
                    da[-1] = np.mean(da)
                    a = a + da
            new_axes.append(a)

        return data, new_axes


class BoxProfileConfig(EventConfigModel):
    x: bool
    y: bool
    x_width: float = 2
    y_width: float = 1


class BoxProfilePlugin(DavidiaProfilePlugin):
    name = "box profile"
    selection_type = RectangularSelection

    def __init__(self, x=True, y=True, x_width=2, y_width=1):
        """Box profile

        Parameters
        ----------
        x : bool, optional
            if True, return profile in x (i.e. sum over y)
        y : bool, optional
            if True, return profile in y (i.e. sum over x)
        x_width : float, optional
            width of line for x profile
        y_width : float, optional
            width of line for y profile
        """
        self.plot_x = x
        self.plot_y = y
        self.x_width = x_width
        self.y_width = y_width

    def description(self):
        return "take a box profile of a 2D array"

    def profile(
        self,
        selection: SelectionBase,
        data: np.ndarray,
        axes: Sequence[np.ndarray | None] | None = None,
    ) -> dict[str, Any]:
        if not isinstance(selection, RectangularSelection):
            raise TypeError("Selection must be a rectangular selection")

        degs = selection.degrees
        if degs / 90 != 0.0:
            raise ValueError("Tilted rectangle not yet supported")

        data, axes = self._check_data_axes(data, axes, False)
        # NB flip coordinates so x is along row (or 2nd dimension)
        start = np.array(selection.start[::-1])
        end = np.array(selection.end[::-1])
        box_slice = tuple(
            slice(*find_data_posns(s, e, a)) for s, e, a in zip(start, end, axes)
        )
        box_data = data[box_slice]

        lines = []
        if self.plot_x:
            lines.append(
                LineData(
                    x=axes[1][box_slice[1]],
                    y=box_data.sum(axis=0),
                    line_params=LineParams(
                        name=f"{selection.name}: X profile",
                        colour=selection.colour,
                        width=self.x_width,
                    ),
                )
            )
        if self.plot_y:
            lines.append(
                LineData(
                    x=axes[0][box_slice[0]],
                    y=box_data.sum(axis=1),
                    line_params=LineParams(
                        name=f"{selection.name}: Y profile",
                        colour=selection.colour,
                        width=self.y_width,
                    ),
                )
            )
        return {
            "plot_msg": MultiLineMessage(
                plot_id=self.plot_id, ml_data=lines, keep=True
            )
        }
