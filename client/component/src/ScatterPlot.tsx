import {
  type ColorMap,
  Domain,
  type ModifierKey,
  ScatterVis,
  getVisDomain,
} from '@h5web/lib';

import SelectionComponent from './SelectionComponent';
import { createInteractionsConfig, InteractionModeType } from './utils';
import type { PlotBaseProps, NDT } from './models';
import {
  PlotCustomizationContextProvider,
  usePlotCustomizationContext,
} from './PlotCustomizationContext';
import { AnyToolbar } from './PlotToolbar';

interface Props {
  x: NDT;
  y: NDT;
  values: NDT;
}

export function ScatterVisCanvas({ x, y, values }: Props) {
  const {
    title,
    showGrid,
    xLabel,
    xScaleType,
    yLabel,
    yScaleType,
    mode,
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
    <ScatterVis
      dataArray={values}
      domain={getVisDomain(dCustomDomain, dDomain)}
      colorMap={colourMap}
      invertColorMap={invertColourMap}
      scaleType={dScaleType}
      showGrid={showGrid}
      title={title}
      abscissaParams={{
        label: xLabel,
        value: x.data,
        scaleType: xScaleType,
      }}
      ordinateParams={{
        label: yLabel,
        value: y.data,
        scaleType: yScaleType,
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
    </ScatterVis>
  );
}

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
  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <PlotCustomizationContextProvider {...props}>
        <AnyToolbar>{props.customToolbarChildren}</AnyToolbar>
        <ScatterVisCanvas x={props.x} y={props.y} values={props.pointValues} />
      </PlotCustomizationContextProvider>
    </div>
  );
}

export default ScatterPlot;
export type { ScatterData, ScatterPlotProps };
