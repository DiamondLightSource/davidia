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

In the `api` directory, you can run:

### `uvicorn main:app` or `python main.py`

Open [http://localhost:8000](http://localhost:8000) to view it in the browser. Now test plot server with, in `api` directory,

### `python plot/utils.py`
