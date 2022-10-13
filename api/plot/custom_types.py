from dataclasses import dataclass
from py_ts_interfaces import Interface
from typing import Any, List

from enum import IntEnum


# Use IntEnum as Enum not JSON serializable
class StatusType(IntEnum):
    '''Class for status type.'''
    ready = 1
    busy = 2


class MsgType(IntEnum):
    '''Class for message type.'''
    status = 0
    new_line_data = 1
    new_multiline_data = 2
    clear_data = 3


@dataclass(unsafe_hash=True)
class PlotMessage(Interface):
    '''
    Class for communication messages to server

    Attributes
    ----------
    plot_id : str
        ID of plot to which to send data message
    type : int
        The message type represented as a MsgType enum
    params : Any
        The message params.
    '''

    plot_id: str
    type: int
    params: Any

    def __init__(self, plot_id, type, params):
        if isinstance(type, str):
            self.type = MsgType[type]
        elif isinstance(type, int):
            self.type = MsgType(type)
        self.plot_id: str = plot_id
        self.params: Any = params


@dataclass(unsafe_hash=True)
class LineData(Interface):
    '''Class for representing a line.'''
    id: str
    colour: str
    x: List[float]
    y: List[float]
    curve_type: str


@dataclass(unsafe_hash=True)
class LineDataMessage(Interface):
    '''Class for representing a line data message.'''
    type: str
    plot_id: str
    data: LineData


@dataclass(unsafe_hash=True)
class MultiLineDataMessage(Interface):
    '''Class for representing a multiline data message.'''
    type: str
    plot_id: str
    data: List[LineData]


@dataclass(unsafe_hash=True)
class ClearPlotsMessage(Interface):
    '''Class for representing a request to clear all plots.'''
    type: str
    plot_id: str
