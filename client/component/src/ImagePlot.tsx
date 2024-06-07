import { Aspect, type AxisParams, type ModifierKey, RgbVis } from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

import SelectionComponent from './SelectionComponent';
import { createInteractionsConfig, InteractionModeType } from './utils';
import PlotToolbar from './PlotToolbar';
import { SelectionType } from './selections/utils';
import type { PlotBaseProps, NDT } from './AnyPlot';

/**
 * Represent image data
 */
interface ImageData {
  /** pixel values */
  values: NDT;
  /** aspect ratio */
  aspect?: Aspect;
}

/**
 * Props for the `ImagePlot` component
 */
interface ImagePlotProps extends PlotBaseProps, ImageData {}

/**
 * Render an image plot.
 * @param {ImagePlotProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function ImagePlot(props: ImagePlotProps) {
  const [aspect, setAspect] = useState<Aspect>(props.aspect ?? 'equal');
  const [title, setTitle] = useState(props.plotConfig.title ?? '');
  const [xLabel, setXLabel] = useState(props.plotConfig.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.plotConfig.yLabel ?? 'y axis');
  const [showGrid, toggleShowGrid] = useToggle(true);
  const [mode, setMode] = useState<InteractionModeType>(
    InteractionModeType.panAndWheelZoom
  );
  const interactionsConfig = createInteractionsConfig(mode);
  const [selectionType, setSelectionType] = useState<SelectionType>(
    SelectionType.line
  );

  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
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
        batonProps={props.batonProps}
        aspect={aspect}
        setAspect={setAspect}
        selectionType={selectionType}
        setSelectionType={setSelectionType}
        dData={props.values.data}
        selections={props.selections}
        updateSelections={props.addSelection}
      />
      <RgbVis
        dataArray={props.values}
        aspect={aspect}
        showGrid={showGrid}
        title={title}
        abscissaParams={
          {
            label: xLabel,
            value: props.plotConfig.xValues?.data,
          } as AxisParams
        }
        ordinateParams={
          {
            label: yLabel,
            value: props.plotConfig.yValues?.data,
          } as AxisParams
        }
        interactions={interactionsConfig}
      >
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          disabled={mode !== InteractionModeType.selectRegion}
          selectionType={selectionType}
          batonProps={props.batonProps}
          addSelection={props.addSelection}
          selections={props.selections}
        />
      </RgbVis>
    </div>
  );
}

export default ImagePlot;
export type { ImageData, ImagePlotProps };
