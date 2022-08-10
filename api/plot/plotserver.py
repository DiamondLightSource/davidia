from __future__ import annotations

import msgpack

from typing import Any

from plot.processor import Processor

class PlotServer:
    def __init__(self, processor: Processor):
        self.ws_list = []
        self.processor = processor
        self.react_status = 'busy'
        self.response_list = []
        self.initialise_data()

    def initialise_data(self):
        for data in self.processor.initial_data:
            msg = msgpack.packb(data, use_bin_type=True)
            self.response_list.append(msg)

    async def send_next_message(self):
        self.react_status = 'ready'
        if len(self.response_list) > 0 and len(self.ws_list) > 0:
            assert(self.ws_list[0])
            assert(self.response_list[0])
            await self.ws_list[0].send_text(self.response_list.pop(0))
            self.react_status = 'busy'

    def prepare_data(self, message: Any):
        data = self.processor.process(message)
        msg = msgpack.packb(data, use_bin_type=True)
        self.response_list.append(msg)
