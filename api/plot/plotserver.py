from __future__ import annotations

import msgpack

from fastapi import WebSocket
from queue import Queue, Empty
from typing import List, Tuple

from plot.custom_types import PlotMessage, StatusType
from plot.processor import Processor


class PlotServer:
    """
    A class used to create a plot server

    ...

    Attributes
    ----------
    ws_list : List[Tuple[WebSocket, Queue]]
        A list of tuples of websockets and queues in use
    processor : Processor
        The data processor
    client_status : StatusType
        The status of the client
    message_history: List
        A list containing a history of all messages

    Methods
    -------
    initialise_data()
        Prepares initial data into responses and appends to response list
    clear_queues()
        Clears message history and clears messages held on queues
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

        self.ws_list: List[Tuple[WebSocket, Queue]] = []
        self.processor: Processor = processor
        self.client_status: StatusType = StatusType.busy
        self.message_history: List = []
        self.initialise_data()

    def initialise_data(self):
        """Prepares initial data into responses and appends to response list."""
        for data in self.processor.initial_data:
            msg = msgpack.packb(data, use_bin_type=True)
            self.message_history.append(msg)
            for _, q in self.ws_list:
                q.put(msg)

    def clear_queues(self):
        """Clears queues and message history."""
        self.message_history = []
        for _, q in self.ws_list:
            with q.mutex:
                q.queue.clear()

    async def clear_plots(self):
        """Adds message to queues and message to history to clear plots."""
        msg = msgpack.packb({"type": "clear plots"}, use_bin_type=True)
        self.message_history.append(msg)
        for _, q in self.ws_list:
            q.put(msg)
        await self.send_next_message()

    async def clear_plots_and_queues(self):
        """Clears queues and message history and adds message to clear plots."""
        self.clear_queues()
        await self.clear_plots()

    async def send_next_message(self):
        """Sends the next response on the response list and updates the client status

        Raises
        ------
        Empty
            If queue is empty.
        """

        if len(self.ws_list) > 0:
            self.client_status = StatusType.busy
            for ws, q in self.ws_list:
                try:
                    await ws.send_text(q.get(block=False))
                except Empty:
                    print(f"Queue for websocket {ws} is empty")
                    continue


    def prepare_data(self, msg: PlotMessage):
        """Processes PlotMessage into response and appends to response list

        Parameters
        ----------
        msg : PlotMessage
            A client message for processing.
        """

        data = self.processor.process(msg)
        msg = msgpack.packb(data, use_bin_type=True)
        self.message_history.append(msg)
        for _, q in self.ws_list:
            q.put(msg)
