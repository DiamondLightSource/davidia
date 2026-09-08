import { useState } from 'react';
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
  ImagePlot,
  SourceConfig,
} from '@diamondlightsource/davidia';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

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

function generateImage(width: number, height: number) {
  const rgb = new Uint8Array(width * height * 3);

  for (let i = 0; i < rgb.length; i++) {
    rgb[i] = Math.random() * 255;
  }
  return ndarray(rgb, [height, width, 3]) as NDT;
}

function generateGreyImage(width: number, height: number, threeD = false) {
  const rgb = new Uint8Array(width * height);

  for (let i = 0; i < rgb.length; i++) {
    rgb[i] = Math.random() * 255;
  }
  if (threeD) return ndarray(rgb, [height, width, 1]) as NDT;
  return ndarray(rgb, [height, width]) as NDT;
}

export default function App() {
  const plots = ['plot_0', 'plot_1'];
  const uuid = crypto.randomUUID().slice(-8);
  const [tightImagePlots, setTightImagePlots] = useState(true);
  const [srcConfig, setSrcConfig] = useState<SourceConfig>({
    plugin: 'ExampleSourcePlugin',
    shape: [128, 64],
    period: 2.5,
    activate: true,
  });

  console.log('new App created with uuid: ', uuid);

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
          width: 2.4,
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

  const portraitImage = generateImage(6, 12);
  const landscapeImage = generateGreyImage(9, 2);
  const squareImage = generateGreyImage(6, 6, true);

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
            plotId={plots[0]}
            uuid={uuid}
            hostname={host}
            port={port}
            source={srcConfig}
          />
        </div>
        <button
          onClick={() =>
            setSrcConfig((prevState) => {
              return {
                ...prevState,
                activate: !prevState.activate,
              }
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
      </TabPanel>
      <TabPanel>
        <div style={{ display: 'grid', height: '80vh' }}>
          <LinePlot {...linePropsNoSelection} updateSelection={null} />
        </div>
      </TabPanel>
      <TabPanel>
        <Tabs className={'inner-image-tabs'}>
          <TabList>
            <Tab>Sample Heatmap</Tab>
            <Tab>Equal Aspect Images</Tab>
          </TabList>
          <TabPanel>
            <div style={{ display: 'grid', height: '80vh' }}>
              <HeatmapPlot {...heatmapProps} />
            </div>
          </TabPanel>
          <TabPanel>
            <h4>
              When the aspect is set to &apos;equal&apos; an ImagePlot will keep
              pixels square. Setting the &apos;tightAxes&apos; prop will make
              the ImagePlot attempt to use space more efficiently by removing
              the padding between the axes. In a flex container, this means the
              plot will seize more space.
            </h4>
            <button onClick={() => setTightImagePlots((t) => !t)}>
              {tightImagePlots ? 'Disable' : 'Enable'} tight axes
            </button>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '33vw 67vw',
                maxHeight: '80vh',
                outline: '1px solid gray',
              }}
            >
              <div style={{ maxHeight: '80vh' }}>
                <ImagePlot
                  aspect="equal"
                  plotConfig={{ title: 'Sample Portrait Image' }}
                  values={portraitImage}
                  tightAxes={tightImagePlots}
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: '40vh 1fr',
                  outline: '1px solid gray',
                  maxHeight: '80vh',
                }}
              >
                <div style={{ outline: '1px solid gray' }}>
                  <ImagePlot
                    aspect="equal"
                    plotConfig={{ title: 'Sample Landscape Image' }}
                    values={landscapeImage}
                    tightAxes={tightImagePlots}
                  />
                </div>
                <ImagePlot
                  aspect="equal"
                  plotConfig={{
                    title: 'Sample Image With Axis Labels',
                    xLabel: 'X Co-ordinate',
                    yLabel: 'Y Co-ordinate',
                  }}
                  tightAxes={tightImagePlots}
                  values={squareImage}
                />
              </div>
            </div>
          </TabPanel>
        </Tabs>
      </TabPanel>
      <TabPanel>
        <Tabs className={'inner-any-tabs'}>
          <TabList>
            <Tab>Line</Tab>
            <Tab>Line (selection option)</Tab>
            <Tab>Line (selection options)</Tab>
            <Tab>Line (no selection options)</Tab>
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
              <AnyPlot {...lineProps} selectionOptions={{ verticalAxis: 1 }} />
            </div>
          </TabPanel>
          <TabPanel>
            <div style={{ display: 'grid', height: '80vh' }}>
              <AnyPlot
                {...lineProps}
                selectionOptions={{ verticalAxis: 2, line: 0 }}
              />
            </div>
          </TabPanel>
          <TabPanel>
            <div style={{ display: 'grid', height: '80vh' }}>
              <AnyPlot {...lineProps} selectionOptions={{}} />
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
