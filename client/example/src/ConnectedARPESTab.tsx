import { useState } from 'react';
import { ToastContainer } from 'react-toastify';

import {
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

  const integrationConfig: EventConfig = {
    plugin: 'AxisIntegrationPlugin',
    output_plot_id: plots[1],
    integration_axis: 0,
    selection_dimension: 0,
    reduction: 'sum',
  };

  const profileConfig: EventConfig = {
    plugin: 'AxisProfilePlugin',
    vertical_plot_id: plots[2],
    horizontal_plot_id: plots[3],
  };

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
          events={[integrationConfig]}
          selections={[
            {
              id: 'integration',
              name: 'integration',
              colour: '#882255',
              alpha: 0.3,
              fixed: false,
              start: [40, 0],
              length: 20,
              dimension: 0,
            },
          ]}
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
          events={[profileConfig]}
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
