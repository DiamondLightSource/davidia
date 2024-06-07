import ndarray from 'ndarray';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AxisScaleType,
  ScaleType,
  ScatterPlot,
} from '@diamondlightsource/davidia';

const meta: Meta<typeof ScatterPlot> = {
  title: 'Plots/Scatter',
  component: ScatterPlot,
  tags: ['autodocs'],
};

export default meta;

export const Scatter: StoryObj<typeof ScatterPlot> = {
  args: {
    domain: [0, 114],
    plotConfig: {
      title: 'Scatter Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
      xScale: ScaleType.Linear as AxisScaleType | undefined,
      yScale: ScaleType.Linear as AxisScaleType | undefined,
    },
    colourMap: 'Turbo',
    x: ndarray(new Int32Array([...Array(20).keys()]), [20]),
    y: ndarray(new Int32Array([...Array(10).keys(), ...Array(10).keys()]), [
      20,
    ]),
    pointValues: ndarray(
      new Int32Array([...Array(20).keys()].map((x) => x * 6)),
      [20]
    ),
  },
};
