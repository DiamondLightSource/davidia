import logging
from collections.abc import Sequence
from typing import Any, Literal

import numpy as np
import h5py

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
from ..models.selections import RectangularSelection, SelectionBase, AxialSelection
from .plugins import DavidiaPlugin, SelectionEventPlugin, SourceDataset, TaskResult, SourcePlugin


logger = logging.getLogger("main")


def find_data_posns(
    start: float,
    stop: float,
    axis: np.ndarray,
) -> tuple[int, int]:
    # works for ascending and descending axes
    axis = np.asarray(axis).ravel()

    range_start = min(start, stop)
    range_end = max(start, stop)

    matching_indices = np.flatnonzero((axis >= range_start) & (axis <= range_end))

    if matching_indices.size == 0:
        return 0, 0

    return (
        int(matching_indices.min()),
        int(matching_indices.max()) + 1,
    )


class DavidiaProfilePlugin(SelectionEventPlugin):
    """Profile plugin specification for Davidia events"""

    def _make_profile_line(
        self,
        data: np.ndarray,
        axis: np.ndarray,
        sum_axis: int,
        selection: SelectionBase,
        name: str,
        width: float,
    ) -> LineData:
        return LineData(
            x=axis,
            y=data.sum(axis=sum_axis),
            line_params=LineParams(
                name=f"{selection.name}: {name}",
                colour=selection.colour,
                width=width,
            ),
        )

    def process(self, event: SelectionEvent) -> TaskResult:
        """Process event as create data for a profile"""
        # check if event is a selection, get data and axes
        if not isinstance(event, SelectionEvent):
            raise TypeError(f"Event type must be a selection: {type(event)}")
        if isinstance(self.state.current_data, ImageMessage):
            current_data = self.state.current_data
            image = current_data.im_data.values
            axes = [
                current_data.plot_config.y_values,
                current_data.plot_config.x_values,
            ]
            return TaskResult(self.plot_id, event, self.profile(event.selection, image, axes, current_data.plot_config))
        raise TypeError(f"Data does meet requirements for {DavidiaPlugin.name}")

    def profile(
        self,
        selection: SelectionBase,
        data: np.ndarray,
        axes: Sequence[np.ndarray | None] | None = None,
        plot_config: PlotConfig | None = None,
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
        plot_config : PlotConfig | None
            plot config for profile plot

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
                    da = np.resize(da, a.size)
                    da[-1] = np.mean(da)
                    a = a + da
            new_axes.append(a)

        return data, new_axes


class BoxProfileConfig(EventConfigModel):
    """Model for box profile parameters"""

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
        plot_config: PlotConfig | None = None,
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
        box_slice = tuple(slice(*find_data_posns(s, e, a)) for s, e, a in zip(start, end, axes))
        box_data = data[box_slice]

        lines = []
        if self.plot_x:
            lines.append(
                self._make_profile_line(
                    data=box_data,
                    axis=axes[1][box_slice[1]],
                    sum_axis=0,
                    selection=selection,
                    name="X profile",
                    width=self.x_width,
                )
            )

        if self.plot_y:
            lines.append(
                self._make_profile_line(
                    data=box_data,
                    axis=axes[0][box_slice[0]],
                    sum_axis=1,
                    selection=selection,
                    name="Y profile",
                    width=self.y_width,
                )
            )
        return {"plot_msg": MultiLineMessage(plot_id=self.plot_id, ml_data=lines, keep=True)}


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

        raise ValueError(f"Axis selection dimension should be 0 or 1: {selection_dimension}")

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
        return isinstance(selection, AxialSelection) and selection.dimension == self.selection_dimension

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
            raise ValueError(f"Source plugin {type(source).__name__} does not expose a multidimensional dataset")

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
            raise ValueError(f"Axis integration requires at least 2D data, but received shape {data.shape}")

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
            raise ValueError(f"Integration axis {self.integration_axis} is invalid for data shape {data.shape}")

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

        output_axes = [axis for index, axis in enumerate(dataset.axes) if index != integration_axis]

        output_labels = [label for index, label in enumerate(dataset.axis_labels) if index != integration_axis]

        if result.ndim != 2:
            raise ValueError(f"Integration must produce a 2D result, but produced shape {result.shape}")

        if len(output_axes) != 2:
            raise ValueError("Integration output must have exactly two axes")

        if self.transpose:
            result = result.T
            output_axes = output_axes[::-1]
            output_labels = output_labels[::-1]

        if self.reverse_output_axis is not None:
            axis_index = self.reverse_output_axis
            axis = output_axes[axis_index]

            if axis is None:
                raise ValueError(f"Cannot reverse output axis {axis_index}: coordinate axis is missing")

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
                "title": self.title or (f"{self.reduction.capitalize()} over {integrated_label}"),
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
                "plot_id": self.plot_id,
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

        x_start, x_end = find_data_posns(x_selection.start[0], x_selection.end[0], x_axis)
        y_start, y_end = find_data_posns(y_selection.start[1], y_selection.end[1], y_axis)

        if x_start == x_end or y_start == y_end:
            intersection_sum = 0.0

        else:
            intersection_sum = float(data[y_start:y_end, x_start:x_end].sum())

        message = TableMessage(
            plot_id=self.output_plot_id,
            ta_data=TableData(cell_values=np.asarray([[intersection_sum]], dtype=np.float64), cell_width=160),
        )

        return TaskResult(self.plot_id, event, {"target_plot_id": self.output_plot_id, "plot_msg": message})


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
        with h5py.File(path, "r") as nexus_file:
            self.data = np.asarray(nexus_file[dataset])
            datasets=[]

            def inspect(name, obj):
                if isinstance(obj, h5py.Dataset) and obj.shape:
                    datasets.append({"dataset": name, "shape":obj.shape})

            nexus_file.visititems(inspect)
            print(self.data.shape)
            for entry in datasets:
                if entry["shape"][0]==self.data.shape[0]:
                    axiszero=entry["dataset"]
                elif entry["shape"][0]==self.data.shape[1]:
                    axisone=entry["dataset"]
                elif entry["shape"][0]==self.data.shape[2]:
                    axistwo=entry["dataset"]
            
            self.axes = [
                        np.asarray(nexus_file[axiszero]),
                        np.asarray(nexus_file[axisone]),
                        np.asarray(nexus_file[axistwo]),
                    ]

        if self.data.ndim != 3:
            raise ValueError(f"NXSImageSourcePlugin requires a 3D dataset, received {self.data.shape}")

        # Storage-order coordinate axes:
        #
        # axis 0: polar angle
        # axis 1: angle
        # axis 2: energy

        for axis, size in zip(self.axes, self.data.shape):
            if axis.size != size:
                raise ValueError(f"Axis size {axis.size} does not match data dimension {size}")

        self.finished = False

    def description(self) -> str:
        return "load a 3D dataset from a NeXus file"

    def get_dataset(self) -> SourceDataset:
        return SourceDataset(
            values=self.data,
            axes=self.axes,
            axis_labels=[
                "analyser_polar_angle",
                "angles",
                "energies",
            ],
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
        # Sum over energy:
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
                "x_label": "Polar angle",
                "y_label": "Angle",
                "title": "ARPES overview",
            },
        )
