import {
  type AxisScaleType,
  type ColorMap,
  type CustomDomain,
  Domain,
  type ModifierKey,
  ScaleType,
  ScatterVis,
  getVisDomain,
} from '@h5web/lib';
import type { TypedArray } from 'ndarray';
import { useToggle } from '@react-hookz/web';
import { useState } from 'react';

import PlotToolbar from './PlotToolbar';
import SelectionComponent from './SelectionComponent';
import { SelectionType } from './selections/utils';
import { createInteractionsConfig, InteractionModeType } from './utils';
import type { PlotBaseProps, NDT } from './AnyPlot';

/**
 * Represent scatter data.
 */
interface ScatterData {
  /** The x values for the scatter plot */
  x: NDT;
  /** The y values for the scatter plot */
  y: NDT;
  /** The values at each point in the scatter plot */
  pointValues: NDT;
  /** The domain of the z axis */
  domain: Domain;
  /** The size of the data points */
  pointSize: number;
  /** The colour map (optional) */
  colourMap?: ColorMap;
}

/**
 * Props for the `ScatterPlotProps` component.
 */
interface ScatterPlotProps extends PlotBaseProps, ScatterData {
  /** Function to update data point size */
  setPointSize: (p: number) => void;
}

/**
 * Render a scatter plot.
 * @param {ScatterPlotProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function ScatterPlot(props: ScatterPlotProps) {
  const abscissaValue: TypedArray =
    props.plotConfig.xValues?.data ?? props.x.data;
  const ordinateValue: TypedArray =
    props.plotConfig.yValues?.data ?? props.y.data;
  const [colourMap, setColourMap] = useState<ColorMap>(
    props.colourMap ?? 'Viridis'
  );
  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState(props.plotConfig.title ?? '');
  const [xLabel, setXLabel] = useState(props.plotConfig.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.plotConfig.yLabel ?? 'y axis');
  console.log('props are', props);
  console.log('props.plotConfig.xLabel is', props.plotConfig.xLabel);
  console.log('xLabel is', xLabel);
  const [xScaleType, setXScaleType] = useState<AxisScaleType>(
    props.plotConfig.xScale ?? ScaleType.Linear
  );
  const [yScaleType, setYScaleType] = useState<AxisScaleType>(
    props.plotConfig.yScale ?? ScaleType.Linear
  );
  const [invertColourMap, toggleInvertColourMap] = useToggle();
  const [dCustomDomain, setDCustomDomain] = useState<CustomDomain>([
    null,
    null,
  ]);
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
        xScaleType={xScaleType}
        setXScaleType={setXScaleType}
        yLabel={yLabel}
        setYLabel={setYLabel}
        batonProps={props.batonProps}
        yScaleType={yScaleType}
        setYScaleType={setYScaleType}
        dDomain={props.domain}
        dCustomDomain={dCustomDomain}
        setDCustomDomain={setDCustomDomain}
        dData={props.pointValues.data}
        colourMap={colourMap}
        setColourMap={setColourMap}
        invertColourMap={invertColourMap}
        toggleInvertColourMap={toggleInvertColourMap}
        selectionType={selectionType}
        setSelectionType={setSelectionType}
        selections={props.selections}
        updateSelections={props.addSelection}
        scatterPointSize={props.pointSize}
        setScatterPointSize={props.setPointSize}
      />
      <ScatterVis
        abscissaParams={{
          label: xLabel,
          value: abscissaValue,
          scaleType: xScaleType,
        }}
        colorMap={colourMap}
        title={title}
        invertColorMap={invertColourMap}
        dataArray={props.pointValues}
        domain={getVisDomain(dCustomDomain, props.domain)}
        ordinateParams={{
          label: yLabel,
          value: ordinateValue,
          scaleType: yScaleType,
        }}
        size={props.pointSize}
        showGrid={showGrid}
        interactions={interactionsConfig}
      >
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          batonProps={props.batonProps}
          disabled={mode !== InteractionModeType.selectRegion}
          selectionType={selectionType}
          addSelection={props.addSelection}
          selections={props.selections}
        />
      </ScatterVis>
    </div>
  );
}

export default ScatterPlot;
export type { ScatterData, ScatterPlotProps };
