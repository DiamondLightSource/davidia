import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react';
import {
  BatonProps,
  DAxesParameters,
  ScatterPlot,
  ScatterPlotProps,
} from '@davidia/component';

const meta = {
  title: 'Plots/PlotComponents/ScatterPlot',
  component: ScatterPlot,
  tags: ['autodocs'],
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
    values.set(i * yy.shape[1] + j, Math.sin(xx.get(i, j)) + yy.get(0, j));
  }
}

const plotArgs = {
  addSelection: () => {},
  selections: [],
  batonProps: batonProps,
  domain: [0, 114],
  axesParameters: {
    title: 'Scatter Plot',
    xLabel: 'x-axis',
    yLabel: 'y-axis',
    xScale: 'linear',
    yScale: 'linear',
  } as DAxesParameters,
  colourMap: 'Turbo',
  xData: ndarray(new Int32Array([...Array(20).keys()]), [20]),
  yData: ndarray(new Int32Array([...Array(10).keys(), ...Array(10).keys()]), [
    20,
  ]),
  dataArray: ndarray(new Int32Array([...Array(20).keys()].map((x) => x * 6)), [
    20,
  ]),
} as ScatterPlotProps;

export const Static: Story = {
  args: plotArgs,
};
