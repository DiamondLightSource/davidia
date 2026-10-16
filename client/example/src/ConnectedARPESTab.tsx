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
  const plots = ['plot_0', 'dep_plot_0_A', 'dep_plot_0_B'];
  const [srcConfig, setSrcConfig] = useState<SourceConfig>({
    plugin: 'ExampleSourcePlugin',
    shape: [128, 64],
    period: 2.5,
    activate: true,
  });
  const evtConfig: EventConfig = {
    plugin: 'BoxProfilePlugin',
    x: true,
    y: true,
  };
  return (
    <>
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
      </div>
      <button
        onClick={() =>
          setSrcConfig((prevState) => ({
            ...prevState,
            activate: !prevState.activate,
          }))
        }
      >
        {srcConfig.activate ? 'Disable' : 'Enable'} source
      </button>
      <div
        style={{
          display: 'grid',
          height: '49vh',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        <ConnectedPlot
          plotId={plots[1]}
          uuid={uuid}
          hostname={host}
          port={port}
          depends_on={plots[0]}
        />
        <ConnectedPlot
          plotId={plots[2]}
          uuid={uuid}
          hostname={host}
          port={port}
          depends_on={plots[0]}
        />
      </div>
      <ToastContainer closeOnClick draggable />
    </>
  );
}
