import ndarray from 'ndarray';
import {
  AxialSelection,
  Domain,
  GlyphType,
  HeatmapPlotProps,
  LineParams,
  LinePlotProps,
  NDT,
  ScaleType,
} from '@diamondlightsource/davidia';

export const lineProps = {
  plotConfig: {
    title: 'Sample Line Plot',
    xLabel: 'x-axis',
    yLabel: 'y-axis',
  },
  lineData: [
    {
      key: 'squares',
      lineParams: {
        colour: 'purple',
        width: 2.4,
        pointSize: 6,
        lineOn: true,
        glyphType: GlyphType.Square,
      } as LineParams,
      x: ndarray(new Float32Array([1, 2, 3, 4, 6, 10])),
      xDomain: [1, 10],
      y: ndarray(new Float32Array([1, 4, 9, 16, 36, 100])),
      yDomain: [1, 100],
      defaultIndices: false,
    },
  ],
  xDomain: [0, 11],
  yDomain: [0, 101],
} as LinePlotProps;

export const linePropsNoSelection = {
  ...lineProps,
  plotConfig: {
    ...lineProps.plotConfig,
    title: 'Sample Line Plot (no selection)',
  },
};
const heatmapValues = ndarray(
  new Float32Array([5, 10, 15, 1.5, 4.5, 3.5]),
  [3, 2]
) as NDT;

export const heatmapProps = {
  plotConfig: {
    title: 'Sample Heatmap Plot',
    xLabel: 'x-axis',
    yLabel: 'y-axis',
  },
  values: heatmapValues,
  aspect: 'auto',
  domain: [0, 20] as Domain,
  heatmapScale: ScaleType.Linear,
  colourMap: 'Sinebow',
} as HeatmapPlotProps;

export const heatmapPropsNoToolbar = {
  ...heatmapProps,
  plotConfig: {
    ...heatmapProps.plotConfig,
    title: 'Sample Heatmap Plot (no toolbar)',
  },
  customToolbarChildren: null,
} as HeatmapPlotProps;

export function generateImage(width: number, height: number) {
  const rgb = new Uint8Array(width * height * 3);

  for (let i = 0; i < rgb.length; i++) {
    rgb[i] = Math.random() * 255;
  }
  return ndarray(rgb, [height, width, 3]) as NDT;
}

export function generateGreyImage(
  width: number,
  height: number,
  threeD = false
) {
  const rgb = new Uint8Array(width * height);

  for (let i = 0; i < rgb.length; i++) {
    rgb[i] = Math.random() * 255;
  }
  if (threeD) return ndarray(rgb, [height, width, 1]) as NDT;
  return ndarray(rgb, [height, width]) as NDT;
}

export function centredSelection(
  values: { data: ArrayLike<number> },
  dimension: number,
  name: string,
  colour: string
) {
  const data = values.data;

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < data.length; i++) {
    const value = data[i];

    if (Number.isFinite(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }

  const range = max - min;
  const length = range * 0.03;
  const start = min + (range - length) / 2;

  const selection = new AxialSelection(
    dimension === 0 ? [start, 0] : [0, start],
    length,
    dimension
  );

  selection.name = name;
  selection.colour = colour;

  return selection;
}
