import { useState } from 'react';
import { ToastContainer } from 'react-toastify';

import {
  BatonContextProvider,
  ConnectedPlot,
  type EventConfig,
  type SourceConfig,
} from '@diamondlightsource/davidia';
import { centredSelection } from './plotData';

interface ConnectedTabProps {
  uuid: string;
  host: string;
  port: string;
}

export function ARPESTab({ uuid, host, port }: ConnectedTabProps) {
  const plots = [
    'plot_0',
    'plot_1',
    'dep_plot_1_vertical',
    'dep_plot_1_horizontal',
    'dep_plot_1_intersection',
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
    reverse_output_axis: 0,
    title: 'Constant Energy Map',
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
    title: 'Detector Image',
  };

  const intersectionConfig: EventConfig = {
    plugin: 'IntersectionSumPlugin',
    output_plot_id: plots[4],
  };

  return (
    <BatonContextProvider>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 0.8fr',
          gap: '8px',
          height: '85vh',
        }}
      >
        {/* Column 1: polar angle x angle heatmap */}
        <div style={{ minWidth: 0, minHeight: 0 }}>
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
            selectionOptions={{ verticalAxis: 1 }}
          />
        </div>

        {/* Column 2: angle x energy heatmap */}
        <div style={{ minWidth: 0, minHeight: 0 }}>
          <ConnectedPlot
            plotId={plots[1]}
            uuid={uuid}
            hostname={host}
            port={port}
            depends_on={plots[0]}
            events={[
              energyIntegrationConfig,
              profileConfig,
              intersectionConfig,
            ]}
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
                centredSelection(
                  config.xValues,
                  0,
                  'angle-selection',
                  '#e69d00'
                ),
              ];
            }}
            selectionOptions={{
              verticalAxis: 1,
              horizontalAxis: 1,
            }}
          />
        </div>

        {/* Column 3: profiles */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: '1fr 1fr auto',
            gap: '8px',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {/* Energy profile */}
          <div style={{ minWidth: 0, minHeight: 0 }}>
            <ConnectedPlot
              plotId={plots[3]}
              uuid={uuid}
              hostname={host}
              port={port}
              depends_on={plots[1]}
              canEditSelections={false}
              customToolbarChildren={null}
            />
          </div>

          {/* Angle profile */}
          <div style={{ minWidth: 0, minHeight: 0 }}>
            <ConnectedPlot
              plotId={plots[2]}
              uuid={uuid}
              hostname={host}
              port={port}
              depends_on={plots[1]}
              canEditSelections={false}
              customToolbarChildren={null}
            />
          </div>

          {/* Intersection sum */}
          <div
            style={{
              minWidth: 0,
              minHeight: 0,
              border: '1px solid grey',
            }}
          >
            <ConnectedPlot
              plotId={plots[4]}
              uuid={uuid}
              hostname={host}
              port={port}
              depends_on={plots[1]}
              customToolbarChildren={null}
              canEditSelections={false}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          setSrcConfig((previous) => ({
            ...previous,
            activate: !previous.activate,
          }))
        }
      >
        {srcConfig.activate ? 'Disable' : 'Enable'} source
      </button>

      <ToastContainer closeOnClick draggable />
    </BatonContextProvider>
  );
}
