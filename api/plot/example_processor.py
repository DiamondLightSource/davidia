from __future__ import annotations

import random

from typing import Dict, List

from plot.processor import Processor
from plot.custom_types import LineParams, MsgType, PlotMessage


class ExampleProcessor(Processor):
    """
    A Processor class used to convert new data request messages to data

    ...

    Attributes
    ----------
    initial_data: List
        A list of initial data

    Methods
    -------
    process(message: PlotMessage) -> Dict
        Converts a PlotMessage to processed data
    prepare_aux_line_request(params: LineParams) -> Dict:
        Converts parameters for a new line to processed new line data
    calculate_initial_data(self) -> List[Dict]
        Generates initial data.
    """

    def __init__(self):
        self.initial_data = self.calculate_initial_data()

    def process(self, message: PlotMessage) -> Dict:
        """Converts a PlotMessage to processed data

        Parameters
        ----------
        message : PlotMessage
            The message for processing

        Returns
        -------
        data: Dict
            The processed data

        Raises
        ------
        ValueError
            If message type is unexpected.
        """
        if message.type == MsgType.aux_line_data:
            params = LineParams(**message.params)
            return self.prepare_aux_line_request(message.plot_id, params)
        else:
            # not covered by tests
            raise ValueError(f"message type not in list: {message['type']}")

    def prepare_aux_line_request(self, plot_id: str, params: LineParams) -> Dict:
        """Converts parameters for a new line to processed new line data

        Parameters
        ----------
        params : LineParams
            Line data parameters to be processed to new line data

        Returns
        -------
        new_line_data: Dict
            New line data.
        """

        new_line_data = {
            "type": "new line data",
            "plot_id": plot_id,
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
        """Generates initial data

        Returns
        -------
        multi_data: List[Dict]
            The initial data generated.
        """

        multi_data_0 = {
            "type": "multiline data",
            "plot_id": "plot_0",
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
                }
            ]
        }

        multi_data_1 = {
            "type": "multiline data",
            "plot_id": "plot_1",
            "data": [
                {
                    "id": "line_0",
                    "colour": "black",
                    "x": [0, 1, 2, 3, 4, 5],
                    "y": [4, 8, 12, 16, 20]
                },
                {
                    "id": "line_1",
                    "colour": "pink",
                    "x": [3, 5, 7, 9],
                    "y": [-1, -5, 5, 10, 5]
                },
                {
                    "id": "line_2",
                    "colour": "purple",
                    "x": [0, 1, 2, 3, 4],
                    "y": [0, 20, 30, 10, 10]
                }
            ]
        }

        return [multi_data_0, multi_data_1]
