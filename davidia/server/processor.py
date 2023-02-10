from __future__ import annotations

import random

from ..models.messages import (
    AppendLineDataMessage,
    AppendSelectionsMessage,
    AxesParameters,
    ClientSelectionMessage,
    HeatmapData,
    ImageData,
    ImageDataMessage,
    LineData,
    MsgType,
    MultiLineDataMessage,
    PlotMessage,
    ScatterData,
    ScatterDataMessage,
    TableData,
    TableDataMessage,
)

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
    ) -> MultiLineDataMessage | ImageDataMessage:
        """Converts a PlotMessage to processed data

        Parameters
        ----------
        message : PlotMessage
            The message for processing

        Returns
        -------
        MultiLineDataMessage | ImageDataMessage
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
            plot_config = AxesParameters.parse_obj(plot_config)
        if (
            message.type == MsgType.new_multiline_data
            or message.type == MsgType.append_line_data
        ):
            params = [
                LineData.parse_obj(p) if not isinstance(p, LineData) else p
                for p in message.params
            ]
            append = message.type == MsgType.append_line_data
            return self.prepare_new_multiline_data_message(
                params, plot_config, append=append
            )
        elif message.type == MsgType.new_image_data:
            params = message.params
            if not isinstance(params, ImageData):
                if "domain" in params:
                    params = HeatmapData.parse_obj(params)
                else:
                    params = ImageData.parse_obj(params)
            return ImageDataMessage(im_data=params, axes_parameters=plot_config)
        elif message.type == MsgType.new_scatter_data:
            params = message.params
            if not isinstance(params, ScatterData):
                params = ScatterData.parse_obj(params)
            return ScatterDataMessage(sc_data=params, axes_parameters=plot_config)
        elif message.type == MsgType.new_table_data:
            params = message.params
            if not isinstance(params, TableData):
                params = TableData.parse_obj(params)
            return TableDataMessage(ta_data=params, axes_parameters=plot_config)
        elif message.type == MsgType.client_new_selection:
            params = message.params
            if not isinstance(params, ClientSelectionMessage):
                params = ClientSelectionMessage.parse_obj(params)
            return AppendSelectionsMessage(append_selections=[params.selection])
        else:
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
                color=p.color,
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
