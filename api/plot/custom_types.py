from dataclasses import dataclass
from py_ts_interfaces import Interface
from typing import Any, List


@dataclass(unsafe_hash=True)
class PlotMessage(Interface):
    '''Class for messages.'''
    type: str
    params: Any


@dataclass(unsafe_hash=True)
class StatusParams(Interface):
    '''Class for status message params.'''
    status: str


@dataclass(unsafe_hash=True)
class NewLineParams(Interface):
    '''Class for requesting new line data.'''
    line_id: str
    request_type: str = 'new_line_request'


@dataclass(unsafe_hash=True)
class AuxLineParams(Interface):
    '''Class for requesting new line from data.'''
    id: str
    colour: str
    x: List[float]
    y: List[float]
    request_type: str = 'aux_line_data'


@dataclass(unsafe_hash=True)
class LineData(Interface):
    '''Class for representing a line.'''
    id: int
    colour: str
    x: List[float]
    y: List[float]


@dataclass(unsafe_hash=True)
class LineDataMessage(Interface):
    '''Class for representing a line message.'''
    type: str
    data: LineData


@dataclass(unsafe_hash=True)
class MultiDataMessage(Interface):
    '''Class for representing a multiline message.'''
    type: str
    data: List[LineData]
