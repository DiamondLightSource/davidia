import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react';
import { ScaleType } from '@h5web/lib';
import {
  AnyPlot,
  BatonProps,
  DAxesParameters,
  ScatterPlotProps,
} from '@davidia/component';

const meta = {
  title: 'Plots/AnyPlot/Scatter',
  component: AnyPlot,
  tags: ['autodocs'],
  argTypes: {
    cellWidth: { table: { disable: true } },
    dataParams: { table: { disable: true } },
    heatmapScale: { table: { disable: true } },
    values: { table: { disable: true } },
    aspect: { table: { disable: true } },
    data: { table: { disable: true } },
    xDomain: { table: { disable: true } },
    yDomain: { table: { disable: true } },
    surfaceScale: { table: { disable: true } },
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

const scatterArgs = {
  addSelection: () => {},
  selections: [],
  batonProps: batonProps,
  domain: [0, 114],
  axesParameters: {
    title: 'Scatter Plot',
    xLabel: 'x-axis',
    yLabel: 'y-axis',
    xScale: ScaleType.Linear,
    yScale: ScaleType.Linear,
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

export const Scatter: Story = {
  args: scatterArgs,
};
