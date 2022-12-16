import ndarray, { NdArray } from 'ndarray';
import type {TypedArray} from 'ndarray';
import {
  addIndices,
  appendDLineData,
  calculateMultiXDomain,
  calculateMultiYDomain,
  createDAxesParameters,
  createDImageData,
  createDLineData,
  createDScatterData,
  createDTableData,
  isHeatmapData,
  nanMinMax
} from './utils'



function isNumberArray(arr: any): boolean {
  if (Array.isArray(arr) && arr.length > 0 && arr.every((value) => {return typeof value === 'number'})) {
      return true;
    }
  return false;
}

function compare_objects(result: DLineData | DHeatmapData | DScatterData | DAxesParameters, expected: typeof result) {
  type T = keyof typeof expected;
  const keys = Object.keys(result) as T[];
  for (var k of keys) {
    if (isNumberArray(expected[k])) {
      const f = result[k];
      f.forEach((el, i) => {
        expect(el).toBeCloseTo(expected[k][i])
      });
    } else {
      expect(result[k]).toStrictEqual(expected[k])
    }
  };
 }

describe('checks isHeatmapData', () => {
  it.each([
    [{key: 'A', values: null, domain: [-3, 8], heatmap_scale: 'linear'}, true],
    [{key: 'B', values: null, domain: [4, 12]}, false],
    [{key: 'C', values: null, heatmap_scale: 'linear'}, false],
    [{key: 'D', values: null}, false],
  ])('calls isHeatmapData on %p expecting %p', (data: any, expected: boolean) => {
    expect(isHeatmapData(data)).toBe(expected);
  });
})

describe('checks nanMinMax', () => {
  it.each([
    [ndarray([2, 4]), [2, 4]],
    [ndarray([-4, 6, 12]), [-4, 12]],
    [ndarray([-3, -3, -3, -3]), [-3, -3]],
    [ndarray([NaN, 12, NaN, NaN]), [12, 12]],
    [ndarray([-7, NaN, 0]), [-7, 0]],
  ])('calls nanMinMax on %p expecting %p', (arr: NdArray<number[]>, expected: number[]) => {
      expect(nanMinMax(arr)).toStrictEqual(expected);
  });

  it('should throw if no valid numbers in array', () => {
    const errRegex = /No valid numbers were compared/;
    expect(() => nanMinMax(ndarray([NaN, NaN, NaN]))).toThrow(errRegex);
    expect(() => nanMinMax(ndarray([]))).toThrow(errRegex);
  });
})

describe('checks createDTableData', () => {
  const a =  {nd: true, dtype: "<u2", shape: [2, 3], data: new Uint16Array([10, 20, 30, 40, 50, 60]).buffer} as MP_NDArray;
  const b = ndarray(new Uint16Array([10, 20, 30, 40, 50, 60]), [2, 3]);
  it.each([
    [
      {key: 'A', dataArray: a, cellWidth: 4.5} as TableData,
      {key: 'A', dataArray: b, cellWidth: 4.5, displayParams: undefined} as DTableData
    ],
    [
      {key: 'B', dataArray: a, cellWidth: 5, displayParams: undefined} as TableData,
      {key: 'B', dataArray: b, cellWidth: 5, displayParams: undefined} as DTableData
    ],
    [
      {key: 'C', dataArray: a, cellWidth: 5, displayParams: {displayType: "scientific"}} as TableData,
      {key: 'C', dataArray: b, cellWidth: 5, displayParams: {displayType: "scientific"}} as DTableData
    ],
    [
      {key: 'D', dataArray: a, cellWidth: 5, displayParams: {displayType: "scientific", numberDigits: undefined}} as TableData,
      {key: 'D', dataArray: b, cellWidth: 5, displayParams: {displayType: "scientific", numberDigits: undefined}} as DTableData
    ],
    [
      {key: 'E', dataArray: a, cellWidth: 5, displayParams: {displayType: "standard", numberDigits: 6}} as TableData,
      {key: 'E', dataArray: b, cellWidth: 5, displayParams: {displayType: "standard", numberDigits: 6}} as DTableData
    ],
    [
      {key: 'F', dataArray: {nd: true, dtype: "<f4", shape: [3, 2], data: new Float32Array([-2.8, 14.1, -76, 0, 1, 12]).buffer}, cellWidth: 5} as TableData,
      {key: 'F', dataArray: ndarray(new Float32Array([-2.8, 14.1, -76, 0, 1, 12]), [3, 2]), cellWidth: 5, displayParams: undefined} as DTableData
    ],
    [
      {key: 'G', dataArray: {nd: false, dtype: "<f4", shape: [3], data: new Float32Array([-2.8, 14.1, -76]).buffer}, cellWidth: 5} as TableData,
      {key: 'G', dataArray: ndarray(new Float32Array([-2.8, 14.1, -76]), [3]), cellWidth: 5, displayParams: undefined} as DTableData
    ],
    [
      {key: 'H', dataArray: {nd: true, dtype: "<f4", shape: [0], data: new Float32Array([]).buffer}, cellWidth: 5} as TableData,
      {key: 'H', dataArray: ndarray([]), cellWidth: 5, displayParams: undefined} as DTableData
    ],
  ])('calls createDTableData on %p expecting %p', (data: TableData, expected: DTableData) => {
    expect(createDTableData(data)).toStrictEqual(expected);
  });
})

describe('checks createDScatterData', () => {
  const a =  {nd: true, dtype: "|i1", shape: [3], data: new Int8Array([-4, -2, 0]).buffer} as MP_NDArray;
  const b =  {nd: true, dtype: "|i1", shape: [3], data: new Int8Array([4, 8, 12]).buffer} as MP_NDArray;
  const c =  {nd: true, dtype: "<f4", shape: [3], data: new Float32Array([120, 19.1, -4.7]).buffer} as MP_NDArray;
  const d = ndarray(new Int8Array([-4, -2, 0]), [3]);
  const e = ndarray(new Int8Array([4, 8, 12]), [3]);
  const f = ndarray(new Float32Array([120, 19.1, -4.7]), [3]);
  it.each([
    [
      {key: 'A', xData: a, yData: b, dataArray: c, domain: [-4.7, 120]} as ScatterData,
      {key: 'A', xData: d, yData: e, dataArray: f, domain: [-4.7, 120]} as DScatterData
    ],
  ])('calls createDScatterData on %p expecting %p', (data: ScatterData, expected: DScatterData) => {
    expect(createDScatterData(data)).toStrictEqual(expected);
  });
})

describe('checks createDImageData', () => {
  it.each([
    [
      {
        key: 'A',
        values: {nd: true, dtype: "<u2", shape: [3, 2], data: new Uint16Array([10, 20, 30, 40, 50, 60]).buffer} as MP_NDArray
      } as ImageData,
      {
        key: 'A',
        values: ndarray(new Uint16Array([10, 20, 30, 40, 50, 60]), [3, 2])
      } as DImageData
    ],
    [
      {
        key: 'B',
        values: {nd: true, dtype: "<u2", shape: [3, 2], data: new Uint16Array([10, 20, 30, 40, 50, 60]).buffer} as MP_NDArray,
        domain: [10, 60],
        heatmap_scale: "log"
      } as HeatmapData,
      {
        key: 'B',
        values: ndarray(new Uint16Array([10, 20, 30, 40, 50, 60]), [3, 2]),
        domain: [10, 60],
        heatmap_scale: "log"
      } as DHeatmapData
    ],
  ])('calls createDImageData on %p expecting %p', (data: ImageData, expected: DImageData) => {
    expect(createDImageData(data)).toStrictEqual(expected);
  });
})

describe('checks createDLineData', () => {
  const a =  {nd: true, dtype: "<u2", shape: [3, 2], data: new Uint16Array([10, 20, 30, 40, 50, 60]).buffer} as MP_NDArray;
  const b =  {nd: true, dtype: "<f4", shape: [3, 2], data: new Float32Array([120, 19.1, -4, 0, 12, 5]).buffer} as MP_NDArray;
  const c =  {nd: true, dtype: "<f4", shape: [0], data: new Float32Array([]).buffer} as MP_NDArray;
  const d = ndarray(new Uint16Array([10, 20, 30, 40, 50, 60]), [3, 2]);
  const e = ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5]), [3, 2]);

  it.each([
    [
      { key: 'A', color: "red", x: a, y: b, line_on: false, point_size: 6 } as LineData,
      {
        key: 'A',
        color: "red",
        x: d,
        dx: [10, 60],
        y: e,
        dy: [-4, 120],
        line_on: false,
        point_size: 6
      } as DLineData
    ],
    [
      {
        key: 'B',
        color: "red",
        x: {nd: true, dtype: "<u2", shape: [0], data: new Uint16Array([]).buffer} as MP_NDArray,
        y: a,
        line_on: false,
        point_size: 6
      } as LineData,
      {
        key: 'B',
        color: "red",
        x: ndarray([], [0]),
        dx: [0, 0],
        y: d,
        dy: [10, 60],
        line_on: false,
        point_size: 6
      } as DLineData
    ],
  ])('calls createDLineData on %p expecting %p', (data: LineData, expected: DLineData) => {
    const result = createDLineData(data) as DLineData;
    compare_objects(result, expected)
  });
  test('calls createDLineData expecting null', () => {
    const data = {
      key: 'B',
      color: "red",
      x: a,
      y: c,
      line_on: false,
      point_size: 6
    } as LineData
    const result = createDLineData(data) as DLineData;
    expect(result).toBe(null);
  });
});

describe('checks createDAxesParameters', () => {
  const a =  {nd: true, dtype: "<u2", shape: [6, 1], data: new Uint16Array([10, 20, 30, 40, 50, 60]).buffer} as MP_NDArray;
  const b =  {nd: true, dtype: "<f4", shape: [6, 1], data: new Float32Array([120, 19.1, -4, 0, 12, 5]).buffer} as MP_NDArray;
  const c =  {nd: true, dtype: "<f4", shape: [0], data: new Float32Array([]).buffer} as MP_NDArray;
  const d = new Uint16Array([10, 20, 30, 40, 50, 60]);
  const e = new Float32Array([120, 19.1, -4, 0, 12, 5]);

  it.each([
    [
      {
        x_label: 'x axis',
        y_label: 'y axis',
        x_scale: 'linear',
        y_scale: 'log',
        x_values: a,
        y_values: b,
        title: 'plot A'
      } as AxesParameters,
      {
        xLabel: 'x axis',
        yLabel: 'y axis',
        xScale: 'linear',
        yScale: 'log',
        xValues: d,
        yValues: e,
        title: 'plot A'
      } as DAxesParameters,
    ],
    [
      {
        x_label: 'x axis',
        y_label: 'y axis',
        x_scale: 'linear',
        y_scale: 'log',
        x_values: c,
        y_values: b,
        title: 'plot B'
      } as AxesParameters,
      {
        xLabel: 'x axis',
        yLabel: 'y axis',
        xScale: 'linear',
        yScale: 'log',
        xValues: [],
        yValues: e,
        title: 'plot B'
      } as DAxesParameters,
    ],
    [
      {
        y_label: 'y axis',
        x_scale: 'linear',
        y_values: b,
      } as AxesParameters,
      {
        xLabel: undefined,
        yLabel: 'y axis',
        xScale: 'linear',
        yScale: undefined,
        xValues: undefined,
        yValues: e,
        title: undefined
      } as DAxesParameters,
    ],
    [
      {
        x_label: 'x axis',
        y_label: undefined,
        x_values: a,
        y_values: b,
        title: 'plot D'
      } as AxesParameters,
      {
        xLabel: 'x axis',
        yLabel: undefined,
        xScale: undefined,
        yScale: undefined,
        xValues: d,
        yValues: e,
        title: 'plot D'
      } as DAxesParameters,
    ],
    [
      {} as AxesParameters,
      {
        xLabel: undefined,
        yLabel: undefined,
        xScale: undefined,
        yScale: undefined,
        xValues: undefined,
        yValues: undefined,
        title: undefined
      } as DAxesParameters,
    ],
  ])('calls createDImageData on %p expecting %p', (data: AxesParameters, expected: DAxesParameters) => {
    const result = createDAxesParameters(data) as DLineData;
    compare_objects(result, expected)
  });
})

describe('checks createDAxesParameters', () => {
  const a =  {nd: true, dtype: "<u2", shape: [6, 1], data: new Uint16Array([10, 20, 30, 40, 50, 60]).buffer} as MP_NDArray;
  const b =  {nd: true, dtype: "<f4", shape: [6, 1], data: new Float32Array([120, 19.1, -4, 0, 12, 5]).buffer} as MP_NDArray;
  const c =  {nd: true, dtype: "<f4", shape: [0], data: new Float32Array([]).buffer} as MP_NDArray;
  const d = new Uint16Array([10, 20, 30, 40, 50, 60]);
  const e = new Float32Array([120, 19.1, -4, 0, 12, 5]);

  it.each([
    [
      {
        x_label: 'x axis',
        y_label: 'y axis',
        x_scale: 'linear',
        y_scale: 'log',
        x_values: a,
        y_values: b,
        title: 'plot A'
      } as AxesParameters,
      {
        xLabel: 'x axis',
        yLabel: 'y axis',
        xScale: 'linear',
        yScale: 'log',
        xValues: d,
        yValues: e,
        title: 'plot A'
      } as DAxesParameters,
    ],
    [
      {
        x_label: 'x axis',
        y_label: 'y axis',
        x_scale: 'linear',
        y_scale: 'log',
        x_values: c,
        y_values: b,
        title: 'plot B'
      } as AxesParameters,
      {
        xLabel: 'x axis',
        yLabel: 'y axis',
        xScale: 'linear',
        yScale: 'log',
        xValues: [],
        yValues: e,
        title: 'plot B'
      } as DAxesParameters,
    ],
    [
      {
        y_label: 'y axis',
        x_scale: 'linear',
        y_values: b,
      } as AxesParameters,
      {
        xLabel: undefined,
        yLabel: 'y axis',
        xScale: 'linear',
        yScale: undefined,
        xValues: undefined,
        yValues: e,
        title: undefined
      } as DAxesParameters,
    ],
    [
      {
        x_label: 'x axis',
        y_label: undefined,
        x_values: a,
        y_values: b,
        title: 'plot D'
      } as AxesParameters,
      {
        xLabel: 'x axis',
        yLabel: undefined,
        xScale: undefined,
        yScale: undefined,
        xValues: d,
        yValues: e,
        title: 'plot D'
      } as DAxesParameters,
    ],
    [
      {} as AxesParameters,
      {
        xLabel: undefined,
        yLabel: undefined,
        xScale: undefined,
        yScale: undefined,
        xValues: undefined,
        yValues: undefined,
        title: undefined
      } as DAxesParameters,
    ],
  ])('calls createDAxesParameters on %p expecting %p', (data: AxesParameters, expected: DAxesParameters) => {
    const result = createDAxesParameters(data) as DLineData;
    compare_objects(result, expected)
  });
})

describe('checks calculateMultiXDomain', () => {
  const a = {
    key: 'A',
    x: new Uint16Array([10, 20, 30, 40, 50, 60]),
    dx: [10, 60],
    y: new Float32Array([120, 19.1, -4, 0, 12, 5]),
    dy: [-4, 120],
    line_on: false,
  }
  const b = {
    key: 'B',
    x: new Uint16Array([0, 0, 0, 0, 0, 0]),
    dx: [0, 0],
    y: new Float32Array([120, 19.1, -4, 0, 12, 5]),
    dy: [-4, 120],
    line_on: false,
  }

  it.each([
    [
      [a, a, a] as DLineData[],
      [10, 60] as [number, number]
    ],
    [
      [b, b, b] as DLineData[],
      [0, 0] as [number, number]
    ],
    [
      [b, a, b] as DLineData[],
      [0, 60] as [number, number]
    ],
  ])('calls calculateMultiXDomain on %p expecting %p', (data: DLineData[], expected: [number, number]) => {
    const result = calculateMultiXDomain(data);
      result.forEach((el, i) => {
        expect(el).toBeCloseTo(expected[i])
      });
  });
})

describe('checks calculateMultiYDomain', () => {
  const a = {
    key: 'A',
    x: new Uint16Array([10, 20, 30, 40, 50, 60]),
    dx: [10, 60],
    y: new Float32Array([120, 19.1, -4, 0, 12, 5]),
    dy: [-4, 120],
    line_on: false,
  }
  const b = {
    key: 'B',
    x: new Uint16Array([0, 0, 0, 0, 0, 0]),
    dx: [0, 0],
    y: new Uint16Array([0, 0, 0, 0, 0, 0]),
    dy: [0, 0],
    line_on: false,
  }

  it.each([
    [
      [a, a, a] as DLineData[],
      [-4, 120] as [number, number]
    ],
    [
      [b, b, b] as DLineData[],
      [0, 0] as [number, number]
    ],
    [
      [b, a, b] as DLineData[],
      [-4, 120] as [number, number]
    ],
  ])('calls calculateMultiYDomain on %p expecting %p', (data: DLineData[], expected: [number, number]) => {
    const result = calculateMultiYDomain(data);
    expect(result).toMatchCloseTo(expected);
  });
})

describe('checks addIndices', () => {
  it.each([
    [
      {
        key: 'A',
        x: ndarray([]),
        dx: [0, 0],
        y: ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5])),
        dy: [-4, 120],
        line_on: false,
      } as DLineData,
      {
        key: 'A',
        x: ndarray([0, 1, 2, 3, 4, 5]),
        dx: [0, 5],
        y: ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5])),
        dy: [-4, 120],
        line_on: false,
        default_indices: true
      } as DLineData
    ],
    [
      {
        key: 'B',
        x: ndarray([8, 10, 12, 14, 16, 18]),
        dx: [8, 18],
        y: ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5])),
        dy: [-4, 120],
        line_on: false,
      } as DLineData,
      {
        key: 'B',
        x: ndarray([8, 10, 12, 14, 16, 18]),
        dx: [8, 18],
        y: ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5])),
        dy: [-4, 120],
        line_on: false,
        default_indices: false
      } as DLineData
    ]
  ])('calls addIndices on %p expecting %p', (data: DLineData, expected: DLineData) => {
    const result = addIndices(data) as DLineData;
    compare_objects(result, expected)
  });
})

describe('checks appendDLineData', () => {
  let linspace = require('ndarray-linspace');

  const lineA_indices_default = {
    key: 'A',
    color: 'red',
    x: ndarray([0, 1, 2, 3, 4, 5]),
    dx: [0, 5],
    y: ndarray(new Float64Array([120, 19.1, -4, 0, 12, 5])),
    dy: [-4, 120],
    line_on: true,
    default_indices: true
  } as DLineData;

  const lineA_indices = {
    key: 'A',
    color: 'red',
    x: ndarray([0, 1, 2, 3, 4, 5]),
    dx: [0, 5],
    y: ndarray(new Float64Array([120, 19.1, -4, 0, 12, 5])),
    dy: [-4, 120],
    line_on: true,
    default_indices: false
  } as DLineData;

  const lineB_indices = {
    key: 'B',
    color: 'blue',
    x: ndarray([14, 15, 16, 17, 18, 19]),
    dx: [14, 19],
    y: ndarray(new Float32Array([150, 0, -43, -40, 0, 70])),
    dy: [-43, 150],
    line_on: false,
    default_indices: false
  } as DLineData;

  const lineB = {
    key: 'B',
    color: 'blue',
    x: ndarray([]),
    dx: [0, 0],
    y: ndarray(new Float32Array([150, 0, -43, -40, 0, 70])),
    dy: [-43, 150],
    line_on: false,
    default_indices: true
  } as DLineData;

  const lineB_wrong_length = {
    key: 'B',
    color: 'blue',
    x: ndarray([14, 15, 16]),
    dx: [14, 19],
    y: ndarray(new Float32Array([150, 0, -43, -40, 0, 70])),
    dy: [-43, 150],
    line_on: false,
    default_indices: true
  } as DLineData;

  const lineC = {
    key: 'A',
    color: 'red',
    x: linspace(ndarray([], [12]), 0, 11) as ndarray.NdArray<TypedArray>,
    dx: [0, 11],
    y: ndarray(new Float64Array([120, 19.1, -4, 0, 12, 5, 150, 0, -43, -40, 0, 70])),
    dy: [-43, 150],
    line_on: true,
    default_indices: true
  } as DLineData;

  const lineD = {
    key: 'A',
    color: 'red',
    x: ndarray(new Float64Array([0, 1, 2, 3, 4, 5, 14, 15, 16, 17, 18, 19])),
    dx: [0, 19],
    y: ndarray(new Float64Array([120, 19.1, -4, 0, 12, 5, 150, 0, -43, -40, 0, 70])),
    dy: [-43, 150],
    line_on: true,
    default_indices: false
  } as DLineData;

  it.each([
    [lineA_indices_default, lineB_indices, lineC],
    [undefined, lineB_indices, lineB_indices],
    [lineA_indices_default, null, lineA_indices_default],
    [lineA_indices_default, undefined, lineA_indices_default],
    [lineA_indices_default, lineB, lineC],
    [lineA_indices, lineB_indices, lineD],
    [lineA_indices, lineB_wrong_length, lineA_indices],
    [lineA_indices, lineB, lineA_indices],
  ])('calls appendDLineData on %p and %p expecting %p', (line: DLineData | undefined, newPoints: DLineData | null | undefined, expected: DLineData) => {
    const result = appendDLineData(line, newPoints) as DLineData;
    compare_objects(result, expected)
  });
})
