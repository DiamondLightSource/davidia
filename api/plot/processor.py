from __future__ import annotations

from typing import Any, Dict

from plot.custom_types import PlotMessage


class Processor:
    def __init__(self):
        self.initial_data = []

    def process(self, message: PlotMessage) -> Dict:
        data = {}
        return data
