import ndarray from 'ndarray';
import { randomLcg, randomNormal, randomUniform } from 'd3-random';
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
  createHistogramParams,
  isHeatmapData,
  isValidPositiveNumber,
  nanMinMax,
} from './utils';

import { toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { HistogramParams } from '@h5web/lib';
expect.extend({ toMatchCloseTo });

function isNumberArray(arr: unknown): boolean {
  if (
    Array.isArray(arr) &&
    arr.length > 0 &&
    arr.every((value) => {
      return typeof value === 'number';
    })
  ) {
    return true;
  }
  return false;
}

function compare_objects(
  result: DLineData | DHeatmapData | DScatterData | DAxesParameters,
  expected: typeof result
) {
  type T = keyof typeof expected;
  const keys = Object.keys(result) as T[];
  for (const k of keys) {
    const e = expected[k];
    const r = result[k];
    if (isNumberArray(e)) {
      const rn = r as number[];
      expect(rn).toMatchCloseTo(e);
    } else {
      expect(r).toStrictEqual(e);
    }
  }
}

describe('checks isHeatmapData', () => {
  it.each([
    [
      {
        key: 'A',
        values: ndarray(new Int8Array()),
        domain: [-3, 8],
        heatmap_scale: 'linear',
      },
      true,
    ],
    [{ key: 'B', values: ndarray(new Int8Array()), domain: [4, 12] }, false],
    [
      { key: 'C', values: ndarray(new Int8Array()), heatmap_scale: 'linear' },
      false,
    ],
    [{ key: 'D', values: ndarray(new Int8Array()) }, false],
  ])(
    'calls isHeatmapData on %p expecting %p',
    (data: DImageData | DHeatmapData, expected: boolean) => {
      expect(isHeatmapData(data)).toBe(expected);
    }
  );
});

describe('checks nanMinMax', () => {
  it.each([
    [ndarray(new Int8Array([2, 4])), [2, 4]],
    [ndarray(new Int8Array([-4, 6, 12])), [-4, 12]],
    [ndarray(new Int8Array([-3, -3, -3, -3])), [-3, -3]],
    [ndarray(new Float32Array([NaN, 12, NaN, NaN])), [12, 12]],
    [ndarray(new Float32Array([-7, NaN, 0])), [-7, 0]],
  ])(
    'calls nanMinMax on %p expecting %p',
    (arr: NdArray<TypedArray>, expected: number[]) => {
      expect(nanMinMax(arr)).toStrictEqual(expected);
    }
  );

  it('should throw if no valid numbers in array', () => {
    const errRegex = /No valid numbers were compared/;
    expect(() => nanMinMax(ndarray(new Float32Array([NaN, NaN, NaN])))).toThrow(
      errRegex
    );
    expect(() => nanMinMax(ndarray(new Int8Array([])))).toThrow(errRegex);
  });
});

describe('checks createDTableData', () => {
  const a = {
    nd: true,
    dtype: '<u2',
    shape: [2, 3],
    data: new Uint16Array([10, 20, 30, 40, 50, 60]).buffer,
  } as MP_NDArray;
  const b = ndarray(new Uint16Array([10, 20, 30, 40, 50, 60]), [2, 3]);
  it.each([
    [
      { key: 'A', dataArray: a, cellWidth: 4.5 } as TableData,
      {
        key: 'A',
        dataArray: b,
        cellWidth: 4.5,
        displayParams: undefined,
      } as DTableData,
    ],
    [
      {
        key: 'B',
        dataArray: a,
        cellWidth: 5,
        displayParams: undefined,
      } as TableData,
      {
        key: 'B',
        dataArray: b,
        cellWidth: 5,
        displayParams: undefined,
      } as DTableData,
    ],
    [
      {
        key: 'C',
        dataArray: a,
        cellWidth: 5,
        displayParams: { displayType: 'scientific' },
      } as TableData,
      {
        key: 'C',
        dataArray: b,
        cellWidth: 5,
        displayParams: { displayType: 'scientific' },
      } as DTableData,
    ],
    [
      {
        key: 'D',
        dataArray: a,
        cellWidth: 5,
        displayParams: { displayType: 'scientific', numberDigits: undefined },
      } as TableData,
      {
        key: 'D',
        dataArray: b,
        cellWidth: 5,
        displayParams: { displayType: 'scientific', numberDigits: undefined },
      } as DTableData,
    ],
    [
      {
        key: 'E',
        dataArray: a,
        cellWidth: 5,
        displayParams: { displayType: 'standard', numberDigits: 6 },
      } as TableData,
      {
        key: 'E',
        dataArray: b,
        cellWidth: 5,
        displayParams: { displayType: 'standard', numberDigits: 6 },
      } as DTableData,
    ],
    [
      {
        key: 'F',
        dataArray: {
          nd: true,
          dtype: '<f4',
          shape: [3, 2],
          data: new Float32Array([-2.8, 14.1, -76, 0, 1, 12]).buffer,
        },
        cellWidth: 5,
      } as TableData,
      {
        key: 'F',
        dataArray: ndarray(
          new Float32Array([-2.8, 14.1, -76, 0, 1, 12]),
          [3, 2]
        ),
        cellWidth: 5,
        displayParams: undefined,
      } as DTableData,
    ],
    [
      {
        key: 'G',
        dataArray: {
          nd: false,
          dtype: '<f4',
          shape: [3],
          data: new Float32Array([-2.8, 14.1, -76]).buffer,
        },
        cellWidth: 5,
      } as TableData,
      {
        key: 'G',
        dataArray: ndarray(new Float32Array([-2.8, 14.1, -76]), [3]),
        cellWidth: 5,
        displayParams: undefined,
      } as DTableData,
    ],
    [
      {
        key: 'H',
        dataArray: {
          nd: true,
          dtype: '<f4',
          shape: [0],
          data: new Float32Array([]).buffer,
        },
        cellWidth: 5,
      } as TableData,
      {
        key: 'H',
        dataArray: ndarray(new Int8Array()),
        cellWidth: 5,
        displayParams: undefined,
      } as DTableData,
    ],
  ])(
    'calls createDTableData on %p expecting %p',
    (data: TableData, expected: DTableData) => {
      expect(createDTableData(data)).toStrictEqual(expected);
    }
  );
});

describe('checks createDScatterData', () => {
  const a = {
    nd: true,
    dtype: '|i1',
    shape: [3],
    data: new Int8Array([-4, -2, 0]).buffer,
  } as MP_NDArray;
  const b = {
    nd: true,
    dtype: '|i1',
    shape: [3],
    data: new Int8Array([4, 8, 12]).buffer,
  } as MP_NDArray;
  const c = {
    nd: true,
    dtype: '<f4',
    shape: [3],
    data: new Float32Array([120, 19.1, -4.7]).buffer,
  } as MP_NDArray;
  const d = ndarray(new Int8Array([-4, -2, 0]), [3]);
  const e = ndarray(new Int8Array([4, 8, 12]), [3]);
  const f = ndarray(new Float32Array([120, 19.1, -4.7]), [3]);
  it.each([
    [
      {
        key: 'A',
        xData: a,
        yData: b,
        dataArray: c,
        domain: [-4.7, 120],
      } as ScatterData,
      {
        key: 'A',
        xData: d,
        yData: e,
        dataArray: f,
        domain: [-4.7, 120],
      } as DScatterData,
    ],
  ])(
    'calls createDScatterData on %p expecting %p',
    (data: ScatterData, expected: DScatterData) => {
      expect(createDScatterData(data)).toStrictEqual(expected);
    }
  );
});

describe('checks createDImageData', () => {
  it.each([
    [
      {
        aspect: 'equal',
        key: 'A',
        values: {
          nd: true,
          dtype: '<u2',
          shape: [3, 2],
          data: new Uint16Array([10, 20, 30, 40, 50, 60]).buffer,
        } as MP_NDArray,
      } as ImageData,
      {
        aspect: 'equal',
        key: 'A',
        values: ndarray(new Uint16Array([10, 20, 30, 40, 50, 60]), [3, 2]),
      } as DImageData,
    ],
    [
      {
        colorMap: 'Viridis',
        key: 'B',
        values: {
          nd: true,
          dtype: '<u2',
          shape: [3, 2],
          data: new Uint16Array([10, 20, 30, 40, 50, 60]).buffer,
        } as MP_NDArray,
        domain: [10, 60],
        heatmap_scale: 'log',
      } as HeatmapData,
      {
        aspect: undefined,
        colorMap: 'Viridis',
        key: 'B',
        values: ndarray(new Uint16Array([10, 20, 30, 40, 50, 60]), [3, 2]),
        domain: [10, 60],
        heatmap_scale: 'log',
      } as DHeatmapData,
    ],
  ])(
    'calls createDImageData on %p expecting %p',
    (data: ImageData, expected: DImageData) => {
      expect(createDImageData(data)).toStrictEqual(expected);
    }
  );
});

describe('checks createDLineData', () => {
  const a = {
    nd: true,
    dtype: '<u2',
    shape: [3, 2],
    data: new Uint16Array([10, 20, 30, 40, 50, 60]).buffer,
  } as MP_NDArray;
  const b = {
    nd: true,
    dtype: '<f4',
    shape: [3, 2],
    data: new Float32Array([120, 19.1, -4, 0, 12, 5]).buffer,
  } as MP_NDArray;
  const c = {
    nd: true,
    dtype: '<f4',
    shape: [0],
    data: new Float32Array([]).buffer,
  } as MP_NDArray;
  const d = ndarray(new Uint16Array([10, 20, 30, 40, 50, 60]), [3, 2]);
  const e = ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5]), [3, 2]);

  it.each([
    [
      {
        key: 'A',
        color: 'red',
        x: a,
        y: b,
        line_on: false,
        point_size: 6,
      } as LineData,
      {
        key: 'A',
        color: 'red',
        x: d,
        dx: [10, 60],
        y: e,
        dy: [-4, 120],
        line_on: false,
        point_size: 6,
      } as DLineData,
    ],
    [
      {
        key: 'B',
        color: 'red',
        x: {
          nd: true,
          dtype: '<u2',
          shape: [0],
          data: new Uint16Array([]).buffer,
        } as MP_NDArray,
        y: a,
        line_on: false,
        point_size: 6,
      } as LineData,
      {
        key: 'B',
        color: 'red',
        x: ndarray(new Int8Array(), [0]),
        dx: [0, 0],
        y: d,
        dy: [10, 60],
        line_on: false,
        point_size: 6,
      } as DLineData,
    ],
  ])(
    'calls createDLineData on %p expecting %p',
    (data: LineData, expected: DLineData) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = createDLineData(data)!;
      compare_objects(result, expected);
    }
  );
  test('calls createDLineData expecting null', () => {
    const data = {
      key: 'B',
      color: 'red',
      x: a,
      y: c,
      line_on: false,
      point_size: 6,
    } as LineData;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = createDLineData(data)!;
    expect(result).toBe(null);
  });
});

describe('checks createDAxesParameters', () => {
  const a = {
    nd: true,
    dtype: '<u2',
    shape: [6, 1],
    data: new Uint16Array([10, 20, 30, 40, 50, 60]).buffer,
  } as MP_NDArray;
  const b = {
    nd: true,
    dtype: '<f4',
    shape: [6, 1],
    data: new Float32Array([120, 19.1, -4, 0, 12, 5]).buffer,
  } as MP_NDArray;
  const c = {
    nd: true,
    dtype: '<f4',
    shape: [0],
    data: new Float32Array([]).buffer,
  } as MP_NDArray;
  const d = ndarray(new Uint16Array([10, 20, 30, 40, 50, 60]), [6, 1]);
  const e = ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5]), [6, 1]);

  it.each([
    [
      {
        x_label: 'x axis',
        y_label: 'y axis',
        x_scale: 'linear',
        y_scale: 'log',
        x_values: a,
        y_values: b,
        title: 'plot A',
      } as AxesParameters,
      {
        xLabel: 'x axis',
        yLabel: 'y axis',
        xScale: 'linear',
        yScale: 'log',
        xValues: d,
        yValues: e,
        title: 'plot A',
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
        title: 'plot B',
      } as AxesParameters,
      {
        xLabel: 'x axis',
        yLabel: 'y axis',
        xScale: 'linear',
        yScale: 'log',
        xValues: ndarray(new Int8Array()),
        yValues: e,
        title: 'plot B',
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
        title: undefined,
      } as DAxesParameters,
    ],
    [
      {
        x_label: 'x axis',
        y_label: undefined,
        x_values: a,
        y_values: b,
        title: 'plot D',
      } as AxesParameters,
      {
        xLabel: 'x axis',
        yLabel: undefined,
        xScale: undefined,
        yScale: undefined,
        xValues: d,
        yValues: e,
        title: 'plot D',
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
        title: undefined,
      } as DAxesParameters,
    ],
  ])(
    'calls createDAxesParameters on %p expecting %p',
    (data: AxesParameters, expected: DAxesParameters) => {
      const result = createDAxesParameters(data);
      compare_objects(result, expected);
    }
  );
});

describe('checks calculateMultiXDomain', () => {
  const a = {
    key: 'A',
    x: ndarray(new Uint16Array([10, 20, 30, 40, 50, 60])),
    dx: [10, 60],
    y: ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5])),
    dy: [-4, 120],
    line_on: false,
  };
  const b = {
    key: 'B',
    x: ndarray(new Uint16Array([0, 0, 0, 0, 0, 0])),
    dx: [0, 0],
    y: ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5])),
    dy: [-4, 120],
    line_on: false,
  };

  it.each([
    [[a, a, a] as DLineData[], [10, 60] as [number, number]],
    [[b, b, b] as DLineData[], [0, 0] as [number, number]],
    [[b, a, b] as DLineData[], [0, 60] as [number, number]],
  ])(
    'calls calculateMultiXDomain on %p expecting %p',
    (data: DLineData[], expected: [number, number]) => {
      const result = calculateMultiXDomain(data);
      expect(result).toMatchCloseTo(expected);
    }
  );
});

describe('checks calculateMultiYDomain', () => {
  const a = {
    key: 'A',
    x: ndarray(new Uint16Array([10, 20, 30, 40, 50, 60])),
    dx: [10, 60],
    y: ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5])),
    dy: [-4, 120],
    line_on: false,
  };
  const b = {
    key: 'B',
    x: ndarray(new Uint16Array([0, 0, 0, 0, 0, 0])),
    dx: [0, 0],
    y: ndarray(new Uint16Array([0, 0, 0, 0, 0, 0])),
    dy: [0, 0],
    line_on: false,
  };

  it.each([
    [[a, a, a] as DLineData[], [-4, 120] as [number, number]],
    [[b, b, b] as DLineData[], [0, 0] as [number, number]],
    [[b, a, b] as DLineData[], [-4, 120] as [number, number]],
  ])(
    'calls calculateMultiYDomain on %p expecting %p',
    (data: DLineData[], expected: [number, number]) => {
      const result = calculateMultiYDomain(data);
      expect(result).toMatchCloseTo(expected);
    }
  );
});

describe('checks addIndices', () => {
  it.each([
    [
      {
        key: 'A',
        x: ndarray(new Int32Array()),
        dx: [0, 0],
        y: ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5])),
        dy: [-4, 120],
        line_on: false,
      } as DLineData,
      {
        key: 'A',
        x: ndarray(new Int32Array([0, 1, 2, 3, 4, 5])),
        dx: [0, 5],
        y: ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5])),
        dy: [-4, 120],
        line_on: false,
        default_indices: true,
      } as DLineData,
    ],
    [
      {
        key: 'B',
        x: ndarray(new Int8Array([8, 10, 12, 14, 16, 18])),
        dx: [8, 18],
        y: ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5])),
        dy: [-4, 120],
        line_on: false,
      } as DLineData,
      {
        key: 'B',
        x: ndarray(new Int8Array([8, 10, 12, 14, 16, 18])),
        dx: [8, 18],
        y: ndarray(new Float32Array([120, 19.1, -4, 0, 12, 5])),
        dy: [-4, 120],
        line_on: false,
        default_indices: false,
      } as DLineData,
    ],
  ])(
    'calls addIndices on %p expecting %p',
    (data: DLineData, expected: DLineData) => {
      const result = addIndices(data);
      compare_objects(result, expected);
    }
  );
});

type LinSpace = (
  x: NdArray<TypedArray>,
  b: number,
  e: number
) => NdArray<TypedArray>;
describe('checks appendDLineData', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const linspace = require('ndarray-linspace') as LinSpace;

  const lineA_indices_default = {
    key: 'A',
    color: 'red',
    x: ndarray(new Uint32Array([0, 1, 2, 3, 4, 5])),
    dx: [0, 5],
    y: ndarray(new Float64Array([120, 19.1, -4, 0, 12, 5])),
    dy: [-4, 120],
    line_on: true,
    default_indices: true,
  } as DLineData;

  const lineA_indices = {
    key: 'A',
    color: 'red',
    x: ndarray(new Int8Array([0, 1, 2, 3, 4, 5])),
    dx: [0, 5],
    y: ndarray(new Float64Array([120, 19.1, -4, 0, 12, 5])),
    dy: [-4, 120],
    line_on: true,
    default_indices: false,
  } as DLineData;

  const lineB_indices = {
    key: 'B',
    color: 'blue',
    x: ndarray(new Int8Array([14, 15, 16, 17, 18, 19])),
    dx: [14, 19],
    y: ndarray(new Float32Array([150, 0, -43, -40, 0, 70])),
    dy: [-43, 150],
    line_on: false,
    default_indices: false,
  } as DLineData;

  const lineB = {
    key: 'B',
    color: 'blue',
    x: ndarray(new Int8Array()),
    dx: [0, 0],
    y: ndarray(new Float32Array([150, 0, -43, -40, 0, 70])),
    dy: [-43, 150],
    line_on: false,
    default_indices: true,
  } as DLineData;

  const lineB_wrong_length = {
    key: 'B',
    color: 'blue',
    x: ndarray(new Int8Array([14, 15, 16])),
    dx: [14, 19],
    y: ndarray(new Float32Array([150, 0, -43, -40, 0, 70])),
    dy: [-43, 150],
    line_on: false,
    default_indices: true,
  } as DLineData;

  const lineC = {
    key: 'A',
    color: 'red',
    x: linspace(ndarray(new Uint32Array(12), [12]), 0, 11),
    dx: [0, 11],
    y: ndarray(
      new Float64Array([120, 19.1, -4, 0, 12, 5, 150, 0, -43, -40, 0, 70])
    ),
    dy: [-43, 150],
    line_on: true,
    default_indices: true,
  } as DLineData;

  const lineD = {
    key: 'A',
    color: 'red',
    x: ndarray(new Float64Array([0, 1, 2, 3, 4, 5, 14, 15, 16, 17, 18, 19])),
    dx: [0, 19],
    y: ndarray(
      new Float64Array([120, 19.1, -4, 0, 12, 5, 150, 0, -43, -40, 0, 70])
    ),
    dy: [-43, 150],
    line_on: true,
    default_indices: false,
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
  ])(
    'calls appendDLineData on %p and %p expecting %p',
    (
      line: DLineData | undefined,
      newPoints: DLineData | null | undefined,
      expected: DLineData
    ) => {
      const result = appendDLineData(line, newPoints);
      compare_objects(result, expected);
    }
  );
});

describe('checks isValidPositiveNumber', () => {
  it.each([
    ['3.2', 10, true, 3.2],
    ['-3.5', 10, false, -3.5],
    ['13.8', 10, false, 13.8],
    ['3.2e12', 1e13, true, 3.2e12],
    ['hello', 10, false, Number.NaN],
  ])(
    'calls isValidPositiveNumber',
    (t: string, u: number, eb: boolean, ev: number) => {
      const r = isValidPositiveNumber(t, u);
      expect(r[0]).toStrictEqual(eb);
      expect(r[1]).toStrictEqual(ev);
    }
  );
});

describe('checks createHistogramParams', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const random0: () => number = randomNormal.source(randomLcg(0.83750164))(
    9,
    1.4
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const random1: () => number = randomNormal.source(randomLcg(0.52523564))(
    6,
    2.1
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const random2: () => number = randomUniform.source(randomLcg(0.26834955))(
    -20,
    60
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const random3: () => number = randomUniform.source(randomLcg(0.143241789))(
    -5,
    -4
  );
  const normalArr0 = Float32Array.from({ length: 40 }, () => random0() * 40);
  const normalArr1 = Float32Array.from({ length: 12 }, () => random1() * 12);
  const uniformArr0 = Float32Array.from({ length: 65 }, () => random2() * 65);
  const uniformArr1 = Float32Array.from({ length: 65 }, () => random3() * 65);
  it.each([
    [
      new Uint8Array([4, 4, 4, 7, 10, 12]),
      {
        values: [3, 1, 0, 1, 1],
        bins: [4, 6, 8, 10, 12, 14],
        colorMap: undefined,
        invertColorMap: undefined,
      } as HistogramParams,
    ],
    [
      new Uint8Array([4, 4, 4, 7, 10, 12]),
      {
        values: [3, 1, 0, 1, 1],
        bins: [4, 6, 8, 10, 12, 14],
        colorMap: undefined,
        invertColorMap: undefined,
      } as HistogramParams,
    ],
    [
      new Uint16Array([0, 0, 0, 0, 8000, 12]),
      {
        values: [5, 0, 0, 0, 1],
        bins: [0, 2000, 4000, 6000, 8000, 10000],
        colorMap: undefined,
        invertColorMap: undefined,
      } as HistogramParams,
    ],
    [
      new Float32Array([-12.2, -6, 14, 70, 8000, -50]),
      {
        values: [3, 2, 0, 0, 0, 1],
        bins: [-2000, 0, 2000, 4000, 6000, 8000, 10000],
        colorMap: undefined,
        invertColorMap: undefined,
      } as HistogramParams,
    ],
    [
      normalArr0,
      {
        values: [1, 4, 12, 12, 10, 1],
        bins: [200, 250, 300, 350, 400, 450, 500],
        colorMap: undefined,
        invertColorMap: undefined,
      } as HistogramParams,
    ],
    [
      normalArr1,
      {
        values: [2, 1, 5, 1, 3],
        bins: [20, 40, 60, 80, 100, 120],
        colorMap: undefined,
        invertColorMap: undefined,
      } as HistogramParams,
    ],
    [new Uint16Array([]), undefined],
    [undefined, undefined],
    [
      uniformArr0,
      {
        values: [3, 5, 7, 4, 11, 5, 10, 5, 5, 5, 5],
        bins: [
          -1500, -1000, -500, 0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000,
        ],
        colorMap: undefined,
        invertColorMap: undefined,
      } as HistogramParams,
    ],
    [
      uniformArr1,
      {
        values: [6, 7, 15, 7, 9, 12, 9],
        bins: [-330, -320, -310, -300, -290, -280, -270, -260],
        colorMap: undefined,
        invertColorMap: undefined,
      } as HistogramParams,
    ],
  ])(
    'calls createHistogramParams',
    (
      values: TypedArray | undefined,
      histogramParams: HistogramParams | undefined
    ) => {
      const r = createHistogramParams(values, undefined, undefined);
      expect(r).toStrictEqual(histogramParams);
    }
  );
});
