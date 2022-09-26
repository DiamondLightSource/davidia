import datetime
import msgpack
import pytest

from plot.custom_types import PlotMessage, StatusType
from plot.plotserver import PlotServer
from plot.processor import Processor


def test_initialise_plotserver():
    processor = Processor()
    ps = PlotServer(processor)
    assert ps.ws_list == []
    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert ps.message_history == []


def test_initialise_plotserver_with_data():
    data = {
            "type": "multiline data",
            "plot_id": "0",
            "data": {
                    "id": "line_a",
                    "colour": "red",
                    "x": [5, 6, 7, 8, 9],
                    "y": [4, 7, 8, 3, 2]
                }
        }
    msgpack_data = msgpack.packb(data, use_bin_type=True)

    processor = Processor()
    processor.initial_data.append(data)
    ps = PlotServer(processor)

    assert ps.ws_list == []
    assert ps.processor == processor
    assert ps.client_status == StatusType.busy
    assert len(ps.message_history) == 1
    assert ps.message_history == [msgpack_data]
