from __future__ import annotations

import argparse
import datetime
import json
import requests
import sys
import time

from custom_types import PlotMessage


def plot_points(args) -> requests.Response:
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--points", type=int, default= 10, required=False)
    args = parser.parse_args(args)

    x = [i for i in range(args.points)]
    y = [j % 10  for j in x]
    time_id = datetime.datetime.now().strftime(f"%Y%m%d%H%M%S")

    aux_line = PlotMessage(type="aux_line_data", params={"id": time_id, "colour": "purple", "x": x, "y": y})
    aux_line_as_json = json.dumps(aux_line.__dict__)

    start_time = time.time()
    response = requests.get('http://localhost:8000/push_data', params={'message': aux_line_as_json}, headers={'Content-type': 'application/json'}, auth=('user', 'pass'))
    end_time = time.time()

    print(f"{args.points} plotted in {end_time - start_time}s.\n")
    return response


if __name__ == '__main__':
    plot_points(sys.argv[1:])
