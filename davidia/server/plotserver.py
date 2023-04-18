from __future__ import annotations

import logging
from asyncio import Lock, Queue, QueueEmpty, sleep
from collections import defaultdict
from time import time_ns

import numpy as np
from fastapi import WebSocket, WebSocketDisconnect

from ..models.messages import (
    AppendLineDataMessage,
    ClearPlotsMessage,
    ClearSelectionsMessage,
    DataMessage,
    LineData,
    MsgType,
    MultiLineDataMessage,
    PlotMessage,
    SelectionMessage,
    SelectionsMessage,
    StatusType,
    UpdateSelectionsMessage,
)
from . import benchmarks as _benchmark
from ..models.selections import SelectionBase
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

    async def add_message(self, message: bytes):
        """Add message for client"""
        await self.queue.put(message)

    def clear_queue(self):
        """Clear messages in client queue"""
        q = self.queue
        while not q.empty():
            q.get_nowait()
            q.task_done()

    async def send_next_message(self):
        """Send next message in queue to client"""
        try:
            msg = self.queue.get_nowait()
            self.queue.task_done()
            await self.websocket.send_bytes(msg)
        except QueueEmpty:
            logger.debug(f"Queue for websocket {self.websocket} is empty")


class PlotState:
    """Class for representing the state of a plot"""

    def __init__(
        self,
        new_data_message=None,
        new_selections_message=None,
        current_data=None,
        current_selections=None,
    ):
        self.new_data_message: bytes | None = new_data_message
        self.new_selections_message: bytes | None = new_selections_message
        self.current_data: DataMessage | None = current_data
        self.current_selections: list[SelectionBase] | None = current_selections
        self.lock = Lock()

    def clear(self):
        """Clear all current and new data and selections"""
        self.new_data_message = None
        self.new_selections_message = None
        self.current_data = None
        self.current_selections = None


class PlotServer:
    """
    A class used to create a plot server that manages plot clients and messaging

    Attributes
    ----------
    processor : Processor
        The data processor.
    _clients : dict[str, list[PlotClient]]
        A dictionary containing all plot clients per plot ID.
    client_status : StatusType
        The status of the client.
    plot_states : dict[str, PlotState] = defaultdict(PlotState)
        A dictionary containing plot states per plot_id
    client_total : int
        Number of clients added to server
    """

    def __init__(self):
        self.processor: Processor = Processor()
        self._clients: dict[str, list[PlotClient]] = defaultdict(list)
        self.client_status: StatusType = StatusType.busy
        self.plot_states: dict[str, PlotState] = defaultdict(PlotState)
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

        if plot_id in self.plot_states:
            plot_state = self.plot_states[plot_id]
            async with plot_state.lock:
                if plot_state.new_data_message:
                    await client.add_message(plot_state.new_data_message)
                if plot_state.new_selections_message:
                    await client.add_message(plot_state.new_selections_message)
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
        Returns sorted list of plot IDs in all plot clients
        """
        return sorted(list(self._clients.keys()))

    async def clear_plot_states(self, plot_id: str):
        """
        Clears plot_states for a given plot ID

        Parameters
        ----------
        plot_id : str
            ID of plot to clear
        """
        if plot_id in self.plot_states:
            plot_state = self.plot_states[plot_id]
            async with plot_state.lock:
                plot_state.clear()

    async def get_regions(self, plot_id: str) -> list[SelectionBase]:
        """
        Get regions for a given plot ID

        Parameters
        ----------
        plot_id : str

        Returns list of regions from given plot ID
        """
        plot_state = self.plot_states[plot_id]
        async with plot_state.lock:
            cs = plot_state.current_selections
            return [] if cs is None else list(cs)

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

    async def benchmark(self, plot_id: str, params: _benchmark.BenchmarkParams) -> str:
        b = getattr(_benchmark, params.plot_type, None)
        if b is None:
            return f"Benchmark type not supported: {params.plot_type}"

        start = -1
        pause = params.pause
        for _ in range(params.iterations):
            for msg in b(params.params):
                msg = ws_pack(msg)
                for c in self._clients[plot_id]:
                    await c.add_message(msg)
                await self.send_next_message()
                if start == -1:
                    await sleep(1) # allow more time to setup plot
                    start = time_ns()
                else:
                    await sleep(pause)

        return f"Finished in {int((time_ns() - start)/1000000)}ms"

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
        Adds indices to data message and appends points to current multi-line
        data message

        Parameters
        ----------
        plot_id: str
            id of plot to append data to
        new_points_msg : AppendLineDataMessage
            new points to append to current data lines.
        """
        ml_data_msg = self.plot_states[plot_id].current_data
        current_lines = ml_data_msg.ml_data
        new_points = new_points_msg.al_data
        default_indices = current_lines[0].default_indices
        current_lines_len = len(current_lines)
        new_points_len = len(new_points)

        if not default_indices:
            combined_lines = [
                LineData(
                    key=c.key,
                    x=np.append(c.x, p.x),
                    y=np.append(c.y, p.y),
                    colour=c.colour,
                    line_on=c.line_on,
                    point_size=c.point_size,
                    default_indices=False,
                )
                for c, p in zip(current_lines, new_points)
            ]

            if current_lines_len > new_points_len:
                combined_lines += current_lines[new_points_len:]

            elif new_points_len > current_lines_len:
                combined_lines += new_points[current_lines_len:]

        else:
            indexed_lines = []
            combined_lines = []
            for c, p in zip(current_lines, new_points):
                c_y_size = c.y.size
                total_y_size = c_y_size + p.y.size
                indexed_lines.append(
                    LineData(
                        key=p.key,
                        x=np.arange(
                            c_y_size,
                            total_y_size,
                            dtype=np.min_scalar_type(total_y_size),
                        ),
                        y=p.y,
                        colour=p.colour,
                        line_on=p.line_on,
                        point_size=p.point_size,
                        default_indices=True,
                    )
                )
                combined_lines.append(
                    LineData(
                        key=c.key,
                        x=np.append(
                            c.x,
                            np.arange(
                                c_y_size,
                                total_y_size,
                                dtype=np.min_scalar_type(total_y_size),
                            ),
                        ),
                        y=np.append(c.y, p.y),
                        colour=c.colour,
                        line_on=c.line_on,
                        point_size=c.point_size,
                        default_indices=True,
                    )
                )
            if current_lines_len > new_points_len:
                combined_lines += current_lines[new_points_len:]

            elif new_points_len > current_lines_len:
                extra_indexed_lines = [
                    LineData(
                        key=p.key,
                        x=np.arange(p.y.size, dtype=np.min_scalar_type(p.y.size)),
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
                ml_data=combined_lines, axes_parameters=ml_data_msg.axes_parameters
            ),
            new_points_msg,
        )

    async def update_plot_states_with_message(
        self, msg: DataMessage | SelectionMessage, plot_id: str
    ) -> bytes:
        """Indexes and combines line messages if needed and updates plot states

        Parameters
        ----------
        msg : DataMessage | SelectionMessage
            A message for plot states.
        """
        plot_state = self.plot_states[plot_id]
        async with plot_state.lock:
            match msg:
                case SelectionsMessage():
                    plot_state.current_selections = msg.set_selections
                    msg = plot_state.new_selections_message = ws_pack(msg)

                case UpdateSelectionsMessage():
                    current = plot_state.current_selections
                    if current is None:
                        current = plot_state.current_selections = []
                    extra = []
                    for u in msg.update_selections:
                        uid = u.id
                        for i, c in enumerate(current):
                            if uid == c.id:
                                current[i] = u
                                break
                        else:
                            extra.append(u)
                    current.extend(extra)
                    plot_state.new_selections_message = ws_pack(
                        SelectionsMessage(set_selections=plot_state.current_selections)
                    )
                    msg = ws_pack(msg)

                case ClearSelectionsMessage():
                    ids = msg.selection_ids
                    current = plot_state.current_selections
                    if current is None:
                        return
                    if len(ids) == 0:
                        current.clear()
                    else:
                        for s in current:
                            if s.id in ids:
                                current.remove(s)
                    plot_state.new_selections_message = ws_pack(
                        SelectionsMessage(set_selections=plot_state.current_selections)
                    )
                    msg = ws_pack(msg)

                case AppendLineDataMessage():
                    if isinstance(plot_state.current_data, MultiLineDataMessage):
                        combined_msgs, indexed_append_msgs = self.combine_line_messages(
                            plot_id, msg
                        )
                        plot_state.current_data = combined_msgs
                        plot_state.new_data_message = ws_pack(plot_state.current_data)
                        msg = indexed_append_msgs
                    else:
                        msg = convert_append_to_multi_line_data_message(msg)
                    msg = ws_pack(msg)

                case DataMessage():
                    if isinstance(msg, MultiLineDataMessage):
                        msg = add_indices(msg)
                    plot_state.current_data = msg
                    msg = plot_state.new_data_message = ws_pack(msg)

        return msg

    async def prepare_data(self, msg: PlotMessage, omit_client: PlotClient = None):
        """Processes PlotMessage into a client message and adds that to any client

        Parameters
        ----------
        msg : PlotMessage
            A client message for processing.
        """
        plot_id = msg.plot_id
        processed_msg = self.processor.process(msg)

        new_msg = await self.update_plot_states_with_message(processed_msg, plot_id)

        for c in self._clients[plot_id]:
            if c is not omit_client:
                await c.add_message(new_msg)


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
                        await client.send_next_message() # in case there are selections
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
                mtype = received_message.type

                if (
                    mtype == MsgType.client_new_selection
                    or mtype == MsgType.client_update_selection
                ):
                    logger.debug(
                        f"Got from {plot_id} ({mtype}): {received_message.params}"
                    )
                    omit = client  # omit originating client

                # currently used to test websocket communication in test_api
                await server.prepare_data(received_message, omit_client=omit)
                await server.send_next_message()

    except WebSocketDisconnect:
        logger.error("Websocket disconnected:", exc_info=True)
        server.remove_client(plot_id, client)


def add_indices(msg: MultiLineDataMessage) -> MultiLineDataMessage:
    """Adds default indices to a multi-line data message if default indices flag
    is True

    Parameters
    ----------
    msg : MultiLineDataMessage
        A multi-line data message to which to add indices.

    Returns the new multi-line data message
    """
    if msg.ml_data[0].default_indices:
        for m in msg.ml_data:
            m.x = np.arange(m.y.size, dtype=np.min_scalar_type(m.y.size))
    return msg


def convert_append_to_multi_line_data_message(
    msg: AppendLineDataMessage,
) -> MultiLineDataMessage:
    """Converts append line data message to a multi-line data message and adds default
      indices if any default indices flag is True
    indices if any default indices flag is True

    Parameters
    ----------
    msg : AppendLineDataMessage
        An append line data message to convert to a multi-line data message.

    Returns the new multi-line data message
    """
    default_indices = any([a.default_indices for a in msg.al_data])
    if default_indices:
        for m in msg.al_data:
            m.x = np.arange(m.y.size, dtype=np.min_scalar_type(m.y.size))
            m.default_indices = True

    return MultiLineDataMessage(
        axes_parameters=msg.axes_parameters,
        ml_data=msg.al_data,
    )
