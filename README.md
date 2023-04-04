# Davidia

Create a conda environment called `davidia`

### `conda env create --file environment.yml`

Activate it:

### `conda activate davidia`

Install Typescript dependencies

### `npm install`

Build web client

### `npm run build`

## Running Python plot server

From the top level of the repository, you can run:

### `uvicorn davidia.main:app` or `PYTHONPATH=. python davidia/main.py`

Open [localhost:8000/client](http://localhost:8000/client) to view it in the browser. Now test plot server with,

### `PYTHONPATH=. python davidia/demos/simple.py`

## Benchmarking the plot client

Set the environment variable `DVD_BENCHMARK` as `on`:

### `DVD_BENCHMARK=on PYTHONPATH=. python davidia/main.py`

Run the script to trigger benchmarks:

### `PYTHONPATH=. python davidia/demos/benchmark.py`

See its builtin help using the `-h` argument.

