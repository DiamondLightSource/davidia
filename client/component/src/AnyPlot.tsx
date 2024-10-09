import afterFrame from 'afterframe';
import { useRef } from 'react';

import { HeatmapVisCanvas } from './HeatmapPlot';
import type { HeatmapPlotProps } from './HeatmapPlot';
import { ImageVisCanvas } from './ImagePlot';
import type { ImagePlotProps } from './ImagePlot';
import { LineVisCanvas } from './LinePlot';
import type { LinePlotProps } from './LinePlot';
import { ScatterVisCanvas } from './ScatterPlot';
import type { ScatterPlotProps } from './ScatterPlot';
import { SurfaceVisCanvas } from './SurfacePlot';
import type { SurfacePlotProps } from './SurfacePlot';
import TableDisplay from './TableDisplay';
import type { TableDisplayProps } from './TableDisplay';
import { measureInteraction } from './utils';
import { AnyToolbar } from './PlotToolbar';
import { PlotCustomizationContextProvider } from '.';

type AnyPlotVisProps =
  | LinePlotProps
  | ImagePlotProps
  | HeatmapPlotProps
  | ScatterPlotProps
  | SurfacePlotProps;

type AnyPlotProps = AnyPlotVisProps | TableDisplayProps;

function AnyVisCanvas(props: AnyPlotProps) {
  let visCanvas = null;
  if ('lineData' in props && props.lineData.length !== 0) {
    visCanvas = <LineVisCanvas lineData={props.lineData} />;
  } else if ('values' in props) {
    if ('heatmapScale' in props) {
      visCanvas = (
        <HeatmapVisCanvas
          xValues={props.plotConfig.xValues}
          yValues={props.plotConfig.yValues}
          values={props.values}
        />
      );
    } else {
      visCanvas = (
        <ImageVisCanvas
          xValues={props.plotConfig.xValues}
          yValues={props.plotConfig.yValues}
          values={props.values}
        />
      );
    }
  } else if ('heightValues' in props) {
    visCanvas = <SurfaceVisCanvas values={props.heightValues} />;
  } else if ('pointValues' in props) {
    visCanvas = (
      <ScatterVisCanvas x={props.x} y={props.y} values={props.pointValues} />
    );
  }
  return visCanvas;
}

/**
 * A plot that accepts any plot props
 * @param {AnyPlotProps} props - component props
 * @returns {JSX.Element} The rendered component.
 */
function AnyPlot(props: AnyPlotProps) {
  const interactionTime = useRef<number>(0);
  const interaction = measureInteraction();
  afterFrame(() => {
    interactionTime.current = interaction.end();
  });

  if ('cellWidth' in props) {
    return <TableDisplay {...props}></TableDisplay>;
  }

  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <PlotCustomizationContextProvider {...props}>
        <AnyToolbar>{props.customToolbarChildren}</AnyToolbar>
        <AnyVisCanvas {...props} />
      </PlotCustomizationContextProvider>
    </div>
  );
}

export type {
  AnyPlotProps,
  AnyPlotVisProps,
  HeatmapPlotProps,
  LinePlotProps,
  ScatterPlotProps,
  SurfacePlotProps,
};
export default AnyPlot;
