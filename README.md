# Davidia

Davidia comprises two parts: a plot server and a set of React components including a connected plot. The plot server has a REST api that allows clients to visualize data in connected plots in React applications.

## Demonstrating Davidia

Install the Davidia Python package with

### `pip install davidia[all]`

To start the demo, run

### `dvd-demo`

This starts the plot server, opens a browser window and runs a demo script that shows different plots. Note there are host and port settings available - read the builtin help with `dvd-demo -h`

## Running Python plot server (with bundled example client)

### `dvd-server -c`

Open [localhost:8000](http://localhost:8000) to view it in the browser. Now test plot server with,

### `python -m davidia.demos`

## Benchmarking the plot client

Set the environment variable `DVD_BENCHMARK` as `on` or add a `-b` argument:

### `dvd-server -c -b`

Run the script to trigger benchmarks:

### `dvd-benchmark`

See its builtin help using the `-h` argument.

## Storybook

View the Storybook [here](https://diamondlightsource.github.io/davidia).

## Documentation

View the documentation [here](https://diamondlightsource.github.io/davidia/typedocs/index.html).

## API documentation

View the API documentation [here](https://diamondlightsource.github.io/davidia/?path=/docs/api-documentation--docs).
