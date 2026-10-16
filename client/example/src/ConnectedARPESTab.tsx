import { useMemo, useState } from 'react';
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

  // const integrationConfig: EventConfig = {
  //   plugin: 'AxisIntegrationPlugin',
  //   output_plot_id: plots[1],
  //   integration_axis: 0,
  //   selection_dimension: 0,
  //   reduction: 'sum',
  // };

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
    selection_dimension: 0,
    reduction: 'sum',
    transpose: true,
  };

  const polarIntegrationConfig: EventConfig = {
    plugin: 'AxisIntegrationPlugin',
    source_plot_id: plots[0],
    output_plot_id: plots[1],
    integration_axis: 0,
    selection_dimension: 0,
    reduction: 'sum',
  };

  const polarSelection = useMemo(() => {
    const selection = new AxialSelection([40, 0], 20, 0);
    selection.name = 'polar-angle-selection';
    return selection;
  }, []);
  const plot1Selections = useMemo(() => {
    const energySelection = new AxialSelection([400, 0], 100, 0);
    energySelection.name = 'energy-selection';
    const angleSelection = new AxialSelection([0, 300], 100, 1);
    angleSelection.name = 'angle-selection';
    return [energySelection, angleSelection];
  }, []);

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
          initialSelections={[polarSelection]}
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
          initialSelections={plot1Selections}
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
