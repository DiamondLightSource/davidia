import numpy as np
import random
import sigfig
import scipy.integrate as integrate
from api.processor import Processor


class ExampleProcessor(Processor):
    def __init__(self):
        self.app_amp = 1
        self.app_func = "Sine"
        self.cols = 40
        self.data = {}
        self.dtype = np.dtype(float)
        self.rows = 20
        self.x_shape = [721]
        self.y_shape = self.x_shape
        self.initial_data = self.calculate_initial_data()

    def process(self, message):
        assert(message["type"] == "data_request")
        if message["request_type" == "update_request"]:
            return self.prepare_update_request(message)
        if message["request_type" == "integral_request"]:
            return self.prepare_integral_request(message)
        if message["request_type" == "profile_request"]:
            return self.prepare_profile_request(message)
        if message["request_type" == "update_request"]:
            return self.prepare_new_line_request(message)

    def prepare_profile_request(self, message):
        y_start = message["yStart"]
        y_end = message["yEnd"]
        x_start = message["xStart"]
        x_end = message["xEnd"]

        try:
            axis = int(axis)
            if float(x_start) < float(x_end):
                x_0 = int(float(x_start))
                x_1 = int(float(x_end))
            else:
                x_1 = int(float(x_start))
                x_0 = int(float(x_end))
            if float(y_start) < float(y_end):
                y_0 = int(float(y_start))
                y_1 = int(float(y_end))
            else:
                y_1 = int(float(y_start))
                y_0 = int(float(y_end))

        except Exception:
            raise TypeError(f"{axis}, {x_start}, {x_end}, {y_start} and {y_end} cannot be converted to int")

        z_vals = np.reshape(np.array([x%self.cols for x in range(self.rows*self.cols)]), (self.cols, self.rows))
        sliced_z = z_vals[y_0:y_1, x_0:x_1]
        sum = np.sum(sliced_z, axis).tolist()
        if axis == 0:
            length = x_1 - x_0
            indices = np.array([(x_0 + i) for i in range(length)]).tolist()
        elif axis == 1:
            length = y_1 - y_0
            indices = np.array([(y_0 + i) for i in range(length)]).tolist()
        else:
            raise ValueError(f"axis must be 0 or 1, not {axis}")

        profile_data = {
            "type": "profile",
            "data":
                {
                    "x": indices,
                    "y": sum
                }
        }
        return profile_data

    def prepare_integral_request(self, message):
        func = message["function"]
        amp = message["amplitude"]
        x_start = message["xStart"]
        x_end = message["xEnd"]
        try:
            if float(x_start) < float(x_end):
                x_0 = float(x_start)
                x_1 = float(x_end)
            else:
                x_1 = float(x_start)
                x_0 = float(x_end)
        except Exception:
            raise TypeError(f"{x_start} and {x_end} must be type float")

        try:
            amplitude = int(amp)
        except Exception:
            raise TypeError(f"{amp} must be type int, not type {type(amp)}")

        if func == "Sine":
            result = integrate.quad(lambda x: amplitude*np.sin(np.radians(x)), x_0, x_1)
        elif func == "Cosine":
            result = integrate.quad(lambda x: amplitude*np.cos(np.radians(x)), x_0, x_1)
        else:
            raise ValueError(f"func parameter {func} must be Sine or Cosine")
        integral = round(result[0], 2)
        error = sigfig.round(result[1], sigfigs=4)

        integral_data = {
            "type": "integral",
            "data":
                {
                    "integral": integral,
                    "error": error
                }
        }
        return integral_data

    def prepare_new_line_request(self, message):
        func = message["function"]
        amp = message["amplitude"]
        if func == "Sine" or func == "Cosine":
            try:
                amplitude = int(amp)
            except Exception:
                raise TypeError(f"{amp} must be type int, not type {type(amp)}")
            data = self.prepare_line_data(amplitude, func)
            return data
        else:
            raise ValueError(f"{func} must be 'Sine' or 'Cosine'")

    def prepare_update_request(self, message):
        func = message["function"]
        amp = message["amplitude"]
        if func == "Sine" or func == "Cosine":
            try:
                amplitude = int(amp)
            except Exception:
                raise TypeError(f"{amp} must be type int, not type {type(amp)}")
            data = self.prepare_line_data(amplitude, func)
            return data
        else:
            raise ValueError(f"{func} must be 'Sine' or 'Cosine'")

    def prepare_line_data(self, amp, func):
        self.calculate_xy(amp, func)
        line_data = {
            "type": "line data",
            "data":
                {
                    "id": "line_0",
                    "colour": "yellow",
                    "x": self.data[f"{func}{amp}"]["x"],
                    "y": self.data[f"{func}{amp}"]["y"]
                }
        }
        return line_data


    def calculate_initial_data(self):
        x = (np.array([i - 360 for i in range(self.x_shape[0])], dtype=self.dtype)).tolist()
        y = (np.sin(np.radians(x))).tolist()
        self.data[f"{self.app_func}{self.app_amp}"] = {"x": x, "y": y}
        print(f"data dict updated: {self.data.keys()}")

        line_data = {
            "type": "line data",
            "data": 
                {
                    "id": "line_0",
                    "colour": "yellow",
                    "x": self.data["Sine1"]["x"],
                    "y": self.data["Sine1"]["y"]
                }
        }

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
        heatmap_data = {
            "type": "heatmap data",
            "data":
                {
                    "rows": self.rows,
                    "columns": self.cols,
                    "values": [x%self.cols for x in range(self.rows*self.cols)],
                }
        }

        return [line_data, multi_data, heatmap_data]
