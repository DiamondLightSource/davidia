from __future__ import annotations

from pydantic.alias_generators import to_camel

from ..models.messages import (
    AppendLineDataMessage,
    PlotConfig,
    ClearSelectionsMessage,
    ClientScatterParametersMessage,
    ClientSelectionMessage,
    ClientLineParametersMessage,
    HeatmapData,
    ImageData,
    ImageDataMessage,
    LineData,
    LineParams,
    MsgType,
    MultiLineDataMessage,
    PlotMessage,
    ScatterData,
    ScatterDataMessage,
    SelectionsMessage,
    SurfaceData,
    SurfaceDataMessage,
    TableData,
    TableDataMessage,
    UpdateSelectionsMessage,
)
from ..models.selections import AnySelection, as_selection


def check_line_names(lines: list[LineData]) -> list[LineData]:
    """Autonames lines that do not have names"""
    used_names = set(line.line_params.name for line in lines if line.line_params.name)
    index = 0
    for line in lines:
        if not line.line_params.name:
            new_name = f"Line {index}"
            index += 1
            while new_name in used_names:
                new_name = f"Line {index}"
                index += 1
            line.line_params.name = new_name
            used_names.add(new_name)
    return lines


def extract_selection(raw: dict, entry: str) -> AnySelection | list[AnySelection]:
    if entry not in raw:
        camel_entry = to_camel(entry)
        if camel_entry == entry or camel_entry not in raw:
            raise ValueError(
                f"{entry} and its camelCase {camel_entry} not found in message"
            )
        entry = camel_entry
    raw_selection = raw[entry]
    if isinstance(raw_selection, list):
        return [as_selection(s) for s in raw_selection]
    return as_selection(raw_selection)


class Processor:
    """
    A Processor class used to convert new data request messages to data messages

    ...

    Methods
    -------
    process(message: PlotMessage) -> MultiLineDataMessage | ImageDataMessage
        Converts a PlotMessage to a processed data message
    prepare_new_multiline_data_message(params: list(LineData)
    ) -> MultiLineDataMessage:
        Converts parameters for new lines to a new multiline data messages
    """

    def __init__(self):
        pass

    def process(
        self, message: PlotMessage
    ) -> (
        ClearSelectionsMessage
        | MultiLineDataMessage
        | AppendLineDataMessage
        | ImageDataMessage
        | ScatterDataMessage
        | SelectionsMessage
        | SurfaceDataMessage
        | TableDataMessage
        | UpdateSelectionsMessage
    ):
        """Converts a PlotMessage to processed data

        Parameters
        ----------
        message : PlotMessage
            The message for processing

        Returns
        -------
        ClearSelectionsMessage | MultiLineDataMessage | AppendLineDataMessage
        | ImageDataMessage | ScatterDataMessage | SurfaceDataMessage | TableDataMessage
        | UpdateSelectionsMessage
            The processed data as a message

        Raises
        ------
        ValueError
            If message type is unexpected.
        """

        plot_config = getattr(message, "plot_config", None)
        if plot_config is None:
            plot_config = PlotConfig()
        elif not isinstance(plot_config, PlotConfig):
            plot_config = PlotConfig.model_validate(plot_config)

        params = message.params
        match message.type:
            case MsgType.new_multiline_data | MsgType.append_line_data:
                params = [
                    LineData.model_validate(p) if not isinstance(p, LineData) else p
                    for p in params
                ]
                append = message.type == MsgType.append_line_data
                return self.prepare_new_multiline_data_message(
                    params, plot_config, append=append
                )
            case MsgType.new_image_data:
                if not isinstance(params, ImageData):
                    if "domain" in params:
                        params = HeatmapData.model_validate(params)
                    else:
                        params = ImageData.model_validate(params)
                return ImageDataMessage(im_data=params, plot_config=plot_config)
            case MsgType.new_scatter_data:
                if not isinstance(params, ScatterData):
                    params = ScatterData.model_validate(params)
                return ScatterDataMessage(sc_data=params, plot_config=plot_config)
            case MsgType.new_surface_data:
                if not isinstance(params, SurfaceData):
                    params = SurfaceData.model_validate(params)
                return SurfaceDataMessage(su_data=params, plot_config=plot_config)
            case MsgType.new_table_data:
                if not isinstance(params, TableData):
                    params = TableData.model_validate(params)
                return TableDataMessage(ta_data=params, plot_config=plot_config)
            case MsgType.client_new_selection | MsgType.client_update_selection:
                if not isinstance(params, ClientSelectionMessage):
                    params = ClientSelectionMessage(
                        selection=extract_selection(params, "selection")
                    )
                return UpdateSelectionsMessage(update_selections=[params.selection])
            case MsgType.client_update_line_parameters:
                if not isinstance(params, ClientLineParametersMessage):
                    key = params["key"]
                    line = params["line_params"]
                    params = (
                        LineParams.model_validate(line)
                        if not isinstance(line, LineParams)
                        else line
                    )
                return ClientLineParametersMessage(key=key, line_params=params)
            case MsgType.client_update_scatter_parameters:
                if not isinstance(params, ClientScatterParametersMessage):
                    point_size = params["point_size"]
                return ClientScatterParametersMessage(point_size=point_size)
            case MsgType.new_selection_data:
                if not isinstance(params, SelectionsMessage):
                    params = SelectionsMessage(
                        set_selections=extract_selection(params, "set_selections")
                    )
                return params
            case MsgType.update_selection_data:
                if not isinstance(params, UpdateSelectionsMessage):
                    params = UpdateSelectionsMessage(
                        update_selections=extract_selection(params, "update_selections")
                    )
                return params
            case MsgType.clear_selection_data:
                if not isinstance(params, ClearSelectionsMessage):
                    params = ClearSelectionsMessage.model_validate(params)
                return params
            case _:
                # not covered by tests
                raise ValueError(f"message type not in list: {message.type}")

    def prepare_new_multiline_data_message(
        self, params: list[LineData], plot_config: PlotConfig, append=False
    ) -> MultiLineDataMessage | AppendLineDataMessage:
        """Converts parameters for a new line to processed new line data

        Parameters
        ----------
        params : list[LineData]
            List of line data parameters to be processed to new multiline data
        plot_config : PlotConfig
            Axes configuration parameters
        append : returns AppendLineDataMessage

        Returns
        -------
        MultiLineDataMessage | AppendLineDataMessage
            New multiline data message.
        """

        params = check_line_names(params)

        if append:
            return AppendLineDataMessage(al_data=params, plot_config=plot_config)
        return MultiLineDataMessage(ml_data=params, plot_config=plot_config)
