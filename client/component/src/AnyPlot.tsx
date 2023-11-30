import afterFrame from 'afterframe';
import { useRef } from 'react';

import HeatmapPlot from './HeatmapPlot';
import ImagePlot from './ImagePlot';
import LinePlot from './LinePlot';
import ScatterPlot from './ScatterPlot';
import SurfacePlot from './SurfacePlot';
import TableDisplay from './TableDisplay';
import { measureInteraction } from './utils';
import type { SelectionBase } from './selections/utils';

type Aspect = import('@h5web/lib').Aspect;
type AxisScaleType = import('@h5web/lib').AxisScaleType;
type ColorMap = import('@h5web/lib').ColorMap;
type ColorScaleType = import('@h5web/lib').ColorScaleType;
type CustomDomain = import('@h5web/lib').CustomDomain;
type Domain = import('@h5web/lib').Domain;

type GenericArray<T> = T[] | TypedArray;
type TypedArray =
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | Float32Array
  | Float64Array;
type NdArray<T extends GenericArray<any>> = import('ndarray').NdArray<T>;
type TableDisplayType = 'scientific' | 'standard';

interface MP_NDArray {
  // see fastapi_utils.py
  nd: boolean;
  dtype: string;
  shape: number[];
  data: ArrayBuffer;
}

interface AxesParameters {
  x_label?: string;
  y_label?: string;
  x_scale?: AxisScaleType;
  y_scale?: AxisScaleType;
  x_values?: MP_NDArray;
  y_values?: MP_NDArray;
  title?: string;
}

interface DLineData {
  key: string;
  colour?: string;
  x: NdArray<TypedArray>;
  dx: [number, number];
  y: NdArray<TypedArray>;
  dy: [number, number];
  line_on: boolean;
  point_size?: number;
  default_indices?: boolean;
}

interface BatonProps {
  uuid: string;
  batonUuid: string | null;
  others: string[];
  hasBaton: boolean;
  requestBaton: () => void;
  approveBaton: (s: string) => void;
}

interface PlotSelectionProps {
  addSelection: (
    selection: SelectionBase | null,
    broadcast?: boolean,
    clear?: boolean
  ) => void;
  selections: SelectionBase[];
  batonProps: BatonProps;
}

interface LinePlotProps extends PlotSelectionProps {
  data: DLineData[];
  xDomain: Domain;
  yDomain: Domain;
  axesParameters: DAxesParameters;
}

interface ImagePlotProps extends PlotSelectionProps {
  values: NdArray<TypedArray>;
  axesParameters: DAxesParameters;
  aspect?: Aspect;
}

interface HeatmapPlotProps extends ImagePlotProps {
  domain: Domain;
  heatmapScale: ColorScaleType;
  colourMap?: ColorMap;
}

interface ScatterPlotProps extends PlotSelectionProps {
  xData: NdArray<TypedArray>;
  yData: NdArray<TypedArray>;
  dataArray: NdArray<TypedArray>;
  domain: Domain;
  axesParameters: DAxesParameters;
  colourMap?: ColorMap;
}

interface SurfacePlotProps extends PlotSelectionProps {
  values: NdArray<TypedArray>;
  domain: Domain;
  axesParameters: DAxesParameters;
  surfaceScale: ColorScaleType;
  colourMap?: ColorMap;
}

interface TableDisplayParams {
  displayType?: TableDisplayType;
  numberDigits?: number;
}

interface TableDisplayProps extends PlotSelectionProps {
  cellWidth: number;
  dataArray: NdArray<TypedArray>;
  displayParams?: TableDisplayParams;
}

type AnyPlotProps =
  | LinePlotProps
  | ImagePlotProps
  | HeatmapPlotProps
  | ScatterPlotProps
  | SurfacePlotProps
  | TableDisplayProps;

interface DAxesParameters {
  xLabel?: string;
  yLabel?: string;
  xScale?: AxisScaleType;
  yScale?: AxisScaleType;
  xValues?: NdArray<TypedArray>;
  yValues?: NdArray<TypedArray>;
  title?: string;
}

function AnyPlot(props: AnyPlotProps) {
  const interactionTime = useRef<number>(0);
  const interaction = measureInteraction();
  afterFrame(() => {
    interactionTime.current = interaction.end();
  });

  if ('surfaceScale' in props) {
    return <SurfacePlot {...props}></SurfacePlot>;
  } else if ('heatmapScale' in props) {
    return <HeatmapPlot {...props}></HeatmapPlot>;
  } else if ('values' in props) {
    return <ImagePlot {...props}></ImagePlot>;
  } else if ('xData' in props) {
    return <ScatterPlot {...props}></ScatterPlot>;
  } else if ('cellWidth' in props) {
    return <TableDisplay {...props}></TableDisplay>;
  } else if ('data' in props && props.data.length !== 0) {
    return <LinePlot {...props}></LinePlot>;
  }
  return null;
}

export type {
  AnyPlotProps,
  Aspect,
  AxisScaleType,
  AxesParameters,
  BatonProps,
  ColorMap,
  ColorScaleType,
  CustomDomain,
  DAxesParameters,
  DLineData,
  Domain,
  HeatmapPlotProps,
  ImagePlotProps,
  LinePlotProps,
  MP_NDArray,
  NdArray,
  PlotSelectionProps,
  ScatterPlotProps,
  SurfacePlotProps,
  TableDisplayParams,
  TableDisplayProps,
  TableDisplayType,
  TypedArray,
};
export default AnyPlot;
