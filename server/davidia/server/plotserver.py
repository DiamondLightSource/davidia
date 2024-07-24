from __future__ import annotations

import logging
from asyncio import Lock, Queue, QueueEmpty, sleep
from collections import defaultdict
from time import time_ns

import numpy as np
from fastapi import WebSocket, WebSocketDisconnect

from . import benchmarks as _benchmark
from ..models.messages import (
    AppendLineDataMessage,
    BatonApprovalRequestMessage,
    BatonMessage,
    ClearPlotsMessage,
    ClearSelectionsMessage,
    ClientLineParametersMessage,
    ClientScatterParametersMessage,
    ColourMap,
    DataMessage,
    DvDNDArray,
    HeatmapData,
    ImageDataMessage,
    LineData,
    MsgType,
    MultiLineDataMessage,
    PlotMessage,
    SelectionMessage,
    SelectionsMessage,
    ScatterData,
    ScatterDataMessage,
    StatusType,
    UpdateSelectionsMessage,
)
from ..models.selections import SelectionBase
from .fastapi_utils import ws_pack, ws_unpack
from .processor import Processor

logger = logging.getLogger("main")

COLOURLIST = [
    "#009e73",  # teal
    "#e69d00",  # orange
    "#56b3e9",  # light blue
    "#f0e442",  # yellow
    "#0072b2",  # blue
    "#d55e00",  # dark orange
    "#cc79a7",  # pink
]


def add_colour_to_lines(line_data: list[LineData]):
    for i, line in enumerate(line_data):
        if not line.line_params.colour:
            line_data[i].line_params.colour = COLOURLIST[i % len(COLOURLIST)]


class PlotClient:
    """A class to represent a Web UI client that plots

    This manages a queue of messages to send to the client
    """

    def __init__(self, websocket: WebSocket, uuid: str):
        self.websocket = websocket
        self.uuid = uuid
        self.queue = Queue()
        self.name = ""

    async def add_message(self, message: bytes):
        """Add message for client"""
        msg = ws_unpack(message)
        logger.info(
            "New message being added to client %s with name %s. Decoded message is %s",
            self.uuid,
            self.name,
            list(msg.keys()),
        )
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
            logger.debug("Queue for websocket %s is empty", self.websocket)


class PlotState:
    """Class for representing the state of a plot"""

    def __init__(
        self,
        new_data_message=None,
        new_selections_message=None,
        current_data=None,
        current_selections=None,
        new_baton_message=None,
        current_baton=None,
    ):
        self.new_data_message: bytes | None = new_data_message
        self.new_selections_message: bytes | None = new_selections_message
        self.new_baton_message: bytes | None = new_baton_message
        self.current_data: DataMessage | None = current_data
        self.current_selections: list[SelectionBase] | None = current_selections
        self.current_baton: str | None = current_baton
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
    baton: str | None
        Current baton uuid
    plot_states : dict[str, PlotState] = defaultdict(PlotState)
        A dictionary containing plot states per plot_id
    client_total : int
        Number of clients added to server
    """

    def __init__(self):
        self.processor: Processor = Processor()
        self._clients: dict[str, list[PlotClient]] = defaultdict(list)
        self.client_status: StatusType = StatusType.busy
        self.uuids: list[str] = []
        self.baton: str | None = None
        self.plot_states: dict[str, PlotState] = defaultdict(PlotState)
        self.client_total = 0
        self.default_colour_map = ColourMap.Greys
        self.last_colour_maps: dict[str, ColourMap] = defaultdict(lambda: self.default_colour_map)

    async def add_client(
        self, plot_id: str, websocket: WebSocket, uuid: str
    ) -> PlotClient:
        """Add a client given by a plot ID and websocket
        Parameters
        ----------
        plot_id : str
        websocket: WebSocket

        Returns the added client
        """
        client = PlotClient(websocket, uuid)
        client.name = f"{plot_id}:{self.client_total}"
        self.client_total += 1
        self._clients[plot_id].append(client)
        if uuid not in self.uuids:
            self.uuids.append(uuid)

        if plot_id in self.plot_states:
            plot_state = self.plot_states[plot_id]
            async with plot_state.lock:
                if plot_state.new_data_message:
                    await client.add_message(plot_state.new_data_message)
                if plot_state.new_selections_message:
                    await client.add_message(plot_state.new_selections_message)
        if not self.baton:
            self.baton = uuid
            logger.info("Baton updated to %s", self.baton)
        await self.update_baton()
        return client

    async def update_baton(self):
        """Updates plot state and sends messages for new baton"""
        processed_msg = BatonMessage(baton=self.baton, uuids=self.uuids)
        for p, cl in self._clients.items():
            msg = await self.update_plot_states_with_message(processed_msg, p)
            if msg is None:
                continue
            for c in cl:
                await c.add_message(msg)

    def _any_client(self, plot_id: str, uuid: str) -> bool:
        for p, cl in self._clients.items():
            if p != plot_id:
                for c in cl:
                    if c.uuid == uuid:
                        return True
        return False

    async def remove_client(self, plot_id: str, client: PlotClient) -> bool:
        """Remove a client given by a plot ID and client
        Parameters
        ----------
        plot_id : str
        client : PlotClient

        Returns
        -------
        True if messages updated
        """
        try:
            self._clients[plot_id].remove(client)
        except ValueError:
            logger.warning("Client %s does not exist for %s", client.name, plot_id)

        uuid = client.uuid
        if self._any_client(plot_id, uuid):
            return False

        if uuid in self.uuids:
            self.uuids.remove(uuid)
        else:
            logger.error("Uuid %s not in uuids %s", client.uuid, self.uuids)

        if self.uuids:
            if self.baton == client.uuid:
                self.baton = self.uuids[0]
            await self.update_baton()
            return True

        self.baton = None
        return False

    async def send_baton_approval_request(self, message: PlotMessage) -> None:
        """Sends message to current baton holder to request baton
        Parameters
        ----------
        message : PlotMessage
        """
        requester = message.params
        if self.baton is None:
            logger.warning("Ignoring baton request as client does not have baton")
        elif requester in self.uuids:
            processed_msg = BatonApprovalRequestMessage(requester=requester)
            msg = ws_pack(processed_msg)
            if msg is not None:
                for c in self.clients_with_uuid(self.baton):
                    await c.add_message(msg)
            await self.send_next_message()
        else:
            logger.warning("Ignoring baton request by unknown %s", requester)

    async def take_baton(self, message: PlotMessage) -> bool:
        """Updates baton and sends new baton messages
        Parameters
        ----------
        message : PlotMessage

        Returns
        -------
        True if messages updated
        """
        uuid = message.params
        if uuid in self.uuids:
            self.baton = uuid
            await self.update_baton()
            return True

        logger.warning("Ignoring baton request by unknown %s", uuid)
        return False

    def clients_available(self) -> bool:
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
        if msg is not None:
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
                if msg is None:
                    continue
                for c in self._clients[plot_id]:
                    await c.add_message(msg)
                await self.send_next_message()
                if start == -1:
                    await sleep(1)  # allow more time to setup plot
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

    def convert_line_params_to_data_message(
        self, plot_id: str, line_param_msg: ClientLineParametersMessage
    ) -> MultiLineDataMessage:
        """
        Creates new MultiLineDataMessage from existing line data and new parameters

        Parameters
        ----------
        plot_id: str
            id of plot for which to update data
        line_param_msg : ClientLineParametersMessage
            line with updates parameters.
        """

        ml_data_msg = self.plot_states[plot_id].current_data
        if not isinstance(ml_data_msg, MultiLineDataMessage):
            raise ValueError(
                f"Wrong type of message given: MultiLineDataMessage expected: {type(ml_data_msg)}"
            )

        current_lines = ml_data_msg.ml_data
        modified_line_params = line_param_msg.line_params
        updated_lines = []
        key_found = False

        for line in current_lines:
            if not key_found and line.key == line_param_msg.key:
                updated_line = LineData(
                    key=line.key,
                    line_params=modified_line_params,
                    x=line.x,
                    y=line.y,
                    default_indices=line.default_indices,
                )
                updated_lines.append(updated_line)
                key_found = True
            else:
                updated_lines.append(line)

        if not key_found:
            raise ValueError(
                f"No line with key {line_param_msg.key} found in current line data {current_lines}"
            )

        add_colour_to_lines(updated_lines)

        return MultiLineDataMessage(
            ml_data=updated_lines, plot_config=ml_data_msg.plot_config
        )

    def convert_scatter_params_to_data_message(
        self, plot_id: str, scatter_param_msg: ClientScatterParametersMessage
    ) -> ScatterDataMessage:
        """
        Creates new ScatterDataMessage from existing scatter data and new parameters

        Parameters
        ----------
        plot_id: str
            id of plot for which to update data
        scatter_param_msg : ClientScatterParametersMessage
            scatter data parameters.
        """

        sc_data_msg = self.plot_states[plot_id].current_data
        if not isinstance(sc_data_msg, ScatterDataMessage):
            raise ValueError(
                f"Wrong type of message given: ScatterDataMessage expected: {type(sc_data_msg)}"
            )

        sc_data = sc_data_msg.sc_data

        updated_data = ScatterData(
            x=sc_data.x,
            y=sc_data.y,
            point_values=sc_data.point_values,
            domain=sc_data.domain,
            colour_map=sc_data.colour_map,
            point_size=scatter_param_msg.point_size,
        )

        return ScatterDataMessage(
            sc_data=updated_data, plot_config=sc_data_msg.plot_config
        )

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
        if not isinstance(ml_data_msg, MultiLineDataMessage):
            raise ValueError(
                f"Wrong type of message given: MultiLineDataMessage expected: {type(ml_data_msg)}"
            )

        current_lines = ml_data_msg.ml_data
        add_colour_to_lines(new_points_msg.al_data)
        new_points = new_points_msg.al_data
        default_indices = current_lines[0].default_indices
        current_lines_len = len(current_lines)
        new_points_len = len(new_points)

        def _append(a: DvDNDArray | None, b: DvDNDArray | None):
            if a is None:
                return b
            if b is None:
                return a
            return np.append(a, b)

        if not default_indices:
            combined_lines = [
                LineData(
                    line_params=c.line_params,
                    x=_append(c.x, p.x),
                    y=np.append(c.y, p.y),
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
                        line_params=p.line_params,
                        x=np.arange(
                            c_y_size,
                            total_y_size,
                            dtype=np.min_scalar_type(total_y_size),
                        ),
                        y=p.y,
                        default_indices=True,
                    )
                )
                combined_lines.append(
                    LineData(
                        line_params=c.line_params,
                        x=_append(
                            c.x,
                            np.arange(
                                c_y_size,
                                total_y_size,
                                dtype=np.min_scalar_type(total_y_size),
                            ),
                        ),
                        y=np.append(c.y, p.y),
                        default_indices=True,
                    )
                )
            if current_lines_len > new_points_len:
                combined_lines += current_lines[new_points_len:]

            elif new_points_len > current_lines_len:
                extra_indexed_lines = [
                    LineData(
                        line_params=p.line_params,
                        x=np.arange(p.y.size, dtype=np.min_scalar_type(p.y.size)),
                        y=p.y,
                        default_indices=True,
                    )
                    for p in new_points[current_lines_len:]
                ]
                combined_lines += extra_indexed_lines
                indexed_lines += extra_indexed_lines

            new_points_msg.al_data = indexed_lines

        return (
            MultiLineDataMessage(
                ml_data=combined_lines, plot_config=ml_data_msg.plot_config
            ),
            new_points_msg,
        )

    async def update_plot_states_with_message(
        self, msg: DataMessage | SelectionMessage | BatonMessage, plot_id: str
    ) -> bytes | None:
        """Indexes and combines line messages if needed and updates plot states

        Parameters
        ----------
        msg : DataMessage | SelectionMessage
            A message for plot states.
        """
        plot_state = self.plot_states[plot_id]
        new_msg = None
        async with plot_state.lock:
            match msg:
                case BatonMessage():
                    plot_state.current_baton = msg.baton
                    new_msg = plot_state.new_baton_message = ws_pack(msg)

                case SelectionsMessage():
                    plot_state.current_selections = msg.set_selections
                    new_msg = plot_state.new_selections_message = ws_pack(msg)

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
                        SelectionsMessage(set_selections=current)
                    )
                    new_msg = ws_pack(msg)

                case ClientLineParametersMessage():
                    msg = plot_state.current_data = (
                        self.convert_line_params_to_data_message(plot_id, msg)
                    )
                    new_msg = plot_state.new_data_message = ws_pack(msg)

                case ClientScatterParametersMessage():
                    msg = plot_state.current_data = (
                        self.convert_scatter_params_to_data_message(plot_id, msg)
                    )
                    new_msg = plot_state.new_data_message = ws_pack(msg)

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
                        SelectionsMessage(set_selections=current)
                    )
                    new_msg = ws_pack(msg)

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
                    new_msg = ws_pack(msg)

                case DataMessage():
                    if isinstance(msg, MultiLineDataMessage):
                        msg = add_indices(msg)
                        add_colour_to_lines(msg.ml_data)
                    elif isinstance(msg, ImageDataMessage) and isinstance(
                        msg.im_data, HeatmapData
                    ):
                        if msg.im_data.colour_map == ColourMap.Last:
                            msg.im_data.colour_map = self.last_colour_maps[plot_id]
                        elif msg.im_data.colour_map:
                            self.last_colour_maps[plot_id] = msg.im_data.colour_map
                        else:
                            msg.im_data.colour_map = self.default_colour_map
                    plot_state.current_data = msg
                    new_msg = plot_state.new_data_message = ws_pack(msg)

        return new_msg

    async def prepare_data(
        self, msg: PlotMessage, omit_client: PlotClient | None = None
    ):
        """Processes PlotMessage into a client message and adds that to any client

        Parameters
        ----------
        msg : PlotMessage
            A client message for processing.
        """
        plot_id = msg.plot_id
        try:
            processed_msg = self.processor.process(msg)
        except Exception:
            logger.error("Could not process message: %s", msg, exc_info=True)
            return

        new_msg = await self.update_plot_states_with_message(processed_msg, plot_id)
        if new_msg is not None:
            for c in self._clients[plot_id]:
                if c is not omit_client:
                    await c.add_message(new_msg)

    def clients_with_uuid(self, uuid: str):
        return (c for cl in self._clients.values() for c in cl if c.uuid == uuid)


async def handle_client(server: PlotServer, plot_id: str, socket: WebSocket, uuid: str):
    client = await server.add_client(plot_id, socket, uuid)
    initialize = True
    try:
        while True:
            update_all = False
            message = await socket.receive()
            if message["type"] == "websocket.disconnect":
                logger.debug("Websocket disconnected: %s:%s", client.name, client.uuid)
                update_all = await server.remove_client(plot_id, client)
                break

            message = ws_unpack(message["bytes"])
            received_message = PlotMessage.model_validate(message)
            if received_message.type == MsgType.status:
                if received_message.params == StatusType.ready:
                    if initialize:
                        await client.send_next_message()
                        await client.send_next_message()  # in case there are selections

                        initialize = False
                    else:
                        server.client_status = StatusType.ready
                    update_all = True
                elif received_message.params == StatusType.closing:
                    logger.info("Websocket closing for %s:%s", client.name, client.uuid)
                    update_all = await server.remove_client(plot_id, client)
                    break

            elif received_message.type == MsgType.baton_request:
                await server.send_baton_approval_request(received_message)

            elif received_message.type == MsgType.baton_approval:
                if uuid == server.baton:
                    update_all = await server.take_baton(received_message)
                else:
                    logger.warning("Baton approval received from non-baton holder")

            else:  # should process events from client (if that client is in control)
                omit = None
                mtype = received_message.type

                is_valid = True
                if (
                    mtype == MsgType.client_new_selection
                    or mtype == MsgType.client_update_selection
                    or mtype == MsgType.clear_selection_data
                    or mtype == MsgType.client_update_line_parameters
                ):
                    logger.debug(
                        "Got from %s (%s): %s", plot_id, mtype, received_message.params
                    )
                    is_valid = client.uuid == server.baton
                    if is_valid:
                        omit = client  # omit originating client
                    else:
                        logger.error(
                            "Selection change requested from client %s without baton",
                            client.uuid,
                        )

                if is_valid:
                    await server.prepare_data(received_message, omit_client=omit)
                    update_all = True

            if update_all:
                await server.send_next_message()

    except WebSocketDisconnect:
        logger.error(
            "Websocket disconnected: %s:%s", client.name, client.uuid, exc_info=True
        )
        update_all = await server.remove_client(plot_id, client)

    if update_all:
        await server.send_next_message()


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

    add_colour_to_lines(msg.al_data)

    return MultiLineDataMessage(
        plot_config=msg.plot_config,
        ml_data=msg.al_data,
    )
