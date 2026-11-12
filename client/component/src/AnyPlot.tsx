import afterFrame from 'afterframe';

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
import {
  PlotCustomizationContextProvider,
  usePlotCustomizationContext,
} from './PlotCustomizationContext';
import { useEffect } from 'react';

type AnyPlotVisProps =
  | LinePlotProps
  | ImagePlotProps
  | HeatmapPlotProps
  | ScatterPlotProps
  | SurfacePlotProps;

type AnyPlotProps = AnyPlotVisProps | TableDisplayProps;

function AnyVisCanvas(props: AnyPlotProps) {
  const {
    updateLineContext,
    updateHeatmapContext,
    updateImageContext,
    updateSelectionContext,
    updateSurfaceContext,
    updateScatterContext,
  } = usePlotCustomizationContext();

  const isLine = 'lineData' in props && props.lineData.length !== 0;
  const isHeatmap = 'heatmapScale' in props;
  const isImage = !isHeatmap && 'values' in props;
  const isSurface = 'heightValues' in props;
  const isScatter = 'pointValues' in props;
  const isTable = 'cellWidth' in props;

  useEffect(() => {
    if (!(isSurface || isTable)) {
      const {
        canEditSelections,
        selections,
        selectionOptions,
        selectionsListener,
      } = props;
      const plotSelectionProps = {
        canEditSelections,
        selections,
        selectionOptions,
        selectionsListener,
      };
      if (!Object.values(plotSelectionProps).every((v) => v === undefined)) {
        console.log('USC', plotSelectionProps);
        updateSelectionContext(plotSelectionProps);
      }
    }
  }, [isSurface, isTable, updateSelectionContext, props]);

  useEffect(() => {
    if (isLine) {
      updateLineContext(props.xDomain, props.yDomain, props.plotConfig);
    } else if (isHeatmap) {
      updateHeatmapContext(props, props.plotConfig);
    } else if (isImage) {
      updateImageContext(props, props.plotConfig);
    } else if (isSurface) {
      updateSurfaceContext(props, props.plotConfig);
    } else if (isScatter) {
      updateScatterContext(props, props.plotConfig);
    }
  }, [
    isLine,
    isHeatmap,
    isImage,
    isSurface,
    isScatter,
    updateLineContext,
    updateHeatmapContext,
    updateImageContext,
    updateSurfaceContext,
    updateScatterContext,
    props,
  ]);

  let visCanvas = null;
  if (isLine) {
    visCanvas = <LineVisCanvas lineData={props.lineData} />;
  } else if (isHeatmap) {
    visCanvas = (
      <HeatmapVisCanvas
        xValues={props.plotConfig.xValues}
        yValues={props.plotConfig.yValues}
        values={props.values}
      />
    );
  } else if (isImage) {
    visCanvas = (
      <ImageVisCanvas
        xValues={props.plotConfig.xValues}
        yValues={props.plotConfig.yValues}
        values={props.values}
      />
    );
  } else if (isSurface) {
    visCanvas = <SurfaceVisCanvas values={props.heightValues} />;
  } else if (isScatter) {
    visCanvas = (
      <ScatterVisCanvas x={props.x} y={props.y} values={props.pointValues} />
    );
  } else if (isTable) {
    visCanvas = <TableDisplay {...props}></TableDisplay>;
  }
  return visCanvas;
}

/**
 * A plot that accepts any plot props
 * @param {AnyPlotProps} props - component props
 * @returns {JSX.Element} The rendered component.
 */
function AnyPlot(props: AnyPlotProps) {
  const interaction = measureInteraction();
  afterFrame(() => {
    interaction.end();
  });
  const isTable = 'cellWidth' in props;

  return (
    <div
      className="any_plot"
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <PlotCustomizationContextProvider>
        {!isTable && <AnyToolbar>{props.customToolbarChildren}</AnyToolbar>}
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
export { AnyVisCanvas };

export default AnyPlot;
