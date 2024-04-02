from __future__ import annotations

import random

from ..models.messages import (AppendLineDataMessage, AxesParameters,
                               ClearSelectionsMessage, ClientSelectionMessage, ClientLineParametersMessage,
                               HeatmapData, ImageData, ImageDataMessage, LineData, LineParams,
                               MsgType, MultiLineDataMessage, PlotMessage, ScatterData,
                               ScatterDataMessage, SelectionsMessage, SurfaceData,
                               SurfaceDataMessage, TableData, TableDataMessage,
                               UpdateSelectionsMessage)
from ..models.selections import as_selection


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

        if hasattr(message, "plot_config"):
            plot_config = message.plot_config
        else:
            raise ValueError(f"PlotMessage is missing plot_config: {message}")
        if plot_config is None:
            plot_config = AxesParameters()
        elif not isinstance(plot_config, AxesParameters):
            plot_config = AxesParameters.model_validate(plot_config)

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
                return ImageDataMessage(im_data=params, axes_parameters=plot_config)
            case MsgType.new_scatter_data:
                if not isinstance(params, ScatterData):
                    params = ScatterData.model_validate(params)
                return ScatterDataMessage(sc_data=params, axes_parameters=plot_config)
            case MsgType.new_surface_data:
                if not isinstance(params, SurfaceData):
                    params = SurfaceData.model_validate(params)
                return SurfaceDataMessage(su_data=params, axes_parameters=plot_config)
            case MsgType.new_table_data:
                if not isinstance(params, TableData):
                    params = TableData.model_validate(params)
                return TableDataMessage(ta_data=params, axes_parameters=plot_config)
            case MsgType.client_new_selection | MsgType.client_update_selection:
                if not isinstance(params, ClientSelectionMessage):
                    params = ClientSelectionMessage(
                        selection=as_selection(params["selection"])
                    )
                return UpdateSelectionsMessage(update_selections=[params.selection])
            case MsgType.client_update_line_parameters:
                if not isinstance(params, ClientLineParametersMessage):
                    line = params["line_params"]
                    params = LineParams.model_validate(line) if not isinstance(line, LineParams) else line
                return ClientLineParametersMessage(line_params=params)
            case MsgType.new_selection_data:
                if not isinstance(params, SelectionsMessage):
                    params = SelectionsMessage(
                        set_selections=[
                            as_selection(p) for p in params["set_selections"]
                        ]
                    )
                return params
            case MsgType.update_selection_data:
                if not isinstance(params, UpdateSelectionsMessage):
                    params = UpdateSelectionsMessage(
                        update_selections=[
                            as_selection(p) for p in params["update_selections"]
                        ]
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
        self, params: list[LineData], axes_parameters: AxesParameters, append=False
    ) -> MultiLineDataMessage | AppendLineDataMessage:
        """Converts parameters for a new line to processed new line data

        Parameters
        ----------
        params : list[LineData]
            List of line data parameters to be processed to new multiline data
        axes_parameters : AxesParameters
            Axes configuration parameters
        append : returns AppendLineDataMessage

        Returns
        -------
        MultiLineDataMessage | AppendLineDataMessage
            New multiline data message.
        """
        """
        multiline_data = [
            LineData(
                key=f"{p.key}_{random.randrange(1000)}",
                colour=p.colour,
                x=p.x,
                y=p.y
                ) for p in params
            ]
        """

        for p in params:
            p.key = f"{p.key}_{random.randrange(1000)}"
        if append:
            return AppendLineDataMessage(
                al_data=params, axes_parameters=axes_parameters
            )
        return MultiLineDataMessage(ml_data=params, axes_parameters=axes_parameters)
