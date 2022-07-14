import json
import msgpack
import numpy as np
import random
import scipy.integrate as integrate
import sigfig
from flask import Flask
from flask_cors import CORS #comment this on deployment
from flask_sock import Sock
from api.processor import Processor


class PlotServer:
    def __init__(self, processor):
        self.ws_list = []
        self.processor = processor
        self.react_status = 'busy'
        self.response_list = []
        self.initialise_data()

    def initialise_data(self):
        for data in self.processor.initial_data:
            msg = msgpack.packb(data, use_bin_type=True)
            self.response_list.append(msg)

    def send_next_message(self):
        self.react_status = 'ready'
        if len(self.response_list) > 0:
            self.ws_list[0].send(self.response_list.pop(0))
            self.react_status = 'busy'

    def prepare_data(self, message):
        data = self.processor.process(message)
        msg = msgpack.packb(data, use_bin_type=True)
        self.response_list.append(msg)
