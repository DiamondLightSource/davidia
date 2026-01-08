import ndarray from 'ndarray';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScaleType, SurfacePlot } from '@diamondlightsource/davidia';

const meta: Meta<typeof SurfacePlot> = {
  title: 'Plots/Surface',
  component: SurfacePlot,
  tags: ['autodocs'],
};

export default meta;

const xx = ndarray(
  new Float32Array([-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8]),
  [3, 4]
);
const yy = ndarray(new Float32Array([-2, -0.5, 0, 1, 2.5, 1, 0, -1]), [2, 4]);
const values = ndarray(new Float32Array(xx.shape[0] * yy.shape[1]), [
  xx.shape[0],
  yy.shape[1],
]);

for (let i = 0; i < xx.shape[0]; i++) {
  for (let j = 0; j < yy.shape[1]; j++) {
    values.set(i, j, Math.sin(xx.get(i, j)) + yy.get(0, j));
  }
}

export const Surface: StoryObj<typeof SurfacePlot> = {
  args: {
    plotConfig: {
      title: 'Surface Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
      xScale: ScaleType.Linear,
      yScale: ScaleType.Linear,
    },
    heightValues: values,
    domain: [-2, 2],
    surfaceScale: ScaleType.Linear,
    colourMap: 'Turbo',
  },
};
