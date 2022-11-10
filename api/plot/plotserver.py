from __future__ import annotations

import logging
from queue import Empty

from plot.custom_types import ClearPlotsMessage, PlotMessage, StatusType
from plot.fastapi_utils import mp_packb, ws_asdict
from plot.plotidmap import PlotIdMap
from plot.processor import Processor


class PlotServer:
    """
    A class used to create a plot server

    ...

    Attributes
    ----------
    plot_id_mapping : PlotIdMap
        The plot_ids and their associated websockets and queues
    processor : Processor
        The data processor
    client_status : StatusType
        The status of the client
    message_history: dict[str: list]
        A dictionary containing a history of all messages per plot_id

    Methods
    -------
    clear_queues()
        Clears message_history and queues for a given plot_id
    clear_plots()
        Sends message to clear plots to clients for a given plot_id
    clear_plots_and_queues()
        Clears message_history and queues and sends message to clear plots to clients
        for a given plot_id
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

        self.plot_id_mapping: PlotIdMap = PlotIdMap()
        self.processor: Processor = processor
        self.client_status: StatusType = StatusType.busy
        self.message_history: dict[str:list] = {}

    def get_plot_ids(self) -> list[str]:
        return self.plot_id_mapping.get_plot_ids()

    def clear_queues(self, plot_id: str):
        """
        Clears message_history and queues for a given plot_id

        Parameters
        ----------
        plot_id : str
            ID of plot to which to send data message.
        """

        self.message_history[plot_id] = []
        for q in self.plot_id_mapping.queues_for_plot_id(plot_id):
            with q.mutex:
                q.queue.clear()

    async def clear_plots(self, plot_id: str):
        """
        Sends message to clear plots to clients for a given plot_id

        Parameters
        ----------
        plot_id : str
            ID of plot to which to send data message.
        """

        pm = ws_asdict(ClearPlotsMessage(plot_id=plot_id))
        msg = mp_packb(pm)
        self.message_history[plot_id].append(msg)
        for q in self.plot_id_mapping.queues_for_plot_id(plot_id):
            q.put(msg)
        await self.send_next_message()

    async def clear_plots_and_queues(self, plot_id):
        """
        Clears message_history and queues and sends message to clear plots to clients
        for a given plot_id

        Parameters
        ----------
        plot_id : str
            ID of plot to which to send data message.
        """

        self.clear_queues(plot_id)
        await self.clear_plots(plot_id)

    async def send_next_message(self):
        """Sends the next response on the response list and updates the client status

        Raises
        ------
        Empty
            If queue is empty.
        """

        if self.plot_id_mapping.websockets_available:
            self.client_status = StatusType.busy
            for ws, q in self.plot_id_mapping._websocket_to_queue.items():
                try:
                    await ws.send_text(q.get(block=False))
                except Empty:
                    logging.debug(f"Queue for websocket {ws} is empty")
                    continue

    def prepare_data(self, msg: PlotMessage):
        """Processes PlotMessage into response and appends to response list

        Parameters
        ----------
        msg : PlotMessage
            A client message for processing.
        """

        plot_id = msg.plot_id
        processed_msg = self.processor.process(msg)
        data = ws_asdict(processed_msg)
        message = mp_packb(data)

        if plot_id in self.message_history.keys():
            self.message_history[plot_id].append(message)
        else:
            self.message_history[plot_id] = [message]

        self.plot_id_mapping.add_msg_to_queues(plot_id, message)
