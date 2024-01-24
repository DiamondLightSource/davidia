import { Aspect, type AxisParams, type ModifierKey, RgbVis } from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

import SelectionComponent from './SelectionComponent';
import { createInteractionsConfig, InteractionModeType } from './utils';
import PlotToolbar from './PlotToolbar';
import { SelectionType } from './selections/utils';
import type { ImagePlotProps, MP_NDArray } from './AnyPlot';

/**
 * Represents image data.
 * @interface {object} ImageData
 * @member {string} key - The key.
 * @member {MP_NDArray} values - The image data values.
 * @member {Aspect} aspect - The aspect ratio.
 */
interface ImageData {
  /** The key */
  key: string;
  /** The image data values */
  values: MP_NDArray;
  /** The aspect ratio (optional) */
  aspect?: Aspect;
}

/**
 *
 * Renders an image plot.
 * @param {ImagePlotProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function ImagePlot(props: ImagePlotProps) {
  const [aspect, setAspect] = useState<Aspect>(props.aspect ?? 'equal');
  const [title, setTitle] = useState(props.axesParameters.title ?? '');
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel ?? 'y axis');
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
        values={props.values.data}
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
export type { ImageData };
