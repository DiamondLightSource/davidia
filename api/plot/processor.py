from __future__ import annotations

import random
from typing import Union

from plot.custom_types import (
    AxesParameters,
    ImageData,
    ImageDataMessage,
    HeatmapData,
    LineData,
    MsgType,
    MultiLineDataMessage,
    PlotMessage,
)


class Processor:
    """
    A Processor class used to convert new data request messages to data messages

    ...

    Methods
    -------
    process(message: PlotMessage) -> Union(MultiLineDataMessage, ImageDataMessage)
        Converts a PlotMessage to a processed data message
    prepare_new_multiline_data_message(params: list(LineData)
    ) -> MultiLineDataMessage:
        Converts parameters for new lines to a new multiline data messages
    """

    def __init__(self):
        pass

    def process(
        self, message: PlotMessage
    ) -> Union(MultiLineDataMessage, ImageDataMessage):
        """Converts a PlotMessage to processed data

        Parameters
        ----------
        message : PlotMessage
            The message for processing

        Returns
        -------
        Union(MultiLineDataMessage, ImageDataMessage)
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

        if message.type == MsgType.new_multiline_data:
            params = [
                LineData.parse_obj(p) if not isinstance(p, LineData) else p
                for p in message.params
            ]
            return self.prepare_new_multiline_data_message(params, plot_config)
        elif message.type == MsgType.new_image_data:
            params = message.params
            if not isinstance(params, ImageData):
                if "domain" in params:
                    params = HeatmapData.parse_obj(params)
                else:
                    params = ImageData.parse_obj(params)
            return ImageDataMessage(im_data=params, axes_parameters=plot_config)
        else:
            # not covered by tests
            raise ValueError(f"message type not in list: {message.type}")

    def prepare_new_multiline_data_message(
        self, params: list(LineData), axes_parameters: AxesParameters
    ) -> MultiLineDataMessage:
        """Converts parameters for a new line to processed new line data

        Parameters
        ----------
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
        return MultiLineDataMessage(ml_data=params, axes_parameters=axes_parameters)
