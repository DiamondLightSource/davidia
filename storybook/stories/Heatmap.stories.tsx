import { useArgs } from '@storybook/preview-api';
import ndarray from 'ndarray';
import type { Meta, StoryObj } from '@storybook/react';
import { Domain, ScaleType } from '@h5web/lib';
import {
  BatonProps,
  DAxesParameters,
  HeatmapPlot,
  SelectionBase,
} from '@davidia/component';

const meta: Meta<typeof HeatmapPlot> = {
  title: 'Plots/Heatmap',
  component: HeatmapPlot,
  tags: ['autodocs'],
};

export default meta;

const batonProps = {
  uuid: '14e9e388',
  batonUuid: '14e9e388',
  others: ['22f4c778', '32g5b835'] as string[],
  hasBaton: true,
  requestBaton: () => ({}),
  approveBaton: (_s: string) => ({}),
} as BatonProps;

const xx = ndarray(new Float32Array([-3, -2, -1, 0, 1, 2, 3, 4, 5]), [3, 3]);
const yy = ndarray(new Float32Array([-2, -0.5, 0, 1, 2.5, 1, 0, -1]), [2, 4]);
const values = ndarray(new Float32Array(xx.shape[0] * yy.shape[1]), xx.shape);

for (let i = 0; i < xx.shape[0]; i++) {
  for (let j = 0; j < yy.shape[1]; j++) {
    values.set(i * yy.shape[1] + j, Math.sin(xx.get(i, j)) + yy.get(0, j));
  }
}

const selections = [] as SelectionBase[];

export const Heatmap: StoryObj<typeof HeatmapPlot> = {
  args: {
    selections: selections,
    values: ndarray(new Float32Array([5, 10, 15, 1.5, 4.5, 3.5]), [3, 2]),
    axesParameters: {
      title: 'Sample Heatmap Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    } as DAxesParameters,
    aspect: 'auto',
    domain: [0, 20] as Domain,
    heatmapScale: ScaleType.Linear,
    colourMap: 'Sinebow',
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(s: SelectionBase | null) {
      if (s != null) {
        updateArgs({ selections: selections.concat([s]) });
      }
    }

    return (
      <HeatmapPlot {...args} batonProps={batonProps} addSelection={onChange} />
    );
  },
};
