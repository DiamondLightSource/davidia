/** eslint-disable @typescript-eslint/no-unsafe-assignment */
import ndarray from 'ndarray';

import type { TypedArray } from 'ndarray';
import cwise from 'cwise';

type MinMax = (x: NdArray) => [number, number];

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

type LinSpace = (x: NdArray, b: number, e: number) => NdArray;
function addIndices(line: DLineData): DLineData {
  if (line.x === undefined || (line.x as NdArray).size === 0) {
    console.log('creating x indices');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const linspace = require('ndarray-linspace') as LinSpace;
    const yData: NdArray = line.y as NdArray;
    const yLength = yData.size;
    const emptyArray = ndarray([], [yLength]);
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

type Con = (a: NdArray[]) => NdArray;
function appendDLineData(
  line: DLineData | undefined,
  newPoints: DLineData | null | undefined
): DLineData {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const con = require('ndarray-concat-rows') as Con;
  if (newPoints === undefined || newPoints === null) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return line!;
  }
  if (line === undefined) {
    return addIndices(newPoints);
  }
  let x: NdArray;
  if (!line.default_indices) {
    const xLength = (newPoints.x as NdArray).size;
    const yLength = (newPoints.y as NdArray).size;
    if (xLength === yLength || xLength === yLength + 1) {
      // second clause for histogram edge values
      x = con([line.x as NdArray, newPoints.x as NdArray]);
    } else {
      console.log(
        `x ({$xLength}) and y ({$yLength}) axes must be same length`,
        newPoints
      );
      return line;
    }
  } else {
    const len = (line.y as NdArray).size + (newPoints.y as NdArray).size;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const linspace = require('ndarray-linspace') as LinSpace;
    x = linspace(ndarray([], [len]), 0, len - 1);
    if (ndarray([]).shape[0] !== 0) {
      console.log('Ignoring supplied x axis data and using calculated indices');
    }
  }
  const y = con([line.y, newPoints.y]); // eslint-disable-line
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
      heatmap_scale: hmData.heatmap_scale,
      domain: hmData.domain,
      values: i[0] as NdArray,
    } as DHeatmapData;
  } else {
    return { key: data.key, values: i[0] as NdArray } as DImageData;
  }
}

function createDTableData(data: TableData): DTableData {
  const ii = data.dataArray;
  const i = createNdArray(ii);
  return {
    key: data.key,
    dataArray: i[0] as NdArray,
    cellWidth: data.cellWidth,
    displayParams: data.displayParams,
  } as DTableData;
}

function createDAxesParameters(data: AxesParameters): DAxesParameters {
  let x = undefined;
  let y = undefined;
  if (data.x_values != undefined) {
    const xArray = createNdArray(data.x_values);
    x = xArray[0] as NdArray;
  }
  if (data.y_values != undefined) {
    const yArray = createNdArray(data.y_values);
    y = yArray[0] as NdArray;
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

  if ((y[0] as NdArray).size == 0) {
    return null;
  }
  return {
    key: data.key,
    color: data.color,
    x: x[0] as NdArray,
    dx: x[1],
    y: y[0] as NdArray,
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
    xData: x[0] as NdArray,
    yData: y[0] as NdArray,
    dataArray: i[0] as NdArray,
    domain: data.domain,
  } as DScatterData;
}

function createNdArray(a: MP_NDArray): NdArrayMinMax {
  if (a.shape.length === 0 || a.shape[0] === 0) {
    return [ndarray([]), [0, 0]] as NdArrayMinMax;
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

function isHeatmapData(obj: HeatmapData | ImageData | DImageData): boolean {
  return 'domain' in obj && 'heatmap_scale' in obj;
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
  createDTableData,
  isHeatmapData,
  nanMinMax,
};
