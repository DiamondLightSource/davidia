import ndarray from 'ndarray';
import type { TypedArray } from 'ndarray';
import concatRows from 'ndarray-concat-rows';
import linspace from 'ndarray-linspace';
import cwise from 'cwise';
import zeros from 'zeros';

import { bin } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import type {
  Aspect,
  AxialSelectToZoomProps,
  AxisScaleType,
  ColorMap,
  ColorScaleType,
  DefaultInteractionsConfig,
  Domain,
  HistogramParams,
  PanProps,
  SelectToZoomProps,
  XAxisZoomProps,
  YAxisZoomProps,
  ZoomProps,
} from '@h5web/lib';
import { createSingleChannelHistogram } from 'histogram.gl';

import type { PlotConfig, NDT } from './models';
import type { HeatmapData } from './HeatmapPlot';
import type { SurfaceData } from './SurfacePlot';
import type { ImageData } from './ImagePlot';
import type { TableData, TableDisplayParams } from './TableDisplay';
import type { LineData, LineParams } from './LinePlot';
import type { ScatterData } from './ScatterPlot';

/**
 * An MP_NDArray
 */
interface MP_NDArray {
  // see fastapi_utils.py
  /** If it is an n-dimensional array */
  nd: boolean;
  /** The data type */
  dtype: string;
  /** The shape of the data */
  shape: number[];
  /** The data */
  data: ArrayBufferLike;
}

type MinMax = (x: NDT) => [number, number];

/**
 * Represent plot configuration.
 */
interface CPlotConfig {
  /** The label for the x-axis */
  xLabel?: string;
  /** The label for the y-axis */
  yLabel?: string;
  /** The x-axis scale type */
  xScale?: AxisScaleType;
  /** The y-axis scale type */
  yScale?: AxisScaleType;
  /** The x-axis values */
  xValues?: MP_NDArray;
  /** The y-axis values */
  yValues?: MP_NDArray;
  /** The plot title */
  title?: string;
}

/**
 * Represent line data.
 */
interface CLineData {
  /** The key */
  key: string;
  /** Line parameters */
  lineParams: LineParams;
  /** The x data */
  x: MP_NDArray;
  /** The y data */
  y: MP_NDArray;
}

/*
 * Represent scatter data.
 */
interface CScatterData {
  /** The x data */
  x: MP_NDArray;
  /** The y data */
  y: MP_NDArray;
  /** The point values */
  pointValues: MP_NDArray;
  /** The point values domain */
  domain: Domain;
  /** The size of the data points (optional) */
  pointSize: number;
  /** The colour map */
  colourMap?: ColorMap;
}

/**
 * Represent image data.
 */
interface CImageData {
  /** The image data values */
  values: MP_NDArray;
  /** The aspect ratio (optional) */
  aspect?: Aspect;
}

/**
 * Represent heatmap data.
 */
interface CHeatmapData extends CImageData {
  /** The heatmap data domain */
  domain: Domain;
  /** The heatmap scale */
  heatmapScale: string;
  /** The colour map */
  colourMap: ColorMap;
}

/**
 * Represent surface data.
 */
interface CSurfaceData {
  /** The surface height values */
  heightValues: MP_NDArray;
  /** The surface data domain */
  domain: Domain;
  /** The surface data scale */
  surfaceScale: string;
  /** The surface colour map */
  colourMap: ColorMap;
}

/**
 * Represents table data.
 */
interface CTableData {
  /** The cell values */
  cellValues: MP_NDArray;
  /** The individual cell width */
  cellWidth: number;
  /** The table display parameters (optional) */
  displayParams?: TableDisplayParams;
}

interface CwiseContext {
  min: number;
  max: number;
}

const nanMinMax = cwise({
  funcName: 'nanMinMax',
  args: ['array'],
  pre: function (this: CwiseContext) {
    this.min = Number.POSITIVE_INFINITY;
    this.max = Number.NEGATIVE_INFINITY;
  },
  body: function (this: CwiseContext, a: number) {
    if (!Number.isNaN(a)) {
      if (a < this.min) {
        this.min = a;
      }
      if (a > this.max) {
        this.max = a;
      }
    }
  },
  post: function (this: CwiseContext): [number, number] {
    if (this.min > this.max) {
      throw Error('No valid numbers were compared');
    }
    return [this.min, this.max];
  },
}) as MinMax;

function appendLineData(
  line: LineData | undefined,
  newPoints: LineData | null | undefined
): LineData {
  if (newPoints === undefined || newPoints === null) {
    if (line === undefined) {
      throw Error('Cannot call with both arguments falsy');
    }
    return line;
  }
  if (line === undefined) {
    return newPoints;
  }
  let x: NDT;
  const xLength = newPoints.x.size;
  const yLength = newPoints.y.size;
  if (xLength === yLength || xLength === yLength + 1) {
    // second clause for histogram edge values
    x = concatRows([line.x, newPoints.x]) as NDT;
  } else {
    console.log(
      `x ({$xLength}) and y ({$yLength}) axes must be same length`,
      newPoints
    );
    return line;
  }
  const y = concatRows([line.y, newPoints.y]) as NDT;
  const xDomain = nanMinMax(x);
  const yDomain = [
    Math.min(line.yDomain[0], newPoints.yDomain[0]),
    Math.max(line.yDomain[1], newPoints.yDomain[1]),
  ] as Domain;
  return {
    key: line.key,
    lineParams: line.lineParams,
    defaultIndices: line.defaultIndices,
    x,
    xDomain,
    y,
    yDomain,
  };
}

function calculateMultiXDomain(multilineData: LineData[]): Domain {
  const mins = multilineData.map((l) => l.xDomain[0]);
  const maxs = multilineData.map((l) => l.xDomain[1]);
  if (mins.length == 1) {
    return [mins[0], maxs[0]];
  }
  return [Math.min(...mins), Math.max(...maxs)];
}

function calculateMultiYDomain(multilineData: LineData[]): Domain {
  const mins = multilineData.map((l) => l.yDomain[0]);
  const maxs = multilineData.map((l) => l.yDomain[1]);
  if (mins.length == 1) {
    return [mins[0], maxs[0]];
  }
  return [Math.min(...mins), Math.max(...maxs)];
}

function createImageData(
  data: CImageData | CHeatmapData
): ImageData | HeatmapData {
  const ii = data.values;
  const i = createNdArray(ii);
  if (_isHeatmapData(data)) {
    const hmData = data as CHeatmapData;
    return {
      domain: hmData.domain,
      heatmapScale: hmData.heatmapScale as ColorScaleType,
      colourMap: hmData.colourMap ?? undefined,
      aspect: hmData.aspect ?? undefined,
      values: i[0],
    };
  } else {
    return {
      ...data,
      aspect: data.aspect ?? undefined,
      values: i[0],
    };
  }
}

function createSurfaceData(data: CSurfaceData): SurfaceData {
  const ii = data.heightValues;
  const i = createNdArray(ii);
  return {
    ...data,
    surfaceScale: (data.surfaceScale as ColorScaleType) ?? undefined,
    heightValues: i[0],
  };
}

function createTableData(data: CTableData): TableData {
  const ii = data.cellValues;
  const i = createNdArray(ii);
  return {
    ...data,
    displayParams: data.displayParams ?? undefined,
    cellValues: i[0],
  };
}

function createPlotConfig(data: CPlotConfig): PlotConfig {
  let x = undefined;
  let y = undefined;
  if (data?.xValues != undefined) {
    const xArray = createNdArray(data.xValues);
    x = xArray[0];
  }
  if (data?.yValues != undefined) {
    const yArray = createNdArray(data.yValues);
    y = yArray[0];
  }
  return {
    ...data,
    xValues: x,
    yValues: y,
  };
}

function createLineData(data: CLineData): LineData | null {
  const xi = data.x;
  const x = createNdArray(xi, true);
  const yi = data.y;
  const y = createNdArray(yi, true);

  if (y[0].size == 0) {
    return null;
  }

  return {
    key: data.key,
    lineParams: data.lineParams,
    x: x[0],
    xDomain: x[1],
    y: y[0],
    yDomain: y[1],
  };
}

function createScatterData(data: CScatterData): ScatterData {
  const ii = data.pointValues;
  const i = createNdArray(ii);
  const xi = data.x;
  const x = createNdArray(xi);
  const yi = data.y;
  const y = createNdArray(yi);

  return {
    ...data,
    x: x[0],
    y: y[0],
    pointValues: i[0],
  };
}

type NdArrayMinMax = [NDT, Domain];

function createNdArray(a: MP_NDArray, minmax = false): NdArrayMinMax {
  if (a.shape.length === 0 || a.shape[0] === 0) {
    return [ndarray(new Int8Array()), [0, 0]] as NdArrayMinMax;
  }
  const dtype = a.dtype;
  if (dtype === '<i8' || dtype === '<u8') {
    if (!minmax) {
      const ba: BigInt64Array | BigUint64Array =
        dtype === '<i8'
          ? new BigInt64Array(a.data)
          : new BigUint64Array(a.data);
      const f = new Float64Array(ba);
      return [ndarray(f, a.shape), [0, 0]] as NdArrayMinMax;
    }
    const limit = BigInt(2) ** BigInt(64);
    const mb: [bigint, bigint] = [limit, -limit];
    const minMax = function (e: bigint): void {
      if (e < mb[0]) {
        mb[0] = e;
      }
      if (e > mb[1]) {
        mb[1] = e;
      }
    };
    let ba: BigInt64Array | BigUint64Array;
    if (dtype === '<i8') {
      const bi = new BigInt64Array(a.data);
      bi.forEach(minMax);
      ba = bi;
    } else {
      const bu = new BigUint64Array(a.data);
      bu.forEach(minMax);
      ba = bu;
    }
    const ptp = mb[1] - mb[0];
    if (mb[0] < -limit || mb[1] > limit) {
      throw Error(
        'Extrema of 64-bit integer array are too large to represent as float 64'
      );
    }
    if (ptp > Number.MAX_SAFE_INTEGER) {
      console.warn(
        '64-bit integer array has range too wide to preserve precision'
      );
    }
    const f = new Float64Array(ba);
    return [
      ndarray(f, a.shape),
      [Number(mb[0]), Number(mb[1])],
    ] as NdArrayMinMax;
  }

  let b: TypedArray;
  switch (dtype) {
    case '|i1':
      b = new Int8Array(a.data);
      break;
    case '<i2':
      b = new Int16Array(a.data);
      break;
    case '<i4':
      b = new Int32Array(a.data);
      break;
    case '|u1':
      b = new Uint8Array(a.data);
      break;
    case '<u2':
      b = new Uint16Array(a.data);
      break;
    case '<u4':
      b = new Uint32Array(a.data);
      break;
    case '<f4':
      b = new Float32Array(a.data);
      break;
    default:
    case '<f8':
      b = new Float64Array(a.data);
      break;
  }
  const nd = ndarray(b, a.shape);
  return [nd, minmax ? nanMinMax(nd) : [0, 0]] as NdArrayMinMax;
}

function _isHeatmapData(
  obj: CImageData | CHeatmapData | ImageData | HeatmapData
): boolean {
  return 'domain' in obj && 'heatmapScale' in obj;
}

function isHeatmapData(obj: ImageData | HeatmapData): boolean {
  return _isHeatmapData(obj);
}

function getAspectType(aspect: Aspect): string {
  if (aspect === 'equal' || aspect === 'auto') {
    return aspect;
  } else {
    return 'number';
  }
}

function isNumber(value: string): [boolean, number] {
  const n = parseFloat(value);
  return [Number.isFinite(n), n];
}

function isValidNumber(
  value: string,
  lower: number, // inclusive, >=
  upper: number, // exclusive <
  upperInclusive?: boolean
): [boolean, number] {
  const n = parseFloat(value);
  return [
    Number.isFinite(n) &&
      n >= lower &&
      (upperInclusive ? n <= upper : n < upper),
    n,
  ];
}

function isValidPositiveNumber(
  value: string,
  upper: number, // exclusive <
  upperInclusive?: boolean
): [boolean, number] {
  const n = parseFloat(value);
  return [
    Number.isFinite(n) && n > 0 && (upperInclusive ? n <= upper : n < upper),
    n,
  ];
}

function isValidPointSize(value: string, lineOn: boolean): [boolean, number] {
  const n = parseFloat(value);
  const numberIsValid: boolean =
    Number.isFinite(n) && n >= 0 && !(n === 0 && !lineOn);
  return [numberIsValid, n];
}

function createInteractionsConfig(
  mode: InteractionModeType
): DefaultInteractionsConfig {
  const isPan = mode === InteractionModeType.panAndWheelZoom;
  const isZoom = mode === InteractionModeType.selectToZoom;
  return {
    pan: isPan ? ({} as PanProps) : false,
    zoom: isPan ? ({} as ZoomProps) : false,
    xAxisZoom: isPan ? ({} as XAxisZoomProps) : false,
    yAxisZoom: isPan ? ({} as YAxisZoomProps) : false,
    selectToZoom: isZoom ? ({ modifierKey: [] } as SelectToZoomProps) : false,
    xSelectToZoom: isZoom
      ? ({ modifierKey: 'Alt' } as Omit<AxialSelectToZoomProps, 'axis'>)
      : false,
    ySelectToZoom: isZoom
      ? ({ modifierKey: 'Shift' } as Omit<AxialSelectToZoomProps, 'axis'>)
      : false,
  } as DefaultInteractionsConfig;
}

type NumArray = number[] | TypedArray;

interface HistogramCounts {
  /** count in bins */
  values: NumArray;
  /** edge values in domain */
  bins: NumArray;
}

/**
 * Create histogram from given data
 * @param data data
 * @param domain optional limits
 * @returns histogram
 */
function calculateHistogramCounts(
  data: TypedArray | undefined,
  domain?: Domain
): HistogramCounts | undefined {
  if (data && data.length != 0) {
    const localBin = bin();
    const localScale =
      domain === undefined ? null : scaleLinear().domain(domain).nice();
    const maxEdges = data.length;
    let edges;
    if (localScale !== null && maxEdges > 0) {
      edges = localScale.ticks(Math.min(maxEdges, 20));
      localBin.thresholds(edges);
    }
    const hist = localBin(data);
    const lengths = hist.map((b) => b.length);
    if (edges === undefined) {
      const nEdges = hist.map((b) => b.x0);
      nEdges.push(hist[hist.length - 1].x1);
      edges = nEdges.filter((e) => {
        return e !== undefined;
      }) as number[];
      if (edges.length === 0 && lengths.length === 1) {
        lengths.pop();
      }
    }

    return {
      values: lengths,
      bins: edges,
    };
  }
  return undefined;
}

/**
 * Create histogram from given data
 * @param data data
 * @param _domain optional limits
 * @returns histogram
 */
function calculateHistogramCounts2(data: NDT, _domain?: Domain) {
  const shape = data.shape;
  const hp = createSingleChannelHistogram(
    data.data,
    shape[1],
    shape[0]
  ) as Promise<TypedArray>;
  const mm = nanMinMax(data);
  const edges = (linspace(zeros([256 + 1], 'float32'), mm[0], mm[1]) as NDT)
    .data;

  return hp
    .then((h) => {
      return {
        values: h,
        bins: edges,
      } as HistogramCounts;
    })
    .catch((e) => {
      console.log('Could not calculate histogram:', e);
      return undefined;
    }) as Promise<HistogramCounts>;
}

/**
 * Create histogram parameters
 * @param data
 * @param domain
 * @param colorMap
 * @param invertColorMap
 * @returns histogram parameters
 */
function createHistogramParams(
  data: NDT,
  domain: Domain,
  colorMap: ColorMap,
  invertColorMap: boolean
) {
  const hcp = calculateHistogramCounts2(data, domain);
  return hcp.then((hc) => {
    return { ...hc, colorMap, invertColorMap };
  }) as Promise<HistogramParams>;
}

/**
 * Measure time of interaction
 */
function measureInteraction() {
  const startTimestamp = performance.now();
  return {
    end() {
      const time = performance.now() - startTimestamp;
      console.log(`The interaction took ${time}ms`);
      return time;
    },
  };
}

enum InteractionModeType {
  panAndWheelZoom = 'panAndWheelZoom',
  selectToZoom = 'selectToZoom',
  selectRegion = 'selectRegion',
}

export {
  appendLineData,
  calculateMultiXDomain,
  calculateMultiYDomain,
  createPlotConfig,
  createLineData,
  createImageData,
  createScatterData,
  createSurfaceData,
  createTableData,
  calculateHistogramCounts,
  createHistogramParams,
  createInteractionsConfig,
  getAspectType,
  InteractionModeType,
  isHeatmapData,
  isNumber,
  isValidNumber,
  isValidPointSize,
  isValidPositiveNumber,
  measureInteraction,
  nanMinMax,
};

export type {
  CPlotConfig,
  CLineData,
  CHeatmapData,
  CImageData,
  CScatterData,
  CSurfaceData,
  CTableData,
  HistogramCounts,
  MP_NDArray,
};
