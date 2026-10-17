import { useState } from 'react';
import { ToastContainer } from 'react-toastify';

import {
  AxialSelection,
  ConnectedPlot,
  EventConfig,
  SourceConfig,
} from '@diamondlightsource/davidia';

interface ConnectedTabProps {
  uuid: string;
  host: string;
  port: string;
}

export function ConnectedARPESTab({ uuid, host, port }: ConnectedTabProps) {
  const plots = [
    'plot_0',
    'plot_1',
    'dep_plot_1_vertical',
    'dep_plot_1_horizontal',
  ];

  const [srcConfig, setSrcConfig] = useState<SourceConfig>({
    plugin: 'NXSImageSourcePlugin',
    path: 'demos/i05-1-62874.nxs',
    dataset: 'entry1/analyser/data',
    activate: true,
  });

  const profileConfig: EventConfig = {
    plugin: 'AxisProfilePlugin',
    vertical_plot_id: plots[2],
    horizontal_plot_id: plots[3],
  };

  const energyIntegrationConfig: EventConfig = {
    plugin: 'AxisIntegrationPlugin',
    source_plot_id: plots[0],
    output_plot_id: plots[0],
    integration_axis: 2,
    selection_dimension: 1,
    reduction: 'mean',
    transpose: true,
  };

  const polarIntegrationConfig: EventConfig = {
    plugin: 'AxisIntegrationPlugin',
    source_plot_id: plots[0],
    output_plot_id: plots[1],
    integration_axis: 0,
    selection_dimension: 0,
    reduction: 'mean',
    transpose: true,
    reverse_output_axis: 0,
  };

  function centredSelection(
    values: { data: ArrayLike<number> },
    dimension: number,
    name: string,
    colour: string
  ) {
    const data = values.data;

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < data.length; i++) {
      const value = data[i];

      if (Number.isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }

    const range = max - min;
    const length = range * 0.1;
    const start = min + (range - length) / 2;

    const selection = new AxialSelection(
      dimension === 0 ? [start, 0] : [0, start],
      length,
      dimension
    );

    selection.name = name;
    selection.colour = colour;

    return selection;
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          height: '32vh',
          gridTemplateColumns: '1fr',
        }}
      >
        <ConnectedPlot
          plotId={plots[0]}
          uuid={uuid}
          hostname={host}
          port={port}
          source={srcConfig}
          events={[polarIntegrationConfig]}
          initialSelections={(config) => {
            if (!config.xValues) {
              return [];
            }

            return [
              centredSelection(
                config.xValues,
                0,
                'polar-angle-selection',
                '#cc79a7'
              ),
            ];
          }}
        />
      </div>

      <button
        onClick={() =>
          setSrcConfig((previous) => ({
            ...previous,
            activate: !previous.activate,
          }))
        }
      >
        {srcConfig.activate ? 'Disable' : 'Enable'} source
      </button>

      <div
        style={{
          display: 'grid',
          height: '32vh',
          gridTemplateColumns: '1fr',
        }}
      >
        <ConnectedPlot
          plotId={plots[1]}
          uuid={uuid}
          hostname={host}
          port={port}
          depends_on={plots[0]}
          events={[energyIntegrationConfig, profileConfig]}
          initialSelections={(config) => {
            if (!config.xValues || !config.yValues) {
              return [];
            }

            return [
              centredSelection(
                config.yValues,
                1,
                'energy-selection',
                '#009e73'
              ),
              centredSelection(config.xValues, 0, 'angle-selection', '#e69d00'),
            ];
          }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          height: '32vh',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        <ConnectedPlot
          plotId={plots[2]}
          uuid={uuid}
          hostname={host}
          port={port}
          depends_on={plots[1]}
        />

        <ConnectedPlot
          plotId={plots[3]}
          uuid={uuid}
          hostname={host}
          port={port}
          depends_on={plots[1]}
        />
      </div>

      <ToastContainer closeOnClick draggable />
    </>
  );
}
