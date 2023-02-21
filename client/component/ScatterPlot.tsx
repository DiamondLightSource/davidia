import '@h5web/lib/dist/styles.css';
import {
  GridToggler,
  ModifierKey,
  ScatterVis,
  Separator,
  Toolbar,
  getVisDomain,
} from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { AxisConfigModal } from './AxisConfigModal';
import { InteractionModeToggle } from './InteractionModeToggle';
import { LabelledInput } from './LabelledInput';
import { SelectionComponent } from './SelectionComponent';
import { createInteractionsConfig } from './utils';

function ScatterPlot(props: ScatterPlotProps) {
  const abscissaValue: TypedArray =
    props.axesParameters.xValues?.data ?? props.xData.data;
  const ordinateValue: TypedArray =
    props.axesParameters.yValues?.data ?? props.yData.data;
  const [colorMap, setColorMap] = useState(
    props.colorMap === undefined ? 'Viridis' : props.colorMap
  );
  const [title, setTitle] = useState(props.axesParameters.title);
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel);
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel);
  const [invertColorMap, toggleColorMapInversion] = useToggle();
  const [showGrid, toggleGrid] = useToggle();
  const [customDomain, setCustomDomain] = useState<CustomDomain>([
    ...props.domain,
  ]);
  const [xScaleType, setXScaleType] = useState<ScaleType>(
    props.axesParameters.xScale ?? ('linear' as ScaleType)
  );
  const [yScaleType, setYScaleType] = useState(
    props.axesParameters.yScale ?? ('linear' as ScaleType)
  );
  const [mode, setMode] = useState<string>('panAndWheelZoom');
  const interactionsConfig = createInteractionsConfig(
    mode as InteractionModeType
  );
  const [showXModal, setShowXModal] = useState(false);
  const [showYModal, setShowYModal] = useState(false);
  const [showZModal, setShowZModal] = useState(false);

  return (
    <>
      <Toolbar>
        <InteractionModeToggle
          value={mode}
          onModeChange={setMode}
        ></InteractionModeToggle>
        <Separator />
        <button onClick={() => setShowXModal(true)}> X axis</button>
        <button onClick={() => setShowYModal(true)}> Y axis</button>
        <button onClick={() => setShowZModal(true)}> Z axis</button>
        <AxisConfigModal
          title={'x axis'}
          label={xLabel}
          setLabel={setXLabel}
          scaleType={xScaleType}
          setScaleType={setXScaleType}
          onClose={() => setShowXModal(false)}
          show={showXModal}
        ></AxisConfigModal>
        <AxisConfigModal
          title={'y axis'}
          label={yLabel}
          setLabel={setYLabel}
          scaleType={yScaleType}
          setScaleType={setYScaleType}
          onClose={() => setShowYModal(false)}
          show={showYModal}
        ></AxisConfigModal>
        <AxisConfigModal
          title={'Colour'}
          colorMap={colorMap}
          setColorMap={setColorMap}
          invertColorMap={invertColorMap}
          toggleColorMapInversion={toggleColorMapInversion}
          domain={props.domain}
          customDomain={customDomain}
          setCustomDomain={setCustomDomain}
          onClose={() => setShowZModal(false)}
          show={showZModal}
        ></AxisConfigModal>
        <Separator />
        <GridToggler value={showGrid} onToggle={toggleGrid} />
        <Separator />
        <LabelledInput<string>
          key="1"
          label="title"
          input={title ?? ''}
          updateValue={setTitle}
        />
        <Separator />
      </Toolbar>
      <ScatterVis
        abscissaParams={{
          label: xLabel,
          value: abscissaValue,
          scaleType: xScaleType,
        }}
        colorMap={colorMap}
        title={title}
        invertColorMap={invertColorMap}
        dataArray={props.dataArray}
        domain={getVisDomain(customDomain, props.domain)}
        ordinateParams={{
          label: yLabel,
          value: ordinateValue,
          scaleType: yScaleType,
        }}
        showGrid={showGrid}
        interactions={interactionsConfig}
      >
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          disabled={mode !== 'selectRegion'}
          addSelection={props.addSelection}
          selections={props.selections}
        />
      </ScatterVis>
    </>
  );
}

export default ScatterPlot;
