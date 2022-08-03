import random
from plot.processor import Processor


class ExampleProcessor(Processor):
    def __init__(self):
        self.initial_data = self.calculate_initial_data()

    def process(self, message):
        assert(message["type"] == "data_request")
        if message["request_type"] == "new_line_request":
            return self.prepare_new_line_request(message)
        if message["request_type"] == "aux_line_data":
            return self.prepare_aux_line_request(message)
        else:
            print(f"message type not in list: {message['request_type']}")


    def prepare_new_line_request(self, message):
        colours = ["red", "blue", "green", "black", "darkred", "indigo", "darkorange", "darkblue"]
        try:
            line_id = int(message['line_id'])
            colour = colours[line_id%8]
        except Exception:
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

    def prepare_aux_line_request(self, message):
        line_data = message['data']
        new_line_data = {
            "type": "new line data",
            "data":
                {
                    "id": f"{line_data['id']}_{random.randrange(1000)}",
                    "colour": line_data['colour'],
                    "x": line_data['x'],
                    "y": line_data['y']
                }
        }
        return new_line_data


    def calculate_initial_data(self):

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
