from __future__ import annotations

from asyncio import Queue, QueueEmpty
import logging
from collections import defaultdict

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
    PlotState,
    SelectionsMessage,
    StatusType,
)
from .processor import Processor

logger = logging.getLogger("main")

def empty_queue(q: Queue):
  while not q.empty():
    q.get_nowait()
    q.task_done()


class PlotClient:
    """A class to represent a Web UI client that plots

    This manages a queue of messages to send to the client
    """

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.queue = Queue()
        self.name = ""

    async def add_message(self, message: bytes):
        """Add message for client"""
        await self.queue.put(message)

    def clear_queue(self):
        """Clear messages in client queue"""
        q = self.queue
        empty_queue(q)

    async def send_next_message(self):
        """Send next message in queue to client"""
        try:
            msg = self.queue.get_nowait()
            await self.websocket.send_bytes(msg)
        except QueueEmpty:
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
    plot_states: defaultdict[str, PlotState] = defaultdict(PlotState)
        A dictionary containing plot states per plot_id
    client_total: int

    Methods
    -------
    add_client()
        Add a client given by a plot ID and websocket
    clear_queues()
        Clears current data, selections and queues for a given plot_id
    clear_plots()
        Sends message to clear plots to clients for a given plot_id
    clear_plots_and_queues()
        Clears queues and sends message to clear plots to clients for a given plot_id
    clients_available()
        Return True if any clients are available
    combine_line_messages()
        Adds indices to data message and appends points to current multi-line data message
    get_plot_ids()
        Get plot IDs
    remove_client()
        Remove a client given by a plot ID and client
    send_next_message()
        Sends the next response on the response list and updates the client status
    prepare_data()
        Processes PlotMessage into response and appends to response list.
    """

    def __init__(self):
        self.processor: Processor = Processor()
        self._clients: defaultdict[str, list[PlotClient]] = defaultdict(list)
        self.client_status: StatusType = StatusType.busy
        self.plot_states: defaultdict[str, PlotState] = defaultdict(PlotState)
        self.client_total = 0

    async def add_client(self, plot_id: str, websocket: WebSocket) -> PlotClient:
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

        if self.plot_states[plot_id]:
            async with self.plot_states[plot_id].lock:
                if self.plot_states[plot_id].new_data_message:
                    await client.add_message(self.plot_states[plot_id].new_data_message)
                if self.plot_states[plot_id].new_selections_message:
                    await client.add_message(self.plot_states[plot_id].new_selections_message)
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

    async def clear_plot_states(self, plot_id: str):
        """
        Clears plot_states for a given plot ID

        Parameters
        ----------
        plot_id : str
            ID of plot to clear
        """
        if self.plot_states[plot_id]:
            async with self.plot_states[plot_id].lock:
                self.plot_states[plot_id].clear()

    async def clear_queues(self, plot_id: str):
        """
        Clears current data, selections and queues for a given plot ID

        Parameters
        ----------
        plot_id : str
            ID of plot to clear
        """
        await self.clear_plot_states(plot_id)
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
        for c in self._clients[plot_id]:
            await c.add_message(msg)
        await self.send_next_message()

    async def clear_plots_and_queues(self, plot_id: str):
        """
        Clears queues and sends message to clear plots to clients
        for a given plot_id

        Parameters
        ----------
        plot_id : str
            ID of plot to which to send data message.
        """
        await self.clear_queues(plot_id)
        await self.clear_plots(plot_id)

    async def send_next_message(self):
        """Sends the next response on the response list and updates the client status"""
        if self.clients_available():
            self.client_status = StatusType.busy
            for cl in self._clients.values():
                for c in cl:
                    await c.send_next_message()

    def combine_line_messages(
        self, plot_id: str, new_points_msg: AppendLineDataMessage
    ) -> tuple[MultiLineDataMessage, AppendLineDataMessage]:
        """
        Adds indices to data message and appends points to current multi-line data message

        Parameters
        ----------
        plot_id: str
            id of plot to append data to
        new_points_msg : AppendLineDataMessage
            new points to append to current data lines.
        """
        current_msg = self.plot_states[plot_id].current_data
        current_lines = getattr(current_msg, "ml_data", None)
        new_points = new_points_msg.al_data
        default_indices = current_lines[0].default_indices
        current_lines_len = len(current_lines)
        new_points_len = len(new_points)

        if not default_indices:
            combined_lines = [
                LineData(
                    key=l.key,
                    x=np.append(l.x, p.x),
                    y=np.append(l.y, p.y),
                    colour=l.colour,
                    line_on=l.line_on,
                    point_size=l.point_size,
                    default_indices=False,
                )
                for l, p in zip(current_lines, new_points)
            ]

            if current_lines_len > new_points_len:
                combined_lines += current_lines[new_points_len:]

            elif new_points_len > current_lines_len:
                combined_lines += new_points[current_lines_len:]

        else:
            indexed_lines = []
            combined_lines = []
            for l, p in zip(current_lines, new_points):
                indexed_lines.append(
                    LineData(
                        key=p.key,
                        x=np.arange(l.y.size, l.y.size + p.y.size),
                        y=p.y,
                        colour=p.colour,
                        line_on=p.line_on,
                        point_size=p.point_size,
                        default_indices=True,
                    )
                )
                combined_lines.append(
                    LineData(
                        key=l.key,
                        x=np.append(l.x, np.arange(l.y.size, l.y.size + p.y.size)),
                        y=np.append(l.y, p.y),
                        colour=l.colour,
                        line_on=l.line_on,
                        point_size=l.point_size,
                        default_indices=True,
                    )
                )
            if current_lines_len > new_points_len:
                combined_lines += current_lines[new_points_len:]

            elif new_points_len > current_lines_len:
                extra_indexed_lines = [
                    LineData(
                        key=p.key,
                        x=np.arange(p.y.size),
                        y=p.y,
                        colour=p.colour,
                        line_on=p.line_on,
                        point_size=p.point_size,
                        default_indices=True,
                    )
                    for p in new_points[current_lines_len:]
                ]
                combined_lines += extra_indexed_lines
                indexed_lines += extra_indexed_lines

            new_points_msg.al_data = indexed_lines

        return (
            MultiLineDataMessage(
                ml_data=combined_lines, axes_parameters=current_msg.axes_parameters
            ),
            new_points_msg,
        )

    async def update_plot_states_with_message(self, msg: DataMessage | SelectionsMessage, plot_id: str) -> DataMessage | SelectionsMessage:
        """Indexes and combines line messages if needed and updates plot states

        Parameters
        ----------
        msg : DataMessage | SelectionsMessage
            A message for plot states.
        """
        async with self.plot_states[plot_id].lock:
            if isinstance(msg, SelectionsMessage):
                self.plot_states[plot_id].current_selections = msg
                self.plot_states[plot_id].new_selections_message = ws_pack(msg)

            elif isinstance(msg, AppendSelectionsMessage):
                if self.plot_states[plot_id].current_selections:
                    self.plot_states[
                        plot_id
                    ].current_selections.set_selections += msg.append_selections
                else:
                    self.plot_states[plot_id].current_selections = SelectionsMessage(
                        set_selections=msg.append_selections
                    )
                self.plot_states[plot_id].new_selections_message = ws_pack(
                    self.plot_states[plot_id].current_selections
                )

            elif isinstance(msg, AppendLineDataMessage):
                if isinstance(self.plot_states[plot_id].current_data, MultiLineDataMessage):
                    combined_msgs, indexed_append_msgs = self.combine_line_messages(
                        plot_id, msg
                    )
                    self.plot_states[plot_id].current_data = combined_msgs
                    self.plot_states[plot_id].new_data_message = ws_pack(
                        self.plot_states[plot_id].current_data
                    )
                    msg = indexed_append_msgs
                else:
                    msg = convert_append_to_multi_line_data_message(msg)

            elif isinstance(msg, DataMessage):
                if isinstance(msg, MultiLineDataMessage):
                    msg = add_indices(msg)
                self.plot_states[plot_id].current_data = msg
                self.plot_states[plot_id].new_data_message = ws_pack(msg)

        return msg

    async def prepare_data (self, msg: PlotMessage, omit_client: PlotClient = None):
        """Processes PlotMessage into a client message and adds that to any client

        Parameters
        ----------
        msg : PlotMessage
            A client message for processing.
        """
        plot_id = msg.plot_id
        processed_msg = self.processor.process(msg)

        new_msg = await self.update_plot_states_with_message(processed_msg, plot_id)

        message = ws_pack(new_msg)
        for c in self._clients[plot_id]:
            if c is not omit_client:
                await c.add_message(message)


async def handle_client(server: PlotServer, plot_id: str, socket: WebSocket):
    client = await server.add_client(plot_id, socket)
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
                await server.prepare_data(received_message, omit_client=omit)
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


def convert_append_to_multi_line_data_message(
    msg: AppendLineDataMessage,
) -> MultiLineDataMessage:
    """Converts append line data message to a multi-line data message and adds default indices if any
      default indices flag is True

    Parameters
    ----------
    msg : AppendLineDataMessage
        An append line data message to convert to a multi-line data message.

    Returns the new multi-line data message
    """
    default_indices = any([a.default_indices for a in msg.al_data])
    if default_indices:
        for i, m in enumerate(msg.al_data):
            msg.al_data[i].x = np.array([x for x in range(m.y.size)])
            msg.al_data[i].default_indices = True

    return MultiLineDataMessage(
        axes_parameters=msg.axes_parameters,
        ml_data=msg.al_data,
    )
