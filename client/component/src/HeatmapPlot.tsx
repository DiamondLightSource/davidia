import {
  type ColorMap,
  type ColorScaleType,
  Domain,
  HeatmapVis,
  type ModifierKey,
  getVisDomain,
} from '@h5web/lib';

import { createInteractionsConfig, InteractionModeType } from './utils';
import SelectionComponent from './SelectionComponent';
import type { ImageData } from './ImagePlot';
import type { NDT, PlotBaseProps } from './models';
import {
  PlotCustomizationContextProvider,
  usePlotCustomizationContext,
} from './PlotCustomizationContext';
import { AnyToolbar } from './PlotToolbar';

interface Props {
  xValues?: NDT;
  yValues?: NDT;
  values: NDT;
}

export function HeatmapVisCanvas({ xValues, yValues, values }: Props) {
  const {
    title,
    showGrid,
    xLabel,
    yLabel,
    mode,
    aspect,
    batonProps,
    selectionType,
    updateSelection,
    selections,
    dDomain,
    dCustomDomain,
    colourMap,
    invertColourMap,
    dScaleType,
  } = usePlotCustomizationContext();
  const interactionsConfig = createInteractionsConfig(mode);

  return (
    <HeatmapVis
      dataArray={values}
      domain={getVisDomain(dCustomDomain, dDomain)}
      colorMap={colourMap}
      invertColorMap={invertColourMap}
      scaleType={dScaleType}
      aspect={aspect}
      showGrid={showGrid}
      title={title}
      abscissaParams={{
        label: xLabel,
        value: xValues?.data,
      }}
      ordinateParams={{
        label: yLabel,
        value: yValues?.data,
      }}
      interactions={interactionsConfig}
    >
      {updateSelection && (
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          disabled={mode !== InteractionModeType.selectRegion}
          selectionType={selectionType}
          batonProps={batonProps}
          addSelection={updateSelection}
          selections={selections}
        />
      )}
    </HeatmapVis>
  );
}

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
  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <PlotCustomizationContextProvider {...props}>
        <AnyToolbar>{props.customToolbarChildren}</AnyToolbar>
        <HeatmapVisCanvas
          xValues={props.plotConfig.xValues}
          yValues={props.plotConfig.yValues}
          values={props.values}
        />
      </PlotCustomizationContextProvider>
    </div>
  );
}

export default HeatmapPlot;
export type { HeatmapData, HeatmapPlotProps };
