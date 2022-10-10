from __future__ import annotations

import random

from typing import Union

from plot.custom_types import LineData, LineDataMessage, MsgType, MultiLineDataMessage, PlotMessage


class Processor():
    """
    A Processor class used to convert new data request messages to data

    ...

    Methods
    -------
    process(message: PlotMessage) -> Dict
        Converts a PlotMessage to processed data
    prepare_aux_line_request(params: LineData) -> Dict:
        Converts parameters for a new line to processed new line data
    """

    def __init__(self):
        pass

    def process(self, message: PlotMessage) -> Union(LineDataMessage, MultiLineDataMessage):
        """Converts a PlotMessage to processed data

        Parameters
        ----------
        message : PlotMessage
            The message for processing

        Returns
        -------
        data_message: Union(LineDataMessage, MultiLineDataMessage)
            The processed data as a message

        Raises
        ------
        ValueError
            If message type is unexpected.
        """
        if message.type == MsgType.new_line_data:
            params = LineData(**message.params)
            return self.prepare_new_line_data_message(message.plot_id, params)
        elif message.type == MsgType.new_multiline_data:
            params = [LineData(**d) for d in message.params]
            return self.prepare_new_multiline_data_message(message.plot_id, params)
        else:
            # not covered by tests
            raise ValueError(f"message type not in list: {message['type']}")

    def prepare_new_line_data_message(self, plot_id: str, params: LineData) -> LineDataMessage:
        """Converts parameters for a new line to processed new line data

        Parameters
        ----------
        params : LineData
            Line data parameters to be processed to new line data

        Returns
        -------
        new_line_data: Dict
            New line data.
        """

        line_data = LineData(id=f"{params.id}_{random.randrange(1000)}", colour=params.colour, x=params.x, y=params.y)
        line_data_message = LineDataMessage(plot_id=plot_id, type="LineDataMessage", data=line_data)
        return line_data_message

    def prepare_new_multiline_data_message(self, plot_id: str, params: LineData) -> MultiLineDataMessage:
        """Converts parameters for a new line to processed new line data

        Parameters
        ----------
        params : LineData
            Line data parameters to be processed to new line data

        Returns
        -------
        new_line_data: Dict
            New line data.
        """

        multiline_data = [LineData(id=f"{p.id}_{random.randrange(1000)}", colour=p.colour, x=p.x, y=p.y) for p in params]
        multiline_data_message = MultiLineDataMessage(plot_id=plot_id, type="MultiLineDataMessage", data=multiline_data)
        return multiline_data_message
