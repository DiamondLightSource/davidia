import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react-vite';
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

export const EqualAspect: StoryObj<typeof ImagePlot> = {
  args: {
    plotConfig: {
      title: 'Equal Image Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    },
    tightAxes: false,
    values: ndarray(
      new Float32Array([
        255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0, 255, 0, 255, 0, 255, 255,
        0, 165, 0, 128, 0, 128,
      ]),
      [2, 4, 3]
    ),
    aspect: 'equal',
  },
};

export const TightAxes: StoryObj<typeof ImagePlot> = {
  args: {
    plotConfig: {
      title: 'Tight Axes Image Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    },
    tightAxes: true,
    values: ndarray(
      new Float32Array([
        255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0, 255, 0, 255, 0, 255, 255,
        0, 165, 0, 128, 0, 128,
      ]),
      [2, 4, 3]
    ),
    aspect: 'equal',
  },
};
