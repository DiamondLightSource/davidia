from __future__ import annotations

import msgpack

from typing import List

from plot.custom_types import PlotMessage, StatusType
from plot.processor import Processor


class PlotServer:
    """
    A class used to create a plot server

    ...

    Attributes
    ----------
    ws_list : List
        A list of websockets in use
    processor : Processor
        The data processor
    client_status : StatusType
        The status of the client
    response_list : List
        A list of responses queued for sending to the client

    Methods
    -------
    initialise_data()
        Prepares initial data into responses and appends to response list
    send_next_message()
        Sends the next response on the response list and updates the client status
    prepare_data(msg: PlotMessage)
        Processes PlotMessage into response and appends to response list.
    """

    def __init__(self, processor: Processor):
        """
        Parameters
        ----------
        processor : Processor
            The data processor.
        """

        self.ws_list: List = []
        self.processor: Processor = processor
        self.client_status: StatusType = StatusType.busy
        self.response_list: List = []
        self.initialise_data()

    def initialise_data(self):
        """Prepares initial data into responses and appends to response list."""
        for data in self.processor.initial_data:
            msg = msgpack.packb(data, use_bin_type=True)
            self.response_list.append(msg)

    async def send_next_message(self):
        """Sends the next response on the response list and updates the client status

        Raises
        ------
        AssertionError
            If no websocket on ws_list or if response_list is empty.
        """

        if len(self.response_list) > 0 and len(self.ws_list) > 0:
            assert self.ws_list[0]
            assert self.response_list[0]
            self.client_status = StatusType.busy
            await self.ws_list[0].send_text(self.response_list.pop(0))

    def prepare_data(self, msg: PlotMessage):
        """Processes PlotMessage into response and appends to response list

        Parameters
        ----------
        msg : PlotMessage
            A client message for processing.
        """

        data = self.processor.process(msg)
        msg = msgpack.packb(data, use_bin_type=True)
        self.response_list.append(msg)
