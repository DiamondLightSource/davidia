import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react';
import { ScaleType } from '@h5web/lib';
import {
  AnyPlot,
  BatonProps,
  DAxesParameters,
  SurfacePlotProps,
} from '@davidia/component';

const meta = {
  title: 'Plots/AnyPlot/Surface',
  component: AnyPlot,
  tags: ['autodocs'],
  argTypes: {
    cellWidth: { table: { disable: true } },
    dataArray: { table: { disable: true } },
    dataParams: { table: { disable: true } },
    heatmapScale: { table: { disable: true } },
    aspect: { table: { disable: true } },
    data: { table: { disable: true } },
    xDomain: { table: { disable: true } },
    yDomain: { table: { disable: true } },
    xData: { table: { disable: true } },
    yData: { table: { disable: true } },
    displayParams: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const batonProps = {
  uuid: '14e9e388',
  batonUuid: '14e9e388',
  others: ['22f4c778', '32g5b835'] as string[],
  hasBaton: true,
  requestBaton: () => ({}),
  approveBaton: () => ({}),
} as BatonProps;

const xx = ndarray(new Float32Array([-3, -2, -1, 0, 1, 2, 3, 4, 5]), [3, 3]);
const yy = ndarray(new Float32Array([-2, -0.5, 0, 1, 2.5, 1, 0, -1]), [2, 4]);
const values = ndarray(new Float32Array(xx.shape[0] * yy.shape[1]), xx.shape);

for (let i = 0; i < xx.shape[0]; i++) {
  for (let j = 0; j < yy.shape[1]; j++) {
    values.set(i, j, Math.sin(xx.get(i, j)) + yy.get(0, j));
  }
}

const surfaceArgs = {
  addSelection: () => {},
  selections: [],
  batonProps: batonProps,
  values: values,
  domain: [-2, 2],
  axesParameters: {
    title: 'Surface Plot',
    xLabel: 'x-axis',
    yLabel: 'y-axis',
    xScale: ScaleType.Linear,
    yScale: ScaleType.Linear,
  } as DAxesParameters,
  surfaceScale: ScaleType.Linear,
  colourMap: 'Turbo',
} as SurfacePlotProps;

export const Surface: Story = {
  args: surfaceArgs,
};
