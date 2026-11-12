import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import {
  BatonContextProvider,
  ConnectedPlot,
  EventConfig,
  SourceConfig,
} from '@diamondlightsource/davidia';

interface ConnectedTabProps {
  uuid: string;
  host: string;
  port: string;
}

export function ConnectedTab({ uuid, host, port }: ConnectedTabProps) {
  const plots = ['plot_0', 'plot_1', 'dep_plot_0'];
  const [srcConfig, setSrcConfig] = useState<SourceConfig>({
    plugin: 'ExampleSourcePlugin',
    shape: [128, 64],
    period: 2.5,
    activate: true,
  });
  const evtConfig: EventConfig = {
    plugin: 'AABoxProfilePlugin',
    primary: true,
    secondary: true,
  };
  return (
    <BatonContextProvider>
      <div
        style={{
          display: 'grid',
          height: '49vh',
          gridTemplateColumns: '67% 33%',
        }}
      >
        <ConnectedPlot
          plotId={plots[0]}
          uuid={uuid}
          hostname={host}
          port={port}
          source={srcConfig}
          events={[evtConfig]}
        />
        <ConnectedPlot
          plotId={plots[2]}
          uuid={uuid}
          hostname={host}
          port={port}
          depends_on={plots[0]}
        />
      </div>
      <button
        onClick={() =>
          setSrcConfig((prevState) => {
            return {
              ...prevState,
              activate: !prevState.activate,
            };
          })
        }
      >
        {srcConfig.activate ? 'Disable' : 'Enable'} source
      </button>
      <div style={{ display: 'grid', height: '49vh' }}>
        <ConnectedPlot
          plotId={plots[1]}
          uuid={uuid}
          hostname={host}
          port={port}
        />
      </div>
      <ToastContainer closeOnClick draggable />
    </BatonContextProvider>
  );
}
