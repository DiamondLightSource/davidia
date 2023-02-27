import ndarray from 'ndarray';
import cwise from 'cwise';
import { bin } from 'd3-array';
import {
  AxialSelectToZoomProps,
  DefaultInteractionsConfig,
  HistogramParams,
  PanProps,
  SelectToZoomProps,
  XAxisZoomProps,
  YAxisZoomProps,
  ZoomProps,
} from '@h5web/lib';

type MinMax = (x: NdArray<TypedArray>) => [number, number];

const nanMinMax = cwise({
  funcName: 'nanMinMax',
  args: ['array'],
  pre: function () {
    this.min = Number.POSITIVE_INFINITY;
    this.max = Number.NEGATIVE_INFINITY;
  },
  body: function (a: number) {
    if (!Number.isNaN(a)) {
      if (a < this.min) {
        this.min = a;
      }
      if (a > this.max) {
        this.max = a;
      }
    }
  },
  post: function (): [number, number] {
    if (this.min > this.max) {
      throw Error('No valid numbers were compared');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return [this.min, this.max];
  },
}) as MinMax;

type LinSpace = (
  x: NdArray<TypedArray>,
  b: number,
  e: number
) => NdArray<TypedArray>;
function addIndices(line: DLineData): DLineData {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (line.x === undefined || line.x.size === 0) {
    console.log('creating x indices');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const linspace = require('ndarray-linspace') as LinSpace;
    const yData = line.y;
    const yLength = yData.size;
    const emptyArray = ndarray(new Int32Array(yLength), [yLength]);
    const x = linspace(emptyArray, 0, yLength - 1);
    const dx = [0, yLength - 1];
    return {
      color: line.color,
      x: x,
      dx: dx,
      y: yData,
      dy: line.dy,
      line_on: line.line_on,
      point_size: line.point_size,
      default_indices: true,
    } as DLineData;
  }
  return line;
}

type Con = (a: NdArray<TypedArray>[]) => NdArray<TypedArray>;
function appendDLineData(
  line: DLineData | undefined,
  newPoints: DLineData | null | undefined
): DLineData {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const con = require('ndarray-concat-rows') as Con;
  if (newPoints === undefined || newPoints === null) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (line === undefined) {
      throw Error('Cannot call with both arguments falsy');
    }

    return line;
  }
  if (line === undefined) {
    return addIndices(newPoints);
  }
  let x: NdArray<TypedArray>;
  if (!line.default_indices) {
    const xLength = newPoints.x.size;
    const yLength = newPoints.y.size;
    if (xLength === yLength || xLength === yLength + 1) {
      // second clause for histogram edge values
      x = con([line.x, newPoints.x]);
    } else {
      console.log(
        `x ({$xLength}) and y ({$yLength}) axes must be same length`,
        newPoints
      );
      return line;
    }
  } else {
    const len = line.y.size + newPoints.y.size;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const linspace = require('ndarray-linspace') as LinSpace;
    x = linspace(ndarray(new Uint32Array(len), [len]), 0, len - 1);
    if (ndarray([]).shape[0] !== 0) {
      console.log('Ignoring supplied x axis data and using calculated indices');
    }
  }
  const y = con([line.y, newPoints.y]);
  const dx = nanMinMax(x);
  const dy = [
    Math.min(line.dy[0], newPoints.dy[0]),
    Math.max(line.dy[1], newPoints.dy[1]),
  ];
  return {
    color: line.color,
    x: x,
    dx: dx,
    y: y,
    dy: dy,
    line_on: line.line_on,
    point_size: line.point_size,
    default_indices: line.default_indices,
  } as DLineData;
}

function calculateMultiXDomain(multilineData: DLineData[]): Domain {
  console.log('calculating multi x domain ', multilineData);
  const mins = multilineData.map((l) => l.dx[0]);
  const maxs = multilineData.map((l) => l.dx[1]);
  if (mins.length == 1) {
    return [mins[0], maxs[0]];
  }
  return [Math.min(...mins), Math.max(...maxs)];
}

function calculateMultiYDomain(multilineData: DLineData[]): Domain {
  console.log('calculating multi y domain ', multilineData);
  const mins = multilineData.map((l) => l.dy[0]);
  const maxs = multilineData.map((l) => l.dy[1]);
  if (mins.length == 1) {
    return [mins[0], maxs[0]];
  }
  return [Math.min(...mins), Math.max(...maxs)];
}

function createDImageData(
  data: ImageData | HeatmapData
): DImageData | DHeatmapData {
  const ii = data.values;
  const i = createNdArray(ii);
  if (isHeatmapData(data)) {
    const hmData = data as HeatmapData;
    return {
      key: hmData.key,
      values: i[0],
      aspect: hmData.aspect ?? undefined,
      domain: hmData.domain,
      heatmap_scale: hmData.heatmap_scale,
      colorMap: hmData.colorMap,
    } as DHeatmapData;
  } else {
    return {
      key: data.key,
      values: i[0],
      aspect: data.aspect ?? undefined,
    } as DImageData;
  }
}

function createDSurfaceData(data: SurfaceData): DSurfaceData {
  const ii = data.values;
  const i = createNdArray(ii);
  const suData = data;
  return {
    key: suData.key,
    values: i[0],
    domain: suData.domain,
    surface_scale: suData.surface_scale,
    colorMap: suData.colorMap,
  } as DSurfaceData;
}

function createDTableData(data: TableData): DTableData {
  const ii = data.dataArray;
  const i = createNdArray(ii);
  return {
    key: data.key,
    dataArray: i[0],
    cellWidth: data.cellWidth,
    displayParams: data.displayParams,
  } as DTableData;
}

function createDAxesParameters(data: AxesParameters): DAxesParameters {
  let x = undefined;
  let y = undefined;
  if (data.x_values != undefined) {
    const xArray = createNdArray(data.x_values);
    x = xArray[0];
  }
  if (data.y_values != undefined) {
    const yArray = createNdArray(data.y_values);
    y = yArray[0];
  }
  return {
    xLabel: data.x_label,
    yLabel: data.y_label,
    xScale: data.x_scale,
    yScale: data.y_scale,
    title: data.title,
    xValues: x,
    yValues: y,
  } as DAxesParameters;
}

function createDLineData(data: LineData): DLineData | null {
  const xi = data.x;
  const x = createNdArray(xi);
  const yi = data.y;
  const y = createNdArray(yi);

  if (y[0].size == 0) {
    return null;
  }
  return {
    key: data.key,
    color: data.color,
    x: x[0],
    dx: x[1],
    y: y[0],
    dy: y[1],
    line_on: data.line_on,
    point_size: data.point_size,
  } as DLineData;
}

function createDScatterData(data: ScatterData): DScatterData {
  const ii = data.dataArray;
  const i = createNdArray(ii);
  const xi = data.xData;
  const x = createNdArray(xi);
  const yi = data.yData;
  const y = createNdArray(yi);

  return {
    key: data.key,
    xData: x[0],
    yData: y[0],
    dataArray: i[0],
    domain: data.domain,
  } as DScatterData;
}

function createNdArray(a: MP_NDArray): NdArrayMinMax {
  if (a.shape.length === 0 || a.shape[0] === 0) {
    return [ndarray(new Int8Array()), [0, 0]] as NdArrayMinMax;
  }
  const dtype = a.dtype;
  if (dtype === '<i8' || dtype === '<u8') {
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
  return [nd, nanMinMax(nd)] as NdArrayMinMax;
}

function isHeatmapData(
  obj: ImageData | HeatmapData | DImageData | DHeatmapData
): boolean {
  return 'domain' in obj && 'heatmap_scale' in obj;
}

function getAspectType(aspect: Aspect): string {
  if (aspect === 'equal' || aspect === 'auto') {
    return aspect;
  } else {
    return 'number';
  }
}

function isValidNumber(
  value: string,
  lower: number, // inclusive, >=
  upper: number // exclusive <
): [boolean, number] {
  const n = parseFloat(value);
  return [Number.isFinite(n) && n >= lower && n < upper, n];
}

function isValidPositiveNumber(
  value: string,
  upper: number // exclusive <
): [boolean, number] {
  const n = parseFloat(value);
  return [Number.isFinite(n) && n > 0 && n < upper, n];
}

function createInteractionsConfig(
  mode: InteractionModeType
): DefaultInteractionsConfig {
  return {
    pan: mode === 'panAndWheelZoom' ? ({} as PanProps) : false,
    zoom: mode === 'panAndWheelZoom' ? ({} as ZoomProps) : false,
    xAxisZoom: mode === 'panAndWheelZoom' ? ({} as XAxisZoomProps) : false,
    yAxisZoom: mode === 'panAndWheelZoom' ? ({} as YAxisZoomProps) : false,
    selectToZoom:
      mode === 'selectToZoom'
        ? ({ modifierKey: [] } as SelectToZoomProps)
        : false,
    xSelectToZoom:
      mode === 'selectToZoom'
        ? ({ modifierKey: 'Alt' } as Omit<AxialSelectToZoomProps, 'axis'>)
        : false,
    ySelectToZoom:
      mode === 'selectToZoom'
        ? ({ modifierKey: 'Shift' } as Omit<AxialSelectToZoomProps, 'axis'>)
        : false,
  } as DefaultInteractionsConfig;
}

function createHistogramParams(
  values: TypedArray | undefined
): HistogramParams | undefined {
  let histogramParams = undefined;
  if (values && values.length != 0) {
    const hist = bin()(values);
    const lengths = [];
    const bins = [];
    for (const arr of hist) {
      lengths.push(arr.length);
      bins.push(arr.x0);
    }
    bins.push(hist.slice(-1)[0].x1);
    histogramParams = {
      values: lengths,
      bins: bins,
    } as HistogramParams;
  }
  return histogramParams;
}

export {
  addIndices,
  appendDLineData,
  calculateMultiXDomain,
  calculateMultiYDomain,
  createDAxesParameters,
  createDLineData,
  createDImageData,
  createDScatterData,
  createDSurfaceData,
  createDTableData,
  createHistogramParams,
  createInteractionsConfig,
  getAspectType,
  isHeatmapData,
  isValidNumber,
  isValidPositiveNumber,
  nanMinMax,
};
