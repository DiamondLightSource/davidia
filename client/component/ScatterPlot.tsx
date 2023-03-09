import { ModifierKey, ScaleType, ScatterVis, getVisDomain } from '@h5web/lib';
import { useToggle } from '@react-hookz/web';
import { useState } from 'react';

import { PlotToolbar } from './PlotToolbar';
import { SelectionComponent } from './SelectionComponent';
import { createInteractionsConfig } from './utils';

function ScatterPlot(props: ScatterPlotProps) {
  const abscissaValue: TypedArray =
    props.axesParameters.xValues?.data ?? props.xData.data;
  const ordinateValue: TypedArray =
    props.axesParameters.yValues?.data ?? props.yData.data;
  const [colorMap, setColorMap] = useState(props.colorMap ?? 'Viridis');
  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState(props.axesParameters.title ?? '');
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel ?? 'y axis');
  console.log('props are', props);
  console.log('props.axesParameters.xLabel is', props.axesParameters.xLabel);
  console.log('xLabel is', xLabel);
  const [xScaleType, setXScaleType] = useState<ScaleType>(
    props.axesParameters.xScale ?? ScaleType.Linear
  );
  const [yScaleType, setYScaleType] = useState<ScaleType>(
    props.axesParameters.yScale ?? ScaleType.Linear
  );
  const [invertColorMap, toggleInvertColorMap] = useToggle();
  const [dCustomDomain, setDCustomDomain] = useState<CustomDomain>([
    ...props.domain,
  ]);
  const [mode, setMode] = useState<string>('panAndWheelZoom');
  const interactionsConfig = createInteractionsConfig(
    mode as InteractionModeType
  );

  return (
    <>
      <PlotToolbar
        showGrid={showGrid}
        toggleShowGrid={toggleShowGrid}
        title={title}
        setTitle={setTitle}
        mode={mode}
        setMode={setMode}
        xLabel={xLabel}
        setXLabel={setXLabel}
        xScaleType={xScaleType}
        setXScaleType={setXScaleType}
        yLabel={yLabel}
        setYLabel={setYLabel}
        yScaleType={yScaleType}
        setYScaleType={setYScaleType}
        dDomain={props.domain}
        dCustomDomain={dCustomDomain}
        setDCustomDomain={setDCustomDomain}
        colorMap={colorMap}
        setColorMap={setColorMap}
        invertColorMap={invertColorMap}
        toggleInvertColorMap={toggleInvertColorMap}
      />
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
        domain={getVisDomain(dCustomDomain, props.domain)}
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
