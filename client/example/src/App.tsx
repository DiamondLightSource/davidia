import React from 'react';
import { ToastContainer } from 'react-toastify';

import 'react-tabs/style/react-tabs.css';
import './App.css';

import ndarray from 'ndarray';

import {
  AnyPlot,
  Domain,
  LineParams,
  LinePlot,
  LinePlotProps,
  ScaleType,
  ConnectedPlot,
  NDT,
  HeatmapPlotProps,
  HeatmapPlot,
  GlyphType,
  SelectionBase,
  SelectionsEventListener,
  SelectionsEventType,
} from '@diamondlightsource/davidia';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

interface AppMainProps {
  instance: number;
}

interface AppMainStates {
  plots: string[];
}

function SelectionHeatmapPlot(props: HeatmapPlotProps) {
  const selectionsListener: SelectionsEventListener = (
    type: SelectionsEventType,
    dragging: boolean,
    selection?: SelectionBase
  ) => {
    console.log(
      'Selection',
      type,
      ':',
      selection ? selection.id : 'all',
      dragging ? 'being dragged' : ''
    );
  };

  const hmProps = { ...props, selectionsListener };
  return <HeatmapPlot {...hmProps} />;
}

class AppMain extends React.Component<AppMainProps, AppMainStates> {
  uuid: string;
  constructor(props: AppMainProps) {
    super(props);
    this.state = {
      plots: ['plot_0', 'plot_1'],
    };
    this.uuid = crypto.randomUUID().slice(-8);
  }

  render() {
    console.log('new App created with uuid: ', this.uuid);

    const x = ndarray(new Float32Array([1, 2, 3, 4, 6, 10])) as NDT;
    const y = ndarray(new Float32Array([1, 4, 9, 16, 36, 100])) as NDT;
    const lineProps = {
      plotConfig: {
        title: 'Sample Line Plot',
        xLabel: 'x-axis',
        yLabel: 'y-axis',
      },
      lineData: [
        {
          key: 'squares',
          lineParams: {
            colour: 'purple',
            pointSize: 6,
            lineOn: true,
            glyphType: GlyphType.Square,
          } as LineParams,
          x,
          xDomain: [1, 10],
          y,
          yDomain: [1, 100],
          defaultIndices: false,
        },
      ],
      xDomain: [0, 11],
      yDomain: [0, 101],
    } as LinePlotProps;
    const linePropsNoSelection = { ...lineProps };
    linePropsNoSelection.plotConfig = {
      ...lineProps.plotConfig,
      title: 'Sample Line Plot (no selection)',
    };

    const values = ndarray(
      new Float32Array([5, 10, 15, 1.5, 4.5, 3.5]),
      [3, 2]
    ) as NDT;
    const heatmapProps = {
      plotConfig: {
        title: 'Sample Heatmap Plot',
        xLabel: 'x-axis',
        yLabel: 'y-axis',
      },
      values,
      aspect: 'auto',
      domain: [0, 20] as Domain,
      heatmapScale: ScaleType.Linear,
      colourMap: 'Sinebow',
    } as HeatmapPlotProps;
    const heatmapPropsNoToolbar = { ...heatmapProps };
    heatmapPropsNoToolbar.plotConfig = {
      ...heatmapProps.plotConfig,
      title: 'Sample Heatmap Plot (no toolbar)',
    };

    const host = import.meta.env.VITE_WS_HOST ?? window.location.hostname;
    const port = import.meta.env.VITE_WS_PORT ?? window.location.port;
    console.log('host:', host, 'port:', port);

    return (
      <Tabs className={'outer-tabs'}>
        <TabList>
          <Tab>Connected</Tab>
          <Tab>Line</Tab>
          <Tab>Image</Tab>
          <Tab>Any</Tab>
        </TabList>
        <TabPanel>
          <div
            style={{
              display: 'grid',
              height: '49vh',
              gridTemplateColumns: '67% 33%',
            }}
          >
            <ConnectedPlot
              plotId={this.state.plots[0]}
              uuid={this.uuid}
              hostname={host}
              port={port}
            />
          </div>
          <div style={{ display: 'grid', height: '49vh' }}>
            <ConnectedPlot
              plotId={this.state.plots[1]}
              uuid={this.uuid}
              hostname={host}
              port={port}
            />
          </div>
          <ToastContainer closeOnClick draggable />
        </TabPanel>
        <TabPanel>
          <div style={{ display: 'grid', height: '80vh' }}>
            <LinePlot {...linePropsNoSelection} updateSelection={null} />
          </div>
        </TabPanel>
        <TabPanel>
          <div style={{ display: 'grid', height: '80vh' }}>
            <HeatmapPlot {...heatmapProps} />
          </div>
        </TabPanel>
        <TabPanel>
          <Tabs className={'inner-any-tabs'}>
            <TabList>
              <Tab>Line</Tab>
              <Tab>Heatmap</Tab>
              <Tab>Heatmap (selection)</Tab>
            </TabList>
            <TabPanel>
              <div style={{ display: 'grid', height: '80vh' }}>
                <AnyPlot {...lineProps} />
              </div>
            </TabPanel>
            <TabPanel>
              <div style={{ display: 'grid', height: '80vh' }}>
                <AnyPlot
                  {...heatmapPropsNoToolbar}
                  customToolbarChildren={null}
                />
              </div>
            </TabPanel>
            <TabPanel>
              <div style={{ display: 'grid', height: '80vh' }}>
                <SelectionHeatmapPlot {...heatmapProps} />
              </div>
            </TabPanel>
          </Tabs>
        </TabPanel>
      </Tabs>
    );
  }
}

export default function App() {
  return (
    <>
      <AppMain instance={0} />
    </>
  );
}
