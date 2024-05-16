import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react';
import { AxisScaleType, ScaleType } from '@h5web/lib';
import {
  PlotConfig,
  SurfacePlot,
  SurfacePlotProps,
} from '@diamondlightsource/davidia';

const meta = {
  title: 'Plots/Surface',
  component: SurfacePlot,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const xx = ndarray(new Float32Array([-3, -2, -1, 0, 1, 2, 3, 4, 5]), [3, 3]);
const yy = ndarray(new Float32Array([-2, -0.5, 0, 1, 2.5, 1, 0, -1]), [2, 4]);
const values = ndarray(new Float32Array(xx.shape[0] * yy.shape[1]), xx.shape);

for (let i = 0; i < xx.shape[0]; i++) {
  for (let j = 0; j < yy.shape[1]; j++) {
    values.set(i, j, Math.sin(xx.get(i, j)) + yy.get(0, j));
  }
}

const surfaceArgs = {
  selections: [],
  plotConfig: {
    title: 'Surface Plot',
    xLabel: 'x-axis',
    yLabel: 'y-axis',
    xScale: ScaleType.Linear as AxisScaleType | undefined,
    yScale: ScaleType.Linear as AxisScaleType | undefined,
  } as PlotConfig,
  key: 'Example surface',
  heightValues: values,
  domain: [-2, 2],
  surfaceScale: 'linear',
  colourMap: 'Turbo',
} as SurfacePlotProps;

export const Surface: Story = {
  args: surfaceArgs,
};
