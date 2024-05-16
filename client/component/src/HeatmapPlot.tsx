import {
  Aspect,
  type AxisParams,
  type AxisScaleType,
  type ColorMap,
  type ColorScaleType,
  type CustomDomain,
  Domain,
  HeatmapVis,
  type ModifierKey,
  ScaleType,
  getVisDomain,
} from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { createInteractionsConfig, InteractionModeType } from './utils';
import PlotToolbar from './PlotToolbar';
import SelectionComponent from './SelectionComponent';
import { SelectionType } from './selections/utils';
import type { ImageData } from './ImagePlot';
import type { PlotBaseProps } from './AnyPlot';

/**
 * Represent heatmap data
 */
interface HeatmapData extends ImageData {
  /** extent of scale for pixel values */
  domain: Domain;
  /** heatmap scale type */
  heatmapScale: ColorScaleType;
  /**  */
  colourMap?: ColorMap;
}

/**
 * Props for `HeatmapPlot` component
 */
interface HeatmapPlotProps extends PlotBaseProps, HeatmapData {}

/**
 * A heatmap plot
 * @param {HeatmapPlotProps} props - The component props
 * @returns {React.JSX.Element} The rendered component
 */
function HeatmapPlot(props: HeatmapPlotProps) {
  const [aspect, setAspect] = useState<Aspect>(props.aspect ?? 'equal');
  const [colourMap, setColourMap] = useState<ColorMap>(
    props.colourMap ?? 'Warm'
  );
  const [invertColourMap, toggleInvertColourMap] = useToggle();
  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState(props.plotConfig.title ?? '');
  const [xLabel, setXLabel] = useState(props.plotConfig.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.plotConfig.yLabel ?? 'y axis');
  const [customDomain, setCustomDomain] = useState<CustomDomain>([null, null]);
  const [xScaleType, setXScaleType] = useState<AxisScaleType>(
    props.plotConfig.xScale ?? ScaleType.Linear
  );
  const [yScaleType, setYScaleType] = useState<AxisScaleType>(
    props.plotConfig.yScale ?? ScaleType.Linear
  );
  const [heatmapScaleType, setHeatmapScaleType] = useState<ColorScaleType>(
    props.heatmapScale
  );
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
        aspect={aspect}
        setAspect={setAspect}
        selectionType={selectionType}
        setSelectionType={setSelectionType}
        dDomain={props.domain}
        dCustomDomain={customDomain}
        setDCustomDomain={setCustomDomain}
        dData={props.values.data}
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
            value: props.plotConfig.xValues?.data,
          } as AxisParams
        }
        ordinateParams={
          {
            label: yLabel,
            scaleType: yScaleType,
            value: props.plotConfig.yValues?.data,
          } as AxisParams
        }
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
      </HeatmapVis>
    </div>
  );
}

export default HeatmapPlot;
export type { HeatmapData, HeatmapPlotProps };
