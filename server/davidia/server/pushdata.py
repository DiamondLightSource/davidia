import numpy as np

from davidia.plot import clear, line, set_default_plot_server

set_default_plot_server("127.0.0.1", 8000)

x = np.linspace(0, 10, 100)
y = np.sin(x)

clear("plot_0")

response = line(
    x=x,
    y=y,
    plot_id="plot_0",
    plot_config={
        "title": "My pushed line data",
        "x_label": "x",
        "y_label": "sin(x)",
        "x_scale": "linear",
        "y_scale": "linear",
    },
    line_on=True,
    colour="red",
    width=2,
)

print(response.status_code, response.text)
