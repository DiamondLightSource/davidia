import json
import requests


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

r = requests.get('http://localhost:5000/push_data', params={'data':aux_line_data}, headers={'Content-type': 'application/json'}, auth=('user', 'pass'))
