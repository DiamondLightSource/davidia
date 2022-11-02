from __future__ import annotations

import random

from typing import Union

from plot.custom_types import (
    AxesParameters,
    LineData,
    LineDataMessage,
    MsgType,
    MultiLineDataMessage,
    ImageData,
    ImageDataMessage,
    PlotMessage,
)


class Processor:
    """
    A Processor class used to convert new data request messages to data messages

    ...

    Methods
    -------
    process(message: PlotMessage) -> Union(LineDataMessage, MultiLineDataMessage)
        Converts a PlotMessage to a processed data message
    prepare_new_line_data_message(plot_id: str, params: LineData) -> LineDataMessage:
        Converts parameters for a new line to a new line data message
    prepare_new_multiline_data_message(plot_id: str, params: list(LineData)
    ) -> MultiLineDataMessage:
        Converts parameters for new lines to a new multiline data messages
    """

    def __init__(self):
        pass

    def process(
        self, message: PlotMessage
    ) -> Union(LineDataMessage, MultiLineDataMessage, ImageDataMessage):
        """Converts a PlotMessage to processed data

        Parameters
        ----------
        message : PlotMessage
            The message for processing

        Returns
        -------
        Union(LineDataMessage, MultiLineDataMessage)
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
        if not isinstance(plot_config, AxesParameters):
            plot_config = AxesParameters(**plot_config)
        if message.type == MsgType.new_line_data:
            params = message.params
            if not isinstance(params, LineData):
                params = LineData(**params)
            return self.prepare_new_line_data_message(message.plot_id, params, plot_config)
        elif message.type == MsgType.new_multiline_data:
            params = [
                LineData(**p) if not isinstance(p, LineData) else p
                for p in message.params
            ]
            return self.prepare_new_multiline_data_message(message.plot_id, params, plot_config)
        elif message.type == MsgType.new_image_data:
            params = message.params
            if not isinstance(params, ImageData):
                params = ImageData(**params)
            return ImageDataMessage(plot_id=message.plot_id, data=params, axes_parameters=plot_config)
        else:
            # not covered by tests
            raise ValueError(f"message type not in list: {message.type}")

    def prepare_new_line_data_message(
        self, plot_id: str, params: LineData, axes_parameters: AxesParameters
    ) -> LineDataMessage:
        """Converts parameters for a new line to processed new line data message

        Parameters
        ----------
        plot_id : str
            ID of plot to which to send data message
        params : LineData
            Line data parameters to be processed to new line data
        axes_parameters : AxesParameters
            Axes configuration parameters

        Returns
        -------
        LineDataMessage
            New line data message.
        """
        """
        line_data = LineData(
            key=f"{params.key}_{random.randrange(1000)}",
            color=params.color,
            x=params.x,
            y=params.y
            )
        """
        params.key = f"{params.key}_{random.randrange(1000)}"
        return LineDataMessage(plot_id=plot_id, data=params, axes_parameters=axes_parameters)

    def prepare_new_multiline_data_message(
        self, plot_id: str, params: list(LineData), axes_parameters: AxesParameters
    ) -> MultiLineDataMessage:
        """Converts parameters for a new line to processed new line data

        Parameters
        ----------
        plot_id : str
            ID of plot to which to send data message
        params : list(LineData)
            List of line data parameters to be processed to new multiline data
        axes_parameters : AxesParameters
            Axes configuration parameters

        Returns
        -------
        MultiLineDataMessage
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
        return MultiLineDataMessage(plot_id=plot_id, data=params, axes_parameters=axes_parameters)
