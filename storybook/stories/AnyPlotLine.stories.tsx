import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react';
import {
  AnyPlot,
  BatonProps,
  DAxesParameters,
  LinePlotProps,
  DLineData,
} from '@davidia/component';

const meta = {
  title: 'Plots/AnyPlot/Line',
  component: AnyPlot,
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

const line0 = {
  key: 'tuvwxyz',
  colour: 'red',
  x: ndarray(new Float32Array([10, 12, 13, 16, 19, 20])),
  dx: [10, 20],
  y: ndarray(new Float32Array([1, 2, 3, 6, 9, 11])),
  dy: [1, 11],
  line_on: true,
  point_size: 8,
  default_indices: false,
} as DLineData;

const line1 = {
  key: 'qrs',
  colour: 'green',
  x: ndarray(new Float32Array([10, 12, 13, 16, 19, 20, 22, 25])),
  dx: [10, 25],
  y: ndarray(new Float32Array([4, 3, 2, 4, 7, 11, 16, 11])),
  dy: [1, 11],
  line_on: true,
  point_size: 12,
  default_indices: false,
} as DLineData;

const singleLinePlotArgs = {
  addSelection: () => ({}),
  selections: [],
  batonProps: batonProps,
  data: [line0],
  xDomain: [8, 22],
  yDomain: [0, 12],
  axesParameters: {
    title: 'Sample Line Plot',
    xLabel: 'x-axis',
    yLabel: 'y-axis',
  } as DAxesParameters,
} as LinePlotProps;

const multiLinePlotArgs = {
  addSelection: () => ({}),
  selections: [],
  batonProps: batonProps,
  data: [line0, line1],
  xDomain: [8, 27],
  yDomain: [0, 17],
  axesParameters: {
    title: 'Sample Multiline Plot',
    xLabel: 'x-axis',
    yLabel: 'y-axis',
  } as DAxesParameters,
} as LinePlotProps;

export const SingleLine: Story = {
  args: singleLinePlotArgs,
};

export const MultiLine: Story = {
  args: multiLinePlotArgs,
};
