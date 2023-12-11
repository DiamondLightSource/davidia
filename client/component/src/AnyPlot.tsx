import afterFrame from 'afterframe';
import { useRef } from 'react';
import type { TypedArray, NdArray } from 'ndarray';

import HeatmapPlot from './HeatmapPlot';
import ImagePlot from './ImagePlot';
import LinePlot from './LinePlot';
import ScatterPlot from './ScatterPlot';
import SurfacePlot from './SurfacePlot';
import TableDisplay from './TableDisplay';
import { measureInteraction } from './utils';
import type { SelectionBase } from './selections/utils';
import {
  Aspect,
  AxisScaleType,
  ColorMap,
  ColorScaleType,
  CustomDomain,
  Domain,
} from '@h5web/lib';

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
  // eslint-disable-next-line react-refresh/only-export-components
  MP_NDArray,
  PlotSelectionProps,
  ScatterPlotProps,
  SurfacePlotProps,
  TableDisplayParams,
  TableDisplayProps,
  TableDisplayType,
};
export default AnyPlot;
