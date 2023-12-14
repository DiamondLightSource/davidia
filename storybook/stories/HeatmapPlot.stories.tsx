import { Domain } from '@h5web/lib';
import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react';
import {
  BatonProps,
  DAxesParameters,
  HeatmapPlot,
  HeatmapPlotProps,
} from '@davidia/component';

const meta = {
  title: 'Plots/PlotComponents/HeatmapPlot',
  component: HeatmapPlot,
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
  values: ndarray(new Float32Array([10, 12, 13, 16, 19, 20]), [3, 2]),
  axesParameters: {
    title: 'Sample Heatmap Plot',
    xLabel: 'x-axis',
    yLabel: 'y-axis',
  } as DAxesParameters,
  aspect: 'auto',
  domain: [0, 20] as Domain,
  heatmapScale: 'linear',
  colourMap: 'Sinebow',
} as HeatmapPlotProps;

export const Static: Story = {
  args: plotArgs,
};
