# Davidia

Create a conda environment called `davidia`

### `conda env create --file environment.yml`

Activate it:

### `conda activate davidia`

Install Typescript dependencies (read pnpm's [installation guide](https://pnpm.io/installation), if needed)

### `pnpm install`

Build web client

### `pnpm build`

## Running Python plot server

From the top level of the repository, you can run:

### `uvicorn --factory davidia.main:create_app` or `PYTHONPATH=. python davidia/main.py -c`

Open [localhost:8000/client](http://localhost:8000/client) to view it in the browser. Now test plot server with,

### `PYTHONPATH=. python davidia/demos/simple.py`

## Benchmarking the plot client

Set the environment variable `DVD_BENCHMARK` as `on` or add a `-b` argument:

### `DVD_BENCHMARK=on PYTHONPATH=. python davidia/main.py`
### `PYTHONPATH=. python davidia/main.py -c -b`

Run the script to trigger benchmarks:

### `PYTHONPATH=. python davidia/demos/benchmark.py`

See its builtin help using the `-h` argument.

## Storybook

View the Storybook [here](https://diamondlightsource.github.io/davidia).

To build and run the Storybook locally:

### `pnpm build:storybook`
### `pnpm start:storybook`
