import json
import requests


def request_data():
    aux_line_data = json.dumps({
        "type": "data_request",
        "request_type": "aux_line_data",
        "data":
            {
                "id": "new_line",
                "colour": "orange",
                "x": [5, 6, 7, 8, 9],
                "y": [20, 30, 40, 50, 60]
            }
    })

    response = requests.get('http://localhost:8000/push_data', params={'data':aux_line_data}, headers={'Content-type': 'application/json'}, auth=('user', 'pass'))
    return response

if __name__ == '__main__':
    request_data()
