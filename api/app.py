import json
import msgpack
from flask import Flask, request
from flask_cors import CORS #comment this on deployment
from flask_sock import Sock
from api.example_processor import ExampleProcessor
from api.plotserver import PlotServer

app = Flask(__name__, static_url_path='', static_folder='frontend/build')
CORS(app) #comment this on deployment
ws = Sock(app)
print(f"socket started as {ws}")


ps = PlotServer(ExampleProcessor())
@ws.route('/status')
def status(my_socket):
    ps.ws_list.append(my_socket)
    ps.initialise_data()

    while True:
        print(f"ws is {my_socket}")
        message = my_socket.receive()
        message = json.loads(message)
        if message["type"] == 'status':
            if message["text"] == 'ready':
                print("sending next message")
                ps.send_next_message()

        elif message["type"] == 'data_request':
            ps.prepare_data(message)
            ps.send_next_message()


@app.route("/push_data", methods = ['GET', 'POST'], defaults={'path':''})
def get_data(path):
    data = json.loads(request.args.get('data'))
    ps.prepare_data(data)
    ps.send_next_message()
    return "data sent"


if __name__ == "__main__":
    app.run()
