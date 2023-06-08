import threading
from bluesky import RunEngine
from bluesky.plans import scan
from bluesky.callbacks.zmq import Publisher
from ophyd.sim import det, motor
from davidia.zmq_messages import run_dispatcher, start_proxy


def run_demo(points=100):
    host0, host1 = [5577, 5578]
    proxy_thread = threading.Thread(target=start_proxy, args=(host0, host1), daemon=True)
    proxy_thread.start()

    RE = RunEngine({})
    publisher = Publisher(f'localhost:{host0}')
    RE.subscribe(publisher)

    dispatcher_thread = threading.Thread(target=run_dispatcher, args=(host1,), daemon=True)
    dispatcher_thread.start()

    RE(scan([det], motor, -10, 10, points))


if __name__ == "__main__":
    run_demo()
