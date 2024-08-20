export type {
  PlotConfig,
  BatonProps,
  NDT,
  PlotBaseProps,
  PlotSelectionProps,
} from './models';

export { default as AnyPlot } from './AnyPlot';
export type { AnyPlotProps, AnyPlotVisProps } from './AnyPlot';

export { default as ConnectedPlot } from './ConnectedPlot';
export type { ConnectedPlotProps } from './ConnectedPlot';

export { default as HeatmapPlot } from './HeatmapPlot';
export type { HeatmapData, HeatmapPlotProps } from './HeatmapPlot';

export { default as ImagePlot } from './ImagePlot';
export type { ImageData, ImagePlotProps } from './ImagePlot';

export { default as LinePlot } from './LinePlot';
export type { LineData, LineParams, LinePlotProps } from './LinePlot';

export {
  PlotCustomizationContextProvider,
  usePlotCustomizationContext,
} from './PlotCustomizationContext';
export type { PlotCustomizationContextValue } from './PlotCustomizationContext';
export { default as PlotToolbar } from './PlotToolbar';
export type { PlotToolbarProps } from './PlotToolbar';

export { default as ScatterPlot } from './ScatterPlot';
export type { ScatterPlotProps } from './ScatterPlot';

export { default as SurfacePlot } from './SurfacePlot';
export type { SurfaceData, SurfacePlotProps } from './SurfacePlot';

export { default as TableDisplay } from './TableDisplay';
export type {
  TableDisplayType,
  TableDisplayParams,
  TableDisplayProps,
} from './TableDisplay';

export { InteractionModeType } from './utils';

export { default as AxialSelection } from './selections/AxialSelection';
export { default as BaseSelection } from './selections/BaseSelection';
export { default as CircularSectorialSelection } from './selections/CircularSectorialSelection';
export { default as CircularSelection } from './selections/CircularSelection';
export { default as EllipticalSelection } from './selections/EllipticalSelection';
export { default as LinearSelection } from './selections/LinearSelection';
export { default as OrientableSelection } from './selections/OrientableSelection';
export { default as PolygonalSelection } from './selections/PolygonalSelection';
export { default as RectangularSelection } from './selections/RectangularSelection';
export { SelectionType } from './selections/utils';
export type {
  HandleChangeFunction,
  SelectionBase,
  SelectionHandler,
} from './selections/utils';

// Re-export @h5web/lib enums and types used by some props
export { GlyphType, ScaleType } from '@h5web/lib';
export type {
  Aspect,
  AxisScaleType,
  ColorMap,
  ColorScaleType,
  Domain,
} from '@h5web/lib';
