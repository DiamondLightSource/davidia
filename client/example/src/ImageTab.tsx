import { useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { HeatmapPlot, ImagePlot } from '@diamondlightsource/davidia';
import { generateGreyImage, generateImage, heatmapProps } from './plotData';
export function ImageTab() {
  const [tightImagePlots, setTightImagePlots] = useState(true);
  const [portraitImage] = useState(() => generateImage(6, 12));
  const [landscapeImage] = useState(() => generateGreyImage(9, 2));
  const [squareImage] = useState(() => generateGreyImage(6, 6, true));
  return (
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
          pixels square. Setting the &apos;tightAxes&apos; prop will make the
          ImagePlot attempt to use space more efficiently by removing the
          padding between the axes. In a flex container, this means the plot
          will seize more space.
        </h4>
        <button onClick={() => setTightImagePlots((tight) => !tight)}>
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
  );
}
