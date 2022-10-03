from __future__ import annotations

import msgpack

from fastapi import WebSocket
from queue import Queue, Empty
from typing import Dict, List

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

        self.plot_id_mapping: Dict[str: List[WebSocket]] = {}
        self.ws_list: Dict[WebSocket: Queue] = {}
        self.processor: Processor = processor
        self.client_status: StatusType = StatusType.busy
        self.message_history: Dict[str: List] = {}
        self.initialise_data()

    def initialise_data(self):
        """Prepares initial data into responses and appends to response list."""
        for data in self.processor.initial_data:
            plot_id = data["plot_id"]
            msg = msgpack.packb(data, use_bin_type=True)
            if plot_id in self.message_history.keys():
                self.message_history[plot_id].append(msg)
            else:
                self.message_history[plot_id] = [msg]

            if plot_id in self.plot_id_mapping.keys():
                for ws in self.plot_id_mapping[plot_id]:
                    self.ws_list[ws].put(msg)


    def clear_queues(self, plot_id: str):
        """Clears queues and message history."""
        self.message_history[plot_id] = []
        for ws in self.plot_id_mapping[plot_id]:
            with self.ws_list[ws].mutex:
                self.ws_list[ws].queue.clear()

    async def clear_plots(self, plot_id: str):
        """Adds message to queues and message to history to clear plots."""
        msg = msgpack.packb({"type": "clear plots"}, use_bin_type=True)
        self.message_history[plot_id].append(msg)
        for ws in self.plot_id_mapping[plot_id]:
            self.ws_list[ws].put(msg)
        await self.send_next_message()

    async def clear_plots_and_queues(self, plot_id):
        """Clears queues and message history and adds message to clear plots."""
        self.clear_queues(plot_id)
        await self.clear_plots(plot_id)

    async def send_next_message(self):
        """Sends the next response on the response list and updates the client status

        Raises
        ------
        Empty
            If queue is empty.
        """

        if len(self.ws_list) > 0:
            self.client_status = StatusType.busy

            for ws, q in self.ws_list.items():
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
        plot_id = msg.plot_id
        msg = msgpack.packb(data, use_bin_type=True)
        self.message_history[plot_id].append(msg)
        for ws in self.plot_id_mapping[plot_id]:
            self.ws_list[ws].put(msg)
