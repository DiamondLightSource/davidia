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

## Plugin documentation

Davidia has a plugin framework for its plot server. Currently, there are two types of plugins: `source` and `event`. A source plugin provides a source of plot messages to push to clients. A event plugin responds to events occurring in the plot server.

To contribute a plugin, a package must declare it in an entry point as follows:

```toml
[project.entry-points."davidia.plugins"]
mypluginA = "example.plugin:ExampleAPlugin"
```

All plugins are configured via `ConnectedPlot`s on any client (that holds the baton). Each `ConnectedPlot` can have a single `source: SourceConfig` property and a `events: EventConfig[]` array property. Each configuration must specify the plugin name and provide any parameters. Additionally a source configuration has an `activate` parameter to start and stop the source.

A new instance of a plugin is created for the connected plot when the plot server receives a `ClientConfigMessage` if an instance with the same parameters does not exist (for source plugins, the `activate` parameter is ignored in this comparison).

All plugins are subclasses of `DavidiaPlugin` from `davidia.server.plugins` and specify a `name` and implements a `description` method.

### Source plugins
A source plugin subclasses `SourcePlugin` from `davidia.server.plugins` has two extra methods to implement: `has_next` is an asynchronous method and returns true when data is available - it can return false when the source has finished providing data; `next_data` returns an optional plot message to push to the server. 

### Event plugins
An event plugin subclasses `EventPlugin` from `davidia.server.plugins` has a single extra method to implement: `process` is a method to create and return a `TaskResult`.

Selection events should be handled by subclasses of `SelectionEventPlugin` from `davidia.server.plugins` which defines `selection_type` and implements `process`. Furthermore, subclasses of `DavidiaProfilePlugin` from `davidia.server.plugins_libs` can be used for profiling of 2D data by implementing `profile`.

### Task manager
The plot server has a `PluginTaskManager` that allows selection and data changes to add new tasks to process events, and this also handles the results from those tasks. 

