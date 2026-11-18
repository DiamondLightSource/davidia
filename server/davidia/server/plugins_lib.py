import logging
from collections.abc import Sequence
from typing import Any, Literal

import numpy as np
import numpy.typing as npt

from ..models.events import SelectionEvent
from ..models.messages import (
    EventConfigModel,
    HeatmapData,
    ImageMessage,
    LineData,
    LineParams,
    MultiLineMessage,
    SourceConfigModel,
    TableData,
    TableMessage,
)
from ..models.parameters import PlotConfig
from ..models.selections import (
    AxialSelection,
    RectangularSelection,
    SelectionBase,
)
from .file_load_arrays import read_plot_data
from .plugins import (
    SelectionEventPlugin,
    SourceDataset,
    SourcePlugin,
    TaskResult,
)

NDArrayNumber = npt.NDArray[np.number]

logger = logging.getLogger("main")


def crossings(data: NDArrayNumber, level: float = 0) -> NDArrayNumber:
    """Find indices in data where adjacent values cross given level"""
    above = data > level
    below = ~above
    return ((above[:-1] & below[1:]) | (below[:-1] & above[1:])).nonzero()[0]


def lower(axis: NDArrayNumber, x: float) -> int:  # depends on increasing axis values!!!
    return 0 if x < axis[0] else axis.size


def upper(axis: NDArrayNumber, x: float) -> int:
    return axis.size if x > axis[-1] else 0


def find_data_posns(start: float, stop: float, axis: NDArrayNumber) -> tuple[int, int]:
    """Find indices where axis values are below start and above stop"""
    if start > stop:
        start, stop = stop, start
    flip = axis[0] > axis[-1]
    if flip:
        axis = axis[::-1]

    b, e = crossings(axis, start), crossings(axis, stop) + 1
    indices = (
        int(b[0]) if b.size else lower(axis, start),
        int(e[0]) if e.size else upper(axis, stop),
    )
    if flip:
        l = axis.size
        return l - indices[1], l - indices[0]
    return indices


class DavidiaProfilePlugin(SelectionEventPlugin):
    """Profile plugin specification for Davidia events"""

    def process(self, event: SelectionEvent) -> TaskResult:
        """Process event as create data for a profile"""
        if not isinstance(event, SelectionEvent):
            raise TypeError(f"Event type must be a selection: {type(event)}")

        if isinstance(self.state.current_data, ImageMessage):
            current_data = self.state.current_data
            image = current_data.im_data.values
            axes = [
                current_data.plot_config.y_values,
                current_data.plot_config.x_values,
            ]

            return TaskResult(
                self.plot_id,
                event,
                self.profile(
                    event.selection,
                    image,
                    axes,
                    current_data.plot_config,
                ),
            )

        raise TypeError(
            f"Current plot data must be an ImageMessage for {type(self).__name__}"
        )

    def profile(
        self,
        selection: SelectionBase,
        data: np.ndarray,
        axes: Sequence[np.ndarray | None] | None = None,
        plot_config: PlotConfig | None = None,
    ) -> dict[str, Any]:
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
            elif (delta := a.size - s) < 0 or delta > 1:
                raise ValueError(f"axis size must match data shape: {a.size} cf {s}")
            else:
                a = a.ravel()
                if midsample:
                    da = np.diff(a) * 0.5
                    da = np.resize(da, a.size)
                    da[-1] = np.mean(da)
                    a = a + da
            new_axes.append(a)

        return data, new_axes


class BoxProfileConfig(EventConfigModel):
    """Model for box profile parameters"""

    primary: bool
    """if True, return profile along primary axis (i.e. sum over secondary axis)"""
    secondary: bool
    """if True, return profile along secondary axis (i.e. sum over primary axis)"""
    primary_width: float = 2
    """width of line for primary profile"""
    secondary_width: float = 1
    """width of line for secondary profile"""


class AABoxProfilePlugin(DavidiaProfilePlugin):
    name = "axis-aligned box profile"
    selection_type = RectangularSelection

    def __init__(
        self, primary=True, secondary=True, primary_width=2, secondary_width=1
    ):
        """Axis-aligned box profile

        Parameters
        ----------
        See attributes of `BoxProfileConfig`
        """
        self.plot_1 = primary
        self.plot_2 = secondary
        self.width_1 = primary_width
        self.width_2 = secondary_width

    def description(self):
        return "take a box profile of a 2D array"

    def profile(
        self,
        selection: SelectionBase,
        data: np.ndarray,
        axes: Sequence[np.ndarray | None] | None = None,
        plot_config: PlotConfig | None = None,
    ) -> dict[str, Any]:
        if not isinstance(selection, RectangularSelection):
            raise TypeError("Selection must be a rectangular selection")

        degs = selection.degrees
        if degs / 90 != 0.0:
            raise ValueError("Only axis-aligned rectangles are supported")

        data, axes = self._check_data_axes(data, axes, False)
        # NB flip coordinates so x is along row (or 2nd dimension)
        start = np.array(selection.start[::-1])
        end = np.array(selection.end[::-1])
        box_slice = tuple(
            slice(*find_data_posns(s, e, a)) for s, e, a in zip(start, end, axes)
        )
        box_data = data[box_slice]

        lines = []
        if self.plot_1:
            lines.append(
                LineData(
                    x=axes[1][box_slice[1]],
                    y=box_data.sum(axis=0),
                    line_params=LineParams(
                        name=f"{selection.name}: X profile",
                        colour=selection.colour,
                        width=self.width_1,
                    ),
                )
            )
        if self.plot_2:
            lines.append(
                LineData(
                    x=axes[0][box_slice[0]],
                    y=box_data.sum(axis=1),
                    line_params=LineParams(
                        name=f"{selection.name}: Y profile",
                        colour=selection.colour,
                        width=self.width_2,
                    ),
                )
            )
        return {
            "plot_msg": MultiLineMessage(plot_id=self.plot_id, ml_data=lines, keep=True)
        }


class AxisProfileConfig(EventConfigModel):
    """Model for axis profile parameters"""

    vertical_plot_id: str
    horizontal_plot_id: str
    width: float = 2


class AxisProfilePlugin(DavidiaProfilePlugin):
    name = "axis profile"
    selection_type = AxialSelection
    rerun_on_data_change = True

    def __init__(self, vertical_plot_id: str, horizontal_plot_id: str, width=2):
        """Axis profile from a horizontal or vertical selection.

        Parameters
        ----------
        width : float, optional
            width of line for profile
        """
        self.width = width
        self.vertical_plot_id = vertical_plot_id
        self.horizontal_plot_id = horizontal_plot_id

    def description(self):
        return "take an axis profile from a horizontal or vertical selection"

    def profile(
        self,
        selection: SelectionBase,
        data: np.ndarray,
        axes: Sequence[np.ndarray | None] | None = None,
        plot_config: PlotConfig | None = None,
    ) -> dict[str, Any]:
        if not isinstance(selection, AxialSelection):
            raise TypeError("Selection must be an axis selection")

        if plot_config is None:
            raise ValueError("Plot configuration is required for axis profiles")

        data, axes = self._check_data_axes(data, axes, False)

        # Data storage order is [y, x].
        y_axis = axes[0]
        x_axis = axes[1]

        selection_dimension = selection.dimension
        start = selection.start[selection_dimension]
        end = selection.end[selection_dimension]

        range_start = min(start, end)
        range_end = max(start, end)

        if selection_dimension == 0:
            return self._x_range_profile(
                selection=selection,
                data=data,
                x_axis=x_axis,
                y_axis=y_axis,
                start=range_start,
                end=range_end,
                plot_config=plot_config,
            )

        if selection_dimension == 1:
            return self._y_range_profile(
                selection=selection,
                data=data,
                x_axis=x_axis,
                y_axis=y_axis,
                start=range_start,
                end=range_end,
                plot_config=plot_config,
            )

        raise ValueError(
            f"Axis selection dimension should be 0 or 1: {selection_dimension}"
        )

    def _x_range_profile(
        self,
        selection: AxialSelection,
        data: np.ndarray,
        x_axis: np.ndarray,
        y_axis: np.ndarray,
        start: float,
        end: float,
        plot_config: PlotConfig,
    ) -> dict[str, Any]:
        """Select a range in X and return the profile along Y."""
        start_index, end_index = find_data_posns(
            start,
            end,
            x_axis,
        )

        x_slice = slice(start_index, end_index)
        selected_data = data[:, x_slice]

        line = LineData(
            x=y_axis,
            y=selected_data.sum(axis=1),
            line_params=LineParams(
                name="EDC",
                colour=selection.colour,
                width=self.width,
            ),
        )

        edc_plot_config = plot_config.model_copy(
            update={
                "x_values": y_axis,
                "y_values": None,
                "x_label": plot_config.y_label,
                "y_label": "Intensity",
                "title": "EDC",
            }
        )

        return {
            "target_plot_id": self.horizontal_plot_id,
            "plot_msg": MultiLineMessage(
                plot_id=self.plot_id,
                ml_data=[line],
                plot_config=edc_plot_config,
                keep=True,
            ),
        }

    def _y_range_profile(
        self,
        selection: AxialSelection,
        data: np.ndarray,
        x_axis: np.ndarray,
        y_axis: np.ndarray,
        start: float,
        end: float,
        plot_config: PlotConfig,
    ) -> dict[str, Any]:
        """Select a range in Y and return the profile along X."""
        start_index, end_index = find_data_posns(
            start,
            end,
            y_axis,
        )

        y_slice = slice(start_index, end_index)
        selected_data = data[y_slice, :]

        line = LineData(
            x=x_axis,
            y=selected_data.sum(axis=0),
            line_params=LineParams(
                name="MDC",
                colour=selection.colour,
                width=self.width,
            ),
        )

        mdc_plot_config = plot_config.model_copy(
            update={
                "x_values": x_axis,
                "y_values": None,
                "x_label": plot_config.x_label,
                "y_label": "Intensity",
                "title": "MDC",
            }
        )

        return {
            "target_plot_id": self.vertical_plot_id,
            "plot_msg": MultiLineMessage(
                plot_id=self.plot_id,
                ml_data=[line],
                plot_config=mdc_plot_config,
                keep=True,
            ),
        }


class AxisIntegrationConfig(EventConfigModel):
    source_plot_id: str
    output_plot_id: str
    integration_axis: int
    selection_dimension: int = 0
    reduction: Literal["sum", "mean"] = "sum"
    transpose: bool = False
    reverse_output_axis: int | None = None
    title: str | None = None


class AxisIntegrationPlugin(SelectionEventPlugin):
    """Integrate a selected range along one axis of source data."""

    name = "axis integration"
    selection_type = AxialSelection

    def __init__(
        self,
        source_plot_id: str,
        output_plot_id: str,
        integration_axis: int,
        selection_dimension: int = 0,
        reduction: Literal["sum", "mean"] = "sum",
        transpose: bool = False,
        reverse_output_axis: int | None = None,
        title: str | None = None,
    ):
        self.source_plot_id = source_plot_id
        self.output_plot_id = output_plot_id
        self.integration_axis = integration_axis
        self.selection_dimension = selection_dimension
        self.reduction = reduction
        self.transpose = transpose
        self.reverse_output_axis = reverse_output_axis
        self.title = title

    def description(self):
        return "integrate a selected range along one axis of a multidimensional source array"

    def accepts_selection(
        self,
        selection: SelectionBase,
    ) -> bool:
        return (
            isinstance(selection, AxialSelection)
            and selection.dimension == self.selection_dimension
        )

    def process(
        self,
        event: SelectionEvent,
    ) -> TaskResult:
        if not isinstance(event, SelectionEvent):
            raise TypeError(f"Event type must be a selection: {type(event)}")

        selection = event.selection

        if not isinstance(selection, AxialSelection):
            raise TypeError("Selection must be an axis selection")

        if selection.dimension != self.selection_dimension:
            raise ValueError(
                f"Unexpected selection dimension: expected {self.selection_dimension}, received {selection.dimension}"
            )

        source = self.source

        if source is None:
            raise ValueError("Axis integration requires a source plugin")

        dataset = source.get_dataset()

        if dataset is None:
            raise ValueError(
                f"Source plugin {type(source).__name__} does not expose a multidimensional dataset"
            )

        result, output_axes, output_labels = self.integrate(
            selection=selection,
            dataset=dataset,
        )

        integrated_label = dataset.axis_labels[self.integration_axis]
        plot_message = self._make_plot_message(
            result=result,
            output_axes=output_axes,
            output_labels=output_labels,
            integrated_label=integrated_label,
        )

        return TaskResult(
            self.plot_id,
            event,
            {
                "target_plot_id": self.output_plot_id,
                "plot_msg": plot_message,
            },
        )

    def integrate(
        self,
        selection: AxialSelection,
        dataset: SourceDataset,
    ) -> tuple[
        np.ndarray,
        list[np.ndarray | None],
        list[str],
    ]:
        data = dataset.values

        if data.ndim < 2:
            raise ValueError(
                f"Axis integration requires at least 2D data, but received shape {data.shape}"
            )

        if len(dataset.axes) != data.ndim:
            raise ValueError(
                f"Number of source axes must match data dimensions: {len(dataset.axes)} compared with {data.ndim}"
            )

        if len(dataset.axis_labels) != data.ndim:
            raise ValueError(
                f"Number of axis labels must match data dimensions: {len(dataset.axis_labels)} compared with {data.ndim}"
            )

        integration_axis = self.integration_axis

        if integration_axis < 0:
            integration_axis += data.ndim

        if integration_axis < 0 or integration_axis >= data.ndim:
            raise ValueError(
                f"Integration axis {self.integration_axis} is invalid for data shape {data.shape}"
            )

        coordinate_axis = dataset.axes[integration_axis]

        if coordinate_axis is None:
            coordinate_axis = np.arange(data.shape[integration_axis])
        else:
            coordinate_axis = np.asarray(coordinate_axis).ravel()

        if coordinate_axis.size != data.shape[integration_axis]:
            raise ValueError(
                "Coordinate axis size does not match the "
                "integration dimension: "
                f"{coordinate_axis.size} compared with "
                f"{data.shape[integration_axis]}"
            )

        start = selection.start[selection.dimension]
        end = selection.end[selection.dimension]

        range_start = min(start, end)
        range_end = max(start, end)

        logger.debug(
            "Axis integration selection: "
            "source_plot=%s output_plot=%s "
            "integration_axis=%s transpose=%s "
            "selection=%s:%s "
            "coordinate_range=%s:%s coordinate_size=%s",
            self.source_plot_id,
            self.output_plot_id,
            integration_axis,
            self.transpose,
            range_start,
            range_end,
            coordinate_axis[0],
            coordinate_axis[-1],
            coordinate_axis.size,
        )

        start_index, end_index = find_data_posns(
            range_start,
            range_end,
            coordinate_axis,
        )

        logger.debug(
            "Axis integration indices: start=%s end=%s",
            start_index,
            end_index,
        )

        start_index = max(
            0,
            min(start_index, coordinate_axis.size),
        )

        end_index = max(
            0,
            min(end_index, coordinate_axis.size),
        )

        if start_index > end_index:
            start_index, end_index = (
                end_index,
                start_index,
            )

        if start_index == end_index:
            end_index = min(
                start_index + 1,
                coordinate_axis.size,
            )

        slices = [slice(None)] * data.ndim
        slices[integration_axis] = slice(
            start_index,
            end_index,
        )

        selected_data = data[tuple(slices)]

        if selected_data.shape[integration_axis] == 0:
            raise ValueError("Selected range contains no data points")

        if self.reduction == "sum":
            result = selected_data.sum(axis=integration_axis)
        elif self.reduction == "mean":
            result = selected_data.mean(axis=integration_axis)
        else:
            raise ValueError(f"Unsupported reduction: {self.reduction}")

        output_axes = [
            axis for index, axis in enumerate(dataset.axes) if index != integration_axis
        ]

        output_labels = [
            label
            for index, label in enumerate(dataset.axis_labels)
            if index != integration_axis
        ]

        if result.ndim != 2:
            raise ValueError(
                f"Integration must produce a 2D result, but produced shape {result.shape}"
            )

        if len(output_axes) != 2:
            raise ValueError("Integration output must have exactly two axes")

        if self.transpose:
            result = result.T
            output_axes = output_axes[::-1]
            output_labels = output_labels[::-1]

        if self.reverse_output_axis is not None:
            axis_index = self.reverse_output_axis

            if axis_index < 0:
                axis_index += len(output_axes)

            if axis_index < 0 or axis_index >= len(output_axes):
                raise ValueError(
                    f"Output axis {self.reverse_output_axis} is invalid for {len(output_axes)} output axes"
                )

            axis = output_axes[axis_index]

            if axis is None:
                raise ValueError(
                    f"Cannot reverse output axis {axis_index}: coordinate axis is missing"
                )

            output_axes[axis_index] = axis[::-1]
            result = np.flip(result, axis=axis_index)

        logger.debug(
            "Axis integration result: shape=%s output_axes=%s output_labels=%s",
            result.shape,
            [None if axis is None else axis.size for axis in output_axes],
            output_labels,
        )

        return result, output_axes, output_labels

    def _make_plot_message(
        self,
        result: np.ndarray,
        output_axes: list[np.ndarray | None],
        output_labels: list[str],
        integrated_label: str,
    ) -> ImageMessage:
        if not isinstance(
            self.state.current_data,
            ImageMessage,
        ):
            raise TypeError("Current plot data must be an ImageMessage")

        current_message = self.state.current_data

        y_axis = output_axes[0]
        x_axis = output_axes[1]

        y_label = output_labels[0]
        x_label = output_labels[1]

        output_plot_config = current_message.plot_config.model_copy(
            update={
                "x_values": x_axis,
                "y_values": y_axis,
                "x_label": x_label,
                "y_label": y_label,
                "title": self.title
                or (f"{self.reduction.capitalize()} over {integrated_label}"),
            }
        )

        output_heatmap_data = current_message.im_data.model_copy(
            update={
                "values": result,
                "domain": (
                    float(np.nanmin(result)),
                    float(np.nanmax(result)),
                ),
            }
        )

        return current_message.model_copy(
            update={
                "plot_id": self.output_plot_id,
                "im_data": output_heatmap_data,
                "plot_config": output_plot_config,
            }
        )


class IntersectionSumConfig(EventConfigModel):
    output_plot_id: str


class IntersectionSumPlugin(SelectionEventPlugin):
    name = "intersection sum"
    selection_type = AxialSelection
    rerun_on_data_change = True

    def __init__(self, output_plot_id: str):
        self.output_plot_id = output_plot_id
        self.selections: dict[int, AxialSelection] = {}

    def description(self):
        return "sum intersection of horizontal and vertical axis selections"

    def process(self, event: SelectionEvent) -> TaskResult:
        if not isinstance(event, SelectionEvent):
            raise TypeError(f"Event type must be a selection: {type(event)}")

        selection = event.selection

        if not isinstance(selection, AxialSelection):
            raise TypeError("Selection must be an axis selection")

        if selection.dimension not in (0, 1):
            raise ValueError("Axis selection dimension must be 0 or 1")

        if not isinstance(self.state.current_data, ImageMessage):
            raise TypeError("Current plot data must be an ImageMessage")

        self.selections[selection.dimension] = selection

        x_selection = self.selections.get(0)
        y_selection = self.selections.get(1)

        if x_selection is None or y_selection is None:
            return TaskResult(self.plot_id, event, {})

        current_data = self.state.current_data

        data = current_data.im_data.values
        x_axis = current_data.plot_config.x_values
        y_axis = current_data.plot_config.y_values

        if x_axis is None or y_axis is None:
            raise ValueError("Intersection sum requires X and Y coordinate axes")

        x_start, x_end = find_data_posns(
            x_selection.start[0], x_selection.end[0], x_axis
        )
        y_start, y_end = find_data_posns(
            y_selection.start[1], y_selection.end[1], y_axis
        )

        if x_start == x_end or y_start == y_end:
            intersection_sum = 0.0

        else:
            intersection_sum = float(data[y_start:y_end, x_start:x_end].sum())

        message = TableMessage(
            plot_id=self.output_plot_id,
            ta_data=TableData(
                cell_values=np.asarray([[intersection_sum]], dtype=np.float64),
                cell_width=160,
            ),
        )

        return TaskResult(
            self.plot_id,
            event,
            {"target_plot_id": self.output_plot_id, "plot_msg": message},
        )


class NXSImageSourceConfig(SourceConfigModel):
    path: str
    dataset: str


class NXSImageSourcePlugin(SourcePlugin):
    name = "NXS image source"

    def __init__(
        self,
        path: str,
        dataset: str,
    ):
        self.data, raw_labels, indices, raw_axes = read_plot_data(path)

        if self.data.ndim != 3:
            raise ValueError(
                f"NXSImageSourcePlugin requires a 3D dataset, received {self.data.shape}"
            )

        ordered_axes: list[np.ndarray | None] = [None] * self.data.ndim
        ordered_labels: list[str] = [""] * self.data.ndim

        for axis, label, dim_list in zip(raw_axes, raw_labels, indices):
            # Only map 1D axes that correspond to a single signal dimension
            if len(dim_list) == 1:
                dim = dim_list[0]
                if 0 <= dim < self.data.ndim and ordered_axes[dim] is None:
                    ordered_axes[dim] = axis
                    ordered_labels[dim] = label

        # Fill any unmapped dimension with integer indices (0..N-1)
        for dim, size in enumerate(self.data.shape):
            if ordered_axes[dim] is None:
                ordered_axes[dim] = np.arange(size)

        self.axes = ordered_axes
        self.axes_labels = ordered_labels

        for dim, (axis, size) in enumerate(zip(self.axes, self.data.shape)):
            if axis.ndim != 1 or axis.size != size:
                raise ValueError(
                    f"Axis {dim} shape {axis.shape} does not match data dimension {size}"
                )

        self.finished = False

    def description(self) -> str:
        return "load a 3D dataset from a NeXus file"

    def get_dataset(self) -> SourceDataset:
        return SourceDataset(
            values=self.data, axes=self.axes, axis_labels=self.axes_labels
        )

    async def has_next(self) -> bool:
        return not self.finished

    def next_data(self) -> ImageMessage | None:
        if self.finished:
            return None

        self.finished = True

        # Original shape:
        # [polar angle, angle, energy]
        #
        # Mean over energy:
        # [polar angle, angle]
        overview = self.data.mean(axis=2)

        # Heatmap values use [y, x]:
        # y = angle
        # x = polar angle
        overview = overview.T

        logger.debug(
            "NXS overview shape: %s",
            overview.shape,
        )

        return ImageMessage(
            plot_id=self.plot_id,
            im_data=HeatmapData(
                values=overview,
                domain=(
                    float(np.nanmin(overview)),
                    float(np.nanmax(overview)),
                ),
                colour_map="Inferno",
                aspect="auto",
            ),
            plot_config={
                "x_values": self.axes[0],
                "y_values": self.axes[1],
                "x_label": self.axes_labels[0],
                "y_label": self.axes_labels[1],
                "title": "ARPES overview",
            },
        )
