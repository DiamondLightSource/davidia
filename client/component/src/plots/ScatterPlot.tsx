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

import PlotToolbar from '../PlotToolbar';
import SelectionComponent from '../selection-components/SelectionComponent';
import { SelectionType } from '../selections/utils';
import { createInteractionsConfig, InteractionModeType } from '../utils';
import type { MP_NDArray, ScatterPlotProps } from '../AnyPlot';

/**
 * Represents scatter data.
 * @interface {object} ScatterData
 * @member {string} key - The key.
 * @member {MP_NDArray} xData - The x data.
 * @member {MP_NDArray} yData - The y data.
 * @member {MP_NDArray} dataArray - The z data.
 * @member {Domain} domain - The z data domain.
 * @member {ColorMap} [colourMap] - The colour map.
 */
interface ScatterData {
  /** The key */
  key: string;
  /** The x data */
  xData: MP_NDArray;
  /** The y data */
  yData: MP_NDArray;
  /** The z data */
  dataArray: MP_NDArray;
  /** The z data domain */
  domain: Domain;
  /** The colour map */
  colourMap?: ColorMap;
}

/**
 *
 * Renders a scatter plot.
 * @param {ScatterPlotProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function ScatterPlot(props: ScatterPlotProps) {
  const abscissaValue: TypedArray =
    props.axesParameters.xValues?.data ?? props.xData.data;
  const ordinateValue: TypedArray =
    props.axesParameters.yValues?.data ?? props.yData.data;
  const [colourMap, setColourMap] = useState<ColorMap>(
    props.colourMap ?? 'Viridis'
  );
  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState(props.axesParameters.title ?? '');
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel ?? 'y axis');
  console.log('props are', props);
  console.log('props.axesParameters.xLabel is', props.axesParameters.xLabel);
  console.log('xLabel is', xLabel);
  const [xScaleType, setXScaleType] = useState<AxisScaleType>(
    props.axesParameters.xScale ?? ScaleType.Linear
  );
  const [yScaleType, setYScaleType] = useState<AxisScaleType>(
    props.axesParameters.yScale ?? ScaleType.Linear
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
        colourMap={colourMap}
        setColourMap={setColourMap}
        invertColourMap={invertColourMap}
        toggleInvertColourMap={toggleInvertColourMap}
        selectionType={selectionType}
        setSelectionType={setSelectionType}
        selections={props.selections}
        updateSelections={props.addSelection}
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
export type { ScatterData };
