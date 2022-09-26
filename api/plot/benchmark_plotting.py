from __future__ import annotations

import argparse
import datetime
import msgpack
import requests
import sys
import time

from custom_types import PlotMessage


def plot_points(args) -> requests.Response:
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--points", type=int, default=10, required=False)
    args = parser.parse_args(args)

    x = [i for i in range(args.points)]
    y = [j % 10  for j in x]
    time_id = datetime.datetime.now().strftime(f"%Y%m%d%H%M%S")

    aux_line = PlotMessage(type="aux_line_data", params={"plot_id":"0", "id": time_id, "colour": "purple", "x": x, "y": y})
    msg = msgpack.packb(aux_line.__dict__, use_bin_type=True)

    url = 'http://localhost:8000/push_data'
    headers = {'content-type': 'application/x-msgpack', 'accept' : 'application/x-msgpack'}

    start_time = time.time()
    response =  requests.post(url, data=msg, headers=headers, auth=('user', 'pass'))
    end_time = time.time()

    print(f"{args.points} plotted in {end_time - start_time}s.\n")
    print(f"response status code is {response.status_code}. \n")

    return response


if __name__ == '__main__':
    plot_points(sys.argv[1:])
