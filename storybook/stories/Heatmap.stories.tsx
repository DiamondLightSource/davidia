import ndarray from 'ndarray';
import type { Meta, StoryObj } from '@storybook/react';
import { Domain, HeatmapPlot, ScaleType } from '@diamondlightsource/davidia';

const meta: Meta<typeof HeatmapPlot> = {
  title: 'Plots/Heatmap',
  component: HeatmapPlot,
  tags: ['autodocs'],
};

export default meta;

export const Heatmap: StoryObj<typeof HeatmapPlot> = {
  args: {
    plotConfig: {
      title: 'Sample Heatmap Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    },
    values: ndarray(new Float32Array([5, 10, 15, 1.5, 4.5, 3.5]), [3, 2]),
    aspect: 'auto',
    domain: [0, 20] as Domain,
    heatmapScale: ScaleType.Linear,
    colourMap: 'Sinebow',
  },
};
