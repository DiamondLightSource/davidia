import {
  AxisParams,
  AxisScaleType,
  ColorMap,
  ColorScaleType,
  CustomDomain,
  HeatmapVis,
  ModifierKey,
  ScaleType,
  getVisDomain,
} from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { createInteractionsConfig } from './utils';
import { PlotToolbar } from './PlotToolbar';
import { SelectionComponent } from './SelectionComponent';
import { SelectionType } from './selections/utils';

function HeatmapPlot(props: HeatmapPlotProps) {
  const [aspect, setAspect] = useState<Aspect>(props.aspect ?? 'equal');
  const [colourMap, setColourMap] = useState<ColorMap>(
    props.colourMap ?? 'Warm'
  );
  const [invertColourMap, toggleInvertColourMap] = useToggle();
  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState(props.axesParameters.title ?? '');
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel ?? 'y axis');
  const [customDomain, setCustomDomain] = useState<CustomDomain>([null, null]);
  const [xScaleType, setXScaleType] = useState<AxisScaleType>(
    props.axesParameters.xScale ?? ScaleType.Linear
  );
  const [yScaleType, setYScaleType] = useState<AxisScaleType>(
    props.axesParameters.yScale ?? ScaleType.Linear
  );
  const [heatmapScaleType, setHeatmapScaleType] = useState<ColorScaleType>(
    props.heatmapScale
  );
  const [mode, setMode] = useState<string>('panAndWheelZoom');
  const interactionsConfig = createInteractionsConfig(
    mode as InteractionModeType
  );
  const [selectionType, setSelectionType] = useState<SelectionType>(
    SelectionType.line
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
        batonProps={props.batonProps}
        yScaleType={yScaleType}
        setYScaleType={setYScaleType}
        aspect={aspect}
        setAspect={setAspect}
        selectionType={selectionType}
        setSelectionType={setSelectionType}
        dDomain={props.domain}
        dCustomDomain={customDomain}
        setDCustomDomain={setCustomDomain}
        values={props.values.data}
        dScaleType={heatmapScaleType}
        setDScaleType={setHeatmapScaleType}
        colourMap={colourMap}
        setColourMap={setColourMap}
        invertColourMap={invertColourMap}
        toggleInvertColourMap={toggleInvertColourMap}
        selections={props.selections}
        updateSelections={props.addSelection}
      />
      <HeatmapVis
        dataArray={props.values}
        domain={getVisDomain(customDomain, props.domain)}
        colorMap={colourMap}
        invertColorMap={invertColourMap}
        scaleType={heatmapScaleType}
        aspect={aspect}
        showGrid={showGrid}
        title={title}
        abscissaParams={
          {
            label: xLabel,
            scaleType: xScaleType,
            value: props.axesParameters.xValues?.data,
          } as AxisParams
        }
        ordinateParams={
          {
            label: yLabel,
            scaleType: yScaleType,
            value: props.axesParameters.yValues?.data,
          } as AxisParams
        }
        interactions={interactionsConfig}
      >
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          batonProps={props.batonProps}
          disabled={mode !== 'selectRegion'}
          selectionType={selectionType}
          addSelection={props.addSelection}
          selections={props.selections}
        />
      </HeatmapVis>
    </>
  );
}

export default HeatmapPlot;
