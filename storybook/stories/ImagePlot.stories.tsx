import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react';
import { ImagePlot } from '@diamondlightsource/davidia';

const meta = {
  title: 'Plots/Image',
  component: ImagePlot,
  tags: ['autodocs'],
};

export default meta;

export const Image: StoryObj<typeof ImagePlot> = {
  args: {
    plotConfig: {
      title: 'Sample Image Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    },
    values: ndarray(
      new Float32Array([
        255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0, 255, 0, 255, 0, 255, 255,
        0, 165, 0, 128, 0, 128,
      ]),
      [2, 4, 3]
    ),
    aspect: 'auto',
  },
};
