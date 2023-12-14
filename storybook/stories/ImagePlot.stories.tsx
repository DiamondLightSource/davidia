import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react';
import {
  BatonProps,
  DAxesParameters,
  ImagePlot,
  ImagePlotProps,
} from '@davidia/component';

const meta = {
  title: 'Plots/PlotComponents/ImagePlot',
  component: ImagePlot,
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

const plotArgs = {
  addSelection: () => ({}),
  selections: [],
  batonProps: batonProps,
  values: ndarray(
    new Float32Array([
      255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0,
      255, 0, 255, 0, 255, 255, 0, 165, 0, 128, 0, 128
    ]),
    [2, 4, 3]
  ),
  axesParameters: {
    title: 'Sample Image Plot',
    xLabel: 'x-axis',
    yLabel: 'y-axis',
  } as DAxesParameters,
  aspect: 'auto',
} as ImagePlotProps;

export const Image: Story = {
  args: plotArgs,
};
