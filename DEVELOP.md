# Davidia development

To get started with Davidia development, create a conda environment called `davidia`

### `conda env create --file environment.yml`

Activate it:

### `conda activate davidia`

Install Typescript dependencies (read pnpm's [installation guide](https://pnpm.io/installation), if needed)

### `pnpm install`

Build web client

### `pnpm build`

## Quick start

To run everything quickly for a demo

### `PYTHONPATH=server python -c 'from demos.simple import start_and_run_all_demos; start_and_run_all_demos()'`

## Running Python plot server

From the top level of the repository, you can run:

### `cd server && uvicorn --port 8000 --factory davidia.main:create_app` or `PYTHONPATH=server python -m davidia.main -P 8000 -c`

Open [localhost:8000](http://localhost:8000) to view it in the browser. Now test plot server with,

### `PYTHONPATH=server python server/demos/simple.py`

## Benchmarking the plot client

Set the environment variable `DVD_BENCHMARK` as `on` or add a `-b` argument:

### `cd server && DVD_BENCHMARK=on uvicorn --port 8000 --factory davidia.main:create_app`
### `DVD_BENCHMARK=on PYTHONPATH=server python -m davidia.main -P 8000 -c`
### `PYTHONPATH=server python -m davidia.main -P 8000 -c -b`

Run the script to trigger benchmarks:

### `PYTHONPATH=server python server/demos/benchmark.py`

See its builtin help using the `-h` argument.

## Storybook

View the Storybook [here](https://diamondlightsource.github.io/davidia).

To build and run the Storybook locally:

### `pnpm build:storybook`
### `pnpm start:storybook`

## Documentation

View the documentation [here](https://diamondlightsource.github.io/davidia/typedocs/index.html).

## API documentation

View the API documentation [here](https://diamondlightsource.github.io/davidia/?path=/docs/api-documentation--docs).
