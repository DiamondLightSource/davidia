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

In the `davidia` directory, you can run:

### `uvicorn davidia.main:app` or `PYTHONPATH=. python davidia/main.py`

Open [localhost:8000/client](http://localhost:8000/client) to view it in the browser. Now test plot server with, in `davidia` directory,

### `PYTHONPATH=. python davidia/demos/simple.py`
