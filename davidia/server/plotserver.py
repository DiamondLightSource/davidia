from __future__ import annotations

import logging
from collections import defaultdict
from queue import Empty, Queue

from fastapi import WebSocket, WebSocketDisconnect
import numpy as np
from .fastapi_utils import ws_pack, ws_unpack
from ..models.messages import (
    AppendLineDataMessage,
    AppendSelectionsMessage,
    ClearPlotsMessage,
    DataMessage,
    LineData,
    MsgType,
    MultiLineDataMessage,
    PlotMessage,
    SelectionsMessage,
    StatusType,
)
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
    processor: Processor
        The data processor
    _clients: defaultdict[str, list[PlotClient]]
        A dictionary containing all plot clients per plot_id
    client_status: StatusType
        The status of the client
    new_data_message: dict[str, bytes]
        A dictionary containing current data message as bytes
    new_selections_message: dict[str, bytes]
        A dictionary containing current selection message as bytes
    current_data: dict[str, DataMessage | None]
        A dictionary containing current data message
    current_selections: dict[str, SelectionsMessage | None]
        A dictionary containing current selection message
    message_history: dict[str, list]
        A dictionary containing a history of all messages per plot_id
    client_total: int

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
    combine_line_messages()
        Adds indices to data message and appends points to current multi-line data message
    prepare_data()
        Processes PlotMessage into response and appends to response list.
    """

    def __init__(self):
        self.processor: Processor = Processor()
        self._clients: defaultdict[str, list[PlotClient]] = defaultdict(list)
        self.client_status: StatusType = StatusType.busy

        self.new_data_message: dict[str, bytes] = defaultdict(lambda: None)
        self.new_selections_message: dict[str, bytes] = defaultdict(lambda: None)
        self.current_data: dict[str, DataMessage | None] = defaultdict(lambda: None)
        self.current_selections: dict[str, SelectionsMessage | None] = defaultdict(lambda: None)

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
        if plot_id in self.new_data_message and self.new_data_message[plot_id]:
            client.add_message(self.new_data_message[plot_id])
        if plot_id in self.new_selections_message and self.new_selections_message[plot_id]:
            client.add_message(self.new_selections_message[plot_id])
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
        if plot_id in self.current_data:
            self.current_data[plot_id] = None
        if plot_id in self.current_selections:
            self.current_selections[plot_id] = None
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

    def combine_line_messages(self, plot_id: str, new_points_msg: AppendLineDataMessage) -> tuple[MultiLineDataMessage, AppendLineDataMessage]:
        """
        Adds indices to data message and appends points to current multi-line data message

        Parameters
        ----------
        plot_id: str
            id of plot to append data to
        new_points_msg : AppendLineDataMessage
            new points to append to current data lines.
        """
        current_msg = self.current_data[plot_id]
        current_lines = current_msg.ml_data
        new_points = new_points_msg.al_data

        default_indices = current_lines[0].default_indices

        current_lines_len = len(current_lines)
        new_points_len = len(new_points)

        if not default_indices:
            combined_lines = [
                LineData(
                    key=l.key,
                    x = np.append(l.x, p.x),
                    y = np.append(l.y, p.y),
                    colour=l.colour,
                    line_on=l.line_on,
                    point_size=l.point_size,
                    default_indices=False
                    ) for l, p in zip(current_lines, new_points)
            ]

            if current_lines_len > new_points_len:
                combined_lines += current_lines[new_points_len:]

            elif new_points_len > current_lines_len:
                indexed_lines = [
                    LineData(
                        key=p.key,
                        x = p.x,
                        y = p.y,
                        colour=p.colour,
                        line_on=p.line_on,
                        point_size=p.point_size,
                        default_indices=False,
                        ) for p in new_points[current_lines_len:]
                ]
                combined_lines += indexed_lines

        else:
            indexed_lines = []
            combined_lines = []
            for l, p in zip(current_lines, new_points):
                indexed_lines.append(LineData(
                    key=p.key,
                    x = np.array([x + l.y.size for x in range(p.y.size)]),
                    y = p.y,
                    colour=p.colour,
                    line_on=p.line_on,
                    point_size=p.point_size,
                    default_indices=True,
                    ))
                combined_lines.append(LineData(
                    key=l.key,
                    x = np.append(l.x, np.array([x + l.y.size for x in range(p.y.size)])),
                    y = np.append(l.y, p.y),
                    colour=l.colour,
                    line_on=l.line_on,
                    point_size=l.point_size,
                    default_indices=True,
                    ))
            if current_lines_len > new_points_len:
                combined_lines += current_lines[new_points_len:]

            elif new_points_len > current_lines_len:
                extra_indexed_lines = [
                    LineData(
                        key=p.key,
                        x = np.array([x for x in range(p.y.size)]),
                        y = p.y,
                        colour=p.colour,
                        line_on=p.line_on,
                        point_size=p.point_size,
                        default_indices=True,
                        ) for p in new_points[current_lines_len:]
                ]
                combined_lines += extra_indexed_lines
                indexed_lines += extra_indexed_lines

            new_points_msg.al_data = indexed_lines

        return (
            MultiLineDataMessage(ml_data=combined_lines, axes_parameters=current_msg.axes_parameters),
            new_points_msg,
        )

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
        self.message_history[plot_id].append(message) # gets packed message before indexing

        if isinstance(processed_msg, SelectionsMessage):
            self.current_selections[plot_id] = processed_msg
            self.new_selections_message[plot_id] = message

        elif isinstance(processed_msg, AppendSelectionsMessage):
            if self.current_selections[plot_id]:
                self.current_selections[plot_id].set_selections += processed_msg.append_selections
            else:
                self.current_selections[plot_id] = SelectionsMessage(set_selections=processed_msg.append_selections)
            self.new_selections_message[plot_id] = ws_pack(self.current_selections[plot_id])

        elif isinstance(processed_msg, AppendLineDataMessage):
            if isinstance(self.current_data[plot_id], MultiLineDataMessage):
                combined_msgs, indexed_append_msgs = self.combine_line_messages(plot_id, processed_msg)
                self.current_data[plot_id] = combined_msgs
                self.new_data_message[plot_id] = ws_pack(self.current_data[plot_id])
                processed_msg = indexed_append_msgs
                message = ws_pack(processed_msg)
            else:
                return

        elif isinstance(processed_msg, DataMessage):
            if isinstance(processed_msg, MultiLineDataMessage):
                processed_msg = add_indices(processed_msg)
                message = ws_pack(processed_msg)
            self.current_data[plot_id] = processed_msg
            self.new_data_message[plot_id] = ws_pack(processed_msg)

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

def add_indices(msg: MultiLineDataMessage) -> MultiLineDataMessage:
    """Adds default indices to a multi-line data message if default indices flag is True

    Parameters
    ----------
    msg : MultiLineDataMessage
        A multi-line data message to which to add indices.

    Returns the new multi-line data message
    """
    if msg.ml_data[0].default_indices:
        for i, m in enumerate(msg.ml_data):
            msg.ml_data[i].x = np.array([x for x in range(m.y.size)])
    return msg
