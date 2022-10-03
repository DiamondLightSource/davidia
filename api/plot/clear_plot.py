from __future__ import annotations

import requests


def clear_data() -> requests.Response:
    response = requests.get('http://localhost:8000/clear_data/plot_0', headers={'Content-type': 'application/json'}, auth=('user', 'pass'))
    return response


if __name__ == '__main__':
    clear_data()
