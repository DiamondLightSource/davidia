from __future__ import annotations

import json
import requests

from custom_types import PlotMessage


def request_data() -> requests.Response:
    aux_line = PlotMessage(plot_id="plot_0", type="aux_line_data", params={"id": "new_line", "colour": "orange", "x": [5, 6, 7, 8, 9], "y": [20, 30, 40, 50, 60]})
    aux_line_as_json = json.dumps(aux_line.__dict__)
    response = requests.post('http://localhost:8000/push_data', data=aux_line_as_json, headers={'Content-type': 'application/json'}, auth=('user', 'pass'))
    print(f"response is {response}")
    return response

if __name__ == '__main__':
    request_data()
