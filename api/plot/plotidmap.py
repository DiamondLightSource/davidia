from __future__ import annotations

import logging
from fastapi import WebSocket
from queue import Queue
from typing import Dict, List

from collections import defaultdict


class PlotIdMap:
    """
    A class used to map the relation between websockets and their queues and plot ids

    ...

    Attributes
    ----------
    _plot_id_to_websockets : defaultdict[str, List[WebSocket]]
        The plot_ids and their associated websockets
    _websocket_to_queue : Dict[WebSocket, Queue]
        Websockets and their queues

    Methods
    -------
    add_ws_for_plot_id(plot_id: str, websocket: WebSocket, queue: Queue)
        Adds relations between plot_id, websocket, queue to _plot_id_to_websockets and _websocket_to_queue
    remove_websocket(plot_id: str, websocket: WebSocket)
        Removes websocket from _plot_id_to_websockets and _websocket_to_queue
    websockets_for_plot_id(plot_id: str)
        Returns a list of websockets for a given plot_id
    queue_for_websocket(websocket: WebSocket)
        Returns the queue for a given websocket
    queues_for_plot_id(plot_id: str)
        Returns a list of queues for a given plot_id
    add_msg_to_queues(plot_id: str, msg)
        Adds messages to queues for a given plot_id
    websockets_available()
        Returns if any websockets are listed in PlotIdMap.
    """

    def __init__(self):
        self._plot_id_to_websockets: defaultdict[str, List[WebSocket]] = defaultdict(list)
        self._websocket_to_queue: Dict[WebSocket, Queue] = {}

    def get_plot_ids(self) -> List[str]:
        return list(self._plot_id_to_websockets.keys())

    def add_ws_for_plot_id(self, plot_id: str, websocket: WebSocket, queue: Queue):
        self._plot_id_to_websockets[plot_id].append(websocket)
        self._websocket_to_queue[websocket] = queue

    def remove_websocket(self, plot_id: str, websocket: WebSocket):
        del self._websocket_to_queue[WebSocket]
        self._plot_id_to_websockets[plot_id] = [x for x in self._plot_id_to_websockets[plot_id] if x != websocket]

    def websockets_for_plot_id(self, plot_id: str) -> List[WebSocket]:
        return self._plot_id_to_websockets[plot_id]

    def queue_for_websocket(self, websocket: WebSocket) -> Queue:
        return self._websocket_to_queue[websocket]

    def queues_for_plot_id(self, plot_id: str) -> List[Queue]:
        if plot_id in self._plot_id_to_websockets.keys():
            websockets = self._plot_id_to_websockets[plot_id]
            return [self.queue_for_websocket(ws) for ws in websockets]
        return []

    def add_msg_to_queues(self, plot_id: str, msg):
        if plot_id in self._plot_id_to_websockets.keys():
            for q in self.queues_for_plot_id(plot_id):
                q.put(msg)
        else:
            logging.debug(f"No websockets for plot_id {plot_id}\n")

    @property
    def websockets_available(self) -> bool:
        return bool(self._websocket_to_queue)
