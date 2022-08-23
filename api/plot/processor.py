from __future__ import annotations

from typing import Dict, List

from plot.custom_types import PlotMessage


class Processor:
    """
    A class used to convert messages to data

    ...

    Attributes
    ----------
    initial_data: List
        A list of initial data

    Methods
    -------
    process(message: PlotMessage)
        Converts a PlotMessage to data.

    """

    def __init__(self):
        self.initial_data: List = []

    def process(self, message: PlotMessage) -> Dict:
        """Converts a PlotMessage to data

        Parameters
        ----------
        message : PlotMessage
            The message for processing

        Returns
        -------
        data: Dict
            A dictionary of the processed data.

        """

        data = {}
        return data
