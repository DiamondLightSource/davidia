import { AxisParams, ModifierKey, RgbVis } from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { SelectionComponent } from './SelectionComponent';
import { createInteractionsConfig } from './utils';
import { PlotToolbar } from './PlotToolbar';

function ImagePlot(props: ImagePlotProps) {
  const [aspect, setAspect] = useState<Aspect>(props.aspect ?? 'equal');
  const [title, setTitle] = useState(props.axesParameters.title ?? '');
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel ?? 'y axis');
  const [showGrid, toggleShowGrid] = useToggle(true);
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
        yLabel={yLabel}
        setYLabel={setYLabel}
        aspect={aspect}
        setAspect={setAspect}
        values={props.values.data}
      />
      <RgbVis
        dataArray={props.values}
        aspect={aspect}
        showGrid={showGrid}
        title={title}
        abscissaParams={
          {
            label: xLabel,
            value: props.axesParameters.xValues?.data,
          } as AxisParams
        }
        ordinateParams={
          {
            label: yLabel,
            value: props.axesParameters.yValues?.data,
          } as AxisParams
        }
        interactions={interactionsConfig}
      >
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          disabled={mode !== 'selectRegion'}
          addSelection={props.addSelection}
          selections={props.selections}
        />
      </RgbVis>
    </>
  );
}

export default ImagePlot;
