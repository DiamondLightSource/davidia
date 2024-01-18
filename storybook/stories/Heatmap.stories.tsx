import ndarray from 'ndarray';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
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

export const Heatmap: StoryObj<typeof HeatmapPlot> = {
  args: {
    selections: [] as SelectionBase[],
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
    const [{ selections }, updateArgs] = useArgs();

    function onChange(s: SelectionBase | null) {
      if (s != null) {
        updateArgs({ selections: [...(selections as SelectionBase[]), s] });
      }
      else {
        updateArgs({ selections: [] });
      }
    }

    return (
      <HeatmapPlot
        {...args}
        batonProps={
          {
            uuid: '14e9e388',
            batonUuid: '14e9e388',
            others: ['22f4c778', '32g5b835'] as string[],
            hasBaton: true,
            requestBaton: () => ({}),
            approveBaton: (_s: string) => ({}),
          } as BatonProps
        }
        addSelection={onChange}
      />
    );
  },
};
