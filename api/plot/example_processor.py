from __future__ import annotations

import random

from typing import Dict, List, Union

from plot.processor import Processor
from plot.custom_types import AuxLineParams, NewLineParams


class ExampleProcessor(Processor):
    def __init__(self):
        self.initial_data = self.calculate_initial_data()

    def process(self, message: Union[NewLineParams, AuxLineParams]) -> Dict:
        if message["request_type"] == "new_line_request":
            params = NewLineParams(**message)
            return self.prepare_new_line_request(params)
        if message["request_type"] == "aux_line_data":
            params = AuxLineParams(**message)
            return self.prepare_aux_line_request(params)
        else:
            # not covered by tests
            raise ValueError(f"message type not in list: {message['request_type']}")

    def prepare_new_line_request(self, params: NewLineParams) -> Dict:
        colours = ["red", "blue", "green", "black", "darkred", "indigo", "darkorange", "darkblue"]
        try:
            line_id = int(params.line_id)
            colour = colours[line_id%8]
        except Exception:
            # not covered by tests
            raise TypeError(f"line_id is not int: {line_id}")
        x_axis_start = random.randrange(-5, 5)
        new_line_data = {
            "type": "new line data",
            "data":
                {
                    "id": f"line_{line_id}",
                    "colour": colour,
                    "x": [x + x_axis_start for x in range(10)],
                    "y": [random.randrange(-20, 80) for _ in range(10)]
                }
        }
        return new_line_data

    def prepare_aux_line_request(self, params: AuxLineParams) -> Dict:
        new_line_data = {
            "type": "new line data",
            "data":
                {
                    "id": f"{params.id}_{random.randrange(1000)}",
                    "colour": params.colour,
                    "x": params.x,
                    "y": params.y
                }
        }
        return new_line_data


    def calculate_initial_data(self) -> List[Dict]:

        multi_data = {
            "type": "multiline data",
            "data": [
                {
                    "id": "line_0",
                    "colour": "red",
                    "x": [0, 1, 2, 3, 4],
                    "y": [0, 1, 4, 9, 16]
                },
                {
                    "id": "line_1",
                    "colour": "blue",
                    "x": [2, 4, 6, 8],
                    "y": [20, 10, 30, 50, 5]
                },
                {
                    "id": "line_2",
                    "colour": "green",
                    "x": [0, 1, 2, 3, 4],
                    "y": [0, 10, 40, 10, 0]
                },
                {
                    "id": "line_3",
                    "colour": "black",
                    "x": [5, 6, 7, 8, 9],
                    "y": [12, 1, 4, 9, 16]
                }
            ]
        }

        return [multi_data]
