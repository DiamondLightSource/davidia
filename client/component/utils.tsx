import ndarray from 'ndarray';

import type {TypedArray} from 'ndarray';


const cwise = require('cwise');
const nanMinMax = cwise({
  args: ['array'],
  pre: function() {
    this.min = Number.POSITIVE_INFINITY;
    this.max = Number.NEGATIVE_INFINITY;
  },
  body: function(a: number) {
    if (!Number.isNaN(a)) {
      if (a < this.min) {
        this.min = a;
      }
      if (a > this.max) {
        this.max = a;
      }
    }
  },
  post: function() {
    if (this.min > this.max) {
      throw 'No valid numbers were compared';
    }
    return [this.min, this.max];
  }
});

function add_indices(line: DLineData): DLineData {
    if (line.x.data[0] === undefined) {
      console.log('creating x indices')
      var linspace = require('ndarray-linspace');
      const yLength = line.y.data.length;
      const emptyArray = ndarray([], [yLength]);
      const x = linspace(emptyArray, 0, yLength - 1);
      const dx = [Math.min(...x.data), Math.max(...x.data)]
      return {color:line.color, x:x, dx:dx, y:line.y, dy:line.dy,
        line_on:line.line_on, point_size:line.point_size, default_indices:true} as DLineData;
    }
    return line
   }

function appendDLineData(line: DLineData | undefined, newPoints: DLineData | null | undefined): DLineData {
    let con = require('ndarray-concat-rows')
    if (newPoints === undefined || newPoints === null) {
      return line as DLineData;
    }
    if (line === undefined) {
      return add_indices(newPoints);
    }
    let x: ndarray.NdArray<TypedArray>;
    if (!line.default_indices) {
      if (newPoints.x.data.length === newPoints.y.data.length) {
        x = con([line.x, newPoints.x]) as ndarray.NdArray<TypedArray>;
      } else {
        console.log('x and y axes must be same length ', newPoints)
        return line as DLineData;
      }
    } else {
      const len = line.y.data.length + newPoints.y.data.length;
      let linspace = require('ndarray-linspace');
      x = linspace(ndarray([], [len]), 0, len - 1) as ndarray.NdArray<TypedArray>;
      if (ndarray([]).shape[0] !== 0) {
        console.log('Ignoring supplied x axis data and using calculated indices')
      }
    }
    const y = con([line.y, newPoints.y]);
    let dx = nanMinMax(x);
    let dy = [Math.min(line.dy[0], newPoints.dy[0]), Math.max(line.dy[1], newPoints.dy[1])];
    return {color:line.color, x:x, dx:dx, y:y, dy:dy,
      line_on:line.line_on, point_size:line.point_size, default_indices:line.default_indices} as DLineData;
  };

function calculateMultiXDomain(multilineData: DLineData[]): [number, number] {
  console.log('calculating multi x domain ', multilineData);
  const mins = multilineData.map(l => l.dx[0]);
  const maxs = multilineData.map(l => l.dx[1]);
  if (mins.length == 1) {
    return [mins[0], maxs[0]];
  }
  return [Math.min(...mins), Math.max(...maxs)];
};


function calculateMultiYDomain(multilineData: DLineData[]): [number, number] {
  console.log('calculating multi y domain ', multilineData);
  const mins = multilineData.map(l => l.dy[0]);
  const maxs = multilineData.map(l => l.dy[1]);
  if (mins.length == 1) {
    return [mins[0], maxs[0]];
  }
  return [Math.min(...mins), Math.max(...maxs)];
};

function createDImageData (data: ImageData | HeatmapData): DImageData | DHeatmapData {
  const ii = data.values as MP_NDArray;
  const i = createNdArray(ii);
  if (isHeatmapData(data)) {
    let hmData = data as HeatmapData;
    return {key: hmData.key, heatmap_scale: hmData.heatmap_scale,
      domain: hmData.domain, values: i[0]} as DHeatmapData;
  } else {
    return {key: data.key, values: i[0]} as DImageData;
  }
};

function createDTableData(data: TableData): DTableData {
  const ii = data.dataArray as MP_NDArray;
  const i = createNdArray(ii);
  return {
    key: data.key,
    dataArray: i[0],
    cellWidth: data.cellWidth,
    displayParams: data.displayParams
  } as DTableData;
};

function createDAxesParameters(data: AxesParameters): DAxesParameters {
  let x = undefined;
  let y = undefined;
  if (data.x_values != undefined) {
    const xi = data.x_values as MP_NDArray;
    const xArray = createNdArray(xi);
    x = xArray[0].data;
  }
  if (data.y_values != undefined) {
    const yi = data.y_values as MP_NDArray;
    const yArray = createNdArray(yi);
    y = yArray[0].data;
  }
  return {xLabel: data.x_label, yLabel: data.y_label, xScale: data.x_scale as ScaleType, title: data.title,
    yScale: data.y_scale as ScaleType, xValues: x, yValues: y} as DAxesParameters;
};

function createDLineData(data: LineData): DLineData|null {
  const xi = data.x as MP_NDArray;
  const x = createNdArray(xi);
  const yi = data.y as MP_NDArray;
  const y = createNdArray(yi);

  if (y[0].size == 0) {
    return null;
  }
  return {key:data.key, color:data.color, x:x[0], dx:x[1], y:y[0], dy:y[1],
    line_on:data.line_on, point_size:data.point_size} as DLineData;
};

function createDScatterData(data: ScatterData): DScatterData {
  const ii = data.dataArray as MP_NDArray;
  const i = createNdArray(ii);
  const xi = data.xData as MP_NDArray;
  const x = createNdArray(xi);
  const yi = data.yData as MP_NDArray;
  const y = createNdArray(yi);

  return {key: data.key,
    xData: x[0],
    yData: y[0],
    dataArray: i[0],
    domain: data.domain
  } as DScatterData;
};

function createNdArray(a: MP_NDArray) : NdArrayMinMax {
  if (a.shape.length === 0 || a.shape[0] === 0) {
    return [ndarray([]), [0, 0]] as NdArrayMinMax;
  }
  const dtype = a.dtype;
  if (dtype === '<i8' || dtype === '<u8') {
    const limit = BigInt(2) ** BigInt(64);
    var mb: [bigint, bigint] = [limit, -limit];
    const minMax = function(e : bigint) : void {
      if (e < mb[0]) {
        mb[0] = e;
      }
      if (e > mb[1]) {
        mb[1] = e;
      }
    }
    var ba: BigInt64Array | BigUint64Array;
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
      throw "Extrema of 64-bit integer array are too large to represent as float 64";
    }
    if (ptp > Number.MAX_SAFE_INTEGER) {
      console.warn("64-bit integer array has range too wide to preserve precision");
    }
    const f = new Float64Array(ba);
    return [ndarray(f, a.shape), [Number(mb[0]), Number(mb[1])]] as NdArrayMinMax;
  }

  let b: TypedArray;
  switch (dtype) {
    case "|i1":
        b = new Int8Array(a.data);
        break;
      case "<i2":
        b = new Int16Array(a.data);
        break;
      case "<i4":
        b = new Int32Array(a.data);
        break;
      case "|u1":
        b = new Uint8Array(a.data);
        break;
      case "<u2":
        b = new Uint16Array(a.data);
        break;
      case "<u4":
        b = new Uint32Array(a.data);
        break;
      case "<f4":
        b = new Float32Array(a.data);
        break;
      default:
      case "<f8":
        b = new Float64Array(a.data);
        break;
  }
  const nd = ndarray(b, a.shape);
  return [nd, nanMinMax(nd)]  as NdArrayMinMax;
};

function isHeatmapData(obj : HeatmapData | ImageData | DImageData) : boolean {
    return ('domain' in obj && 'heatmap_scale' in obj);
  }

export {
    add_indices,
    appendDLineData,
    calculateMultiXDomain,
    calculateMultiYDomain,
    createDAxesParameters,
    createDLineData,
    createDImageData,
    createDScatterData,
    createDTableData,
    isHeatmapData,
    nanMinMax
};