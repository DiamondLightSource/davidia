import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import {
  AnyPlot,
  HeatmapPlot,
  HeatmapPlotProps,
  SelectionBase,
  SelectionsEventListener,
  SelectionsEventType,
} from '@diamondlightsource/davidia';
import { heatmapProps, heatmapPropsNoToolbar, lineProps } from './plotData';
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
  return <HeatmapPlot {...props} selectionsListener={selectionsListener} />;
}
export function AnyTab() {
  return (
    <Tabs className="inner-any-tabs">
      <TabList>
        <Tab>Line</Tab> <Tab>Line (selection option)</Tab>
        <Tab>Line (selection options)</Tab>
        <Tab>Line (no selection options)</Tab> <Tab>Heatmap</Tab>
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
          <AnyPlot {...heatmapPropsNoToolbar} customToolbarChildren={null} />
        </div>
      </TabPanel>
      <TabPanel>
        <div style={{ display: 'grid', height: '80vh' }}>
          <SelectionHeatmapPlot {...heatmapProps} />
        </div>
      </TabPanel>
    </Tabs>
  );
}
