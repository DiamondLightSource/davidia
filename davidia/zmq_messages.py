from bluesky.callbacks.zmq import Proxy, RemoteDispatcher
from davidia.plot import line

APPEND_DATA = False

def msg_cb(*args):
    if args[0] == "event":
        global APPEND_DATA
        line(
            x=[args[1]['data']['motor']],
            y=[args[1]['data']['det']],
            append = APPEND_DATA
        )
        APPEND_DATA = True


def run_dispatcher(host):
    d = RemoteDispatcher(f'localhost:{host}')
    d.subscribe(msg_cb)
    d.start()


def start_proxy(host0, host1):
    proxy = Proxy(host0, host1)
    proxy.start()
