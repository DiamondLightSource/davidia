from __future__ import annotations

import logging
from collections import defaultdict
from queue import Empty, Queue

from fastapi import WebSocket, WebSocketDisconnect

from ..models.messages import ClearPlotsMessage, MsgType, PlotMessage, StatusType
from .fastapi_utils import ws_pack, ws_unpack
from .processor import Processor

logger = logging.getLogger("main")


class PlotClient:
    """A class to represent a Web UI client that plots

    This manages a queue of messages to send to the client
    """

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.queue = Queue()
        self.name = ""

    def add_message(self, message: bytes):
        """Add message for client"""
        self.queue.put(message)

    def clear_queue(self):
        """Clear messages in client queue"""
        q = self.queue
        with q.mutex:
            q.queue.clear()

    async def send_next_message(self):
        """Send next message in queue to client"""
        try:
            await self.websocket.send_bytes(self.queue.get(block=False))
        except Empty:
            logger.debug(f"Queue for websocket {self.websocket} is empty")


class PlotServer:
    """
    A class used to create a plot server that manages plot clients and messaging
    ...

    Attributes
    ----------
    processor : Processor
        The data processor
    client_status : StatusType
        The status of the client
    message_history: dict[str, list]
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

    def __init__(self):
        self.processor: Processor = Processor()
        self._clients: defaultdict[str, list[PlotClient]] = defaultdict(list)
        self.client_status: StatusType = StatusType.busy
        self.message_history: dict[str, list[bytes]] = defaultdict(list)
        self.client_total = 0

    def add_client(self, plot_id: str, websocket: WebSocket) -> PlotClient:
        """Add a client given by a plot ID and websocket
        Parameters
        ----------
        plot_id : str
        websocket: WebSocket

        Returns the added client
        """
        client = PlotClient(websocket)
        client.name = f"{plot_id}:{self.client_total}"
        self.client_total += 1
        self._clients[plot_id].append(client)
        for i in self.message_history[plot_id]:
            client.add_message(i)
        return client

    def remove_client(self, plot_id: str, client: PlotClient):
        """Remove a client given by a plot ID and client
        Parameters
        ----------
        plot_id : str
        client : PlotClient
        """
        try:
            self._clients[plot_id].remove(client)
        except ValueError:
            logger.warning(f"Client {client.name} does not exist for {plot_id}")

    def clients_available(self):
        """Return True if any clients are available"""
        for cl in self._clients.values():
            if any(cl):
                return True
        return False

    def get_plot_ids(self) -> list[str]:
        """Get plot IDs
        Returns list of plot IDs in all plot clients
        """
        return list(self._clients.keys())

    def clear_queues(self, plot_id: str):
        """
        Clears message history and queues for a given plot ID

        Parameters
        ----------
        plot_id : str
            ID of plot to clear
        """
        if plot_id in self.message_history:
            self.message_history[plot_id].clear()
        for c in self._clients[plot_id]:
            c.clear_queue()

    async def clear_plots(self, plot_id: str):
        """
        Sends message to clear plots to clients for a given plot_id

        Parameters
        ----------
        plot_id : str
            ID of plot to which to send data message.
        """
        msg = ws_pack(ClearPlotsMessage(plot_id=plot_id))

        self.message_history[plot_id].append(msg)
        for c in self._clients[plot_id]:
            c.add_message(msg)
        await self.send_next_message()

    async def clear_plots_and_queues(self, plot_id: str):
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
        """Sends the next response on the response list and updates the client status"""
        if self.clients_available():
            self.client_status = StatusType.busy
            for cl in self._clients.values():
                for c in cl:
                    await c.send_next_message()

    def prepare_data(self, msg: PlotMessage, omit_client: PlotClient = None):
        """Processes PlotMessage into a client message and adds that to any client

        Parameters
        ----------
        msg : PlotMessage
            A client message for processing.
        """
        plot_id = msg.plot_id
        processed_msg = self.processor.process(msg)
        message = ws_pack(processed_msg)

        self.message_history[plot_id].append(message)

        for c in self._clients[plot_id]:
            if c is not omit_client:
                c.add_message(message)


async def handle_client(server: PlotServer, plot_id: str, socket: WebSocket):
    client = server.add_client(plot_id, socket)
    initialize = True
    try:
        while True:
            message = await socket.receive()
            logger.debug(f"current message type is {message['type']}")
            if message["type"] == "websocket.disconnect":
                logger.debug(f"Websocket disconnected: {client.name}")
                server.remove_client(plot_id, client)
                break

            message = ws_unpack(message["bytes"])
            logger.debug(f"current message is {message}")
            received_message = PlotMessage.parse_obj(message)
            if received_message.type == MsgType.status:
                if received_message.params == StatusType.ready:
                    if initialize:
                        await client.send_next_message()
                        initialize = False
                    else:
                        server.client_status = StatusType.ready
                        await server.send_next_message()
                elif received_message.params == StatusType.closing:
                    logger.info("Websocket closing")
                    server.remove_client(plot_id, client)
                    break

            else:  # should process events from client (if that client is in control)
                omit = None
                if received_message.type == MsgType.client_new_selection:
                    params = received_message.params
                    logger.debug(f"Got from {plot_id}: {params}")
                    omit = client  # omit originating client

                # currently used to test websocket communication in test_api
                server.prepare_data(received_message, omit_client=omit)
                await server.send_next_message()

    except WebSocketDisconnect:
        logger.error("Websocket disconnected:", exc_info=True)
        server.remove_client(plot_id, client)