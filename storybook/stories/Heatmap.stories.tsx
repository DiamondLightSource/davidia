import ndarray from 'ndarray';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import { Domain, ScaleType } from '@h5web/lib';
import {
  PlotConfig,
  HeatmapPlot,
  SelectionBase,
} from '@diamondlightsource/davidia';

const meta: Meta<typeof HeatmapPlot> = {
  title: 'Plots/Heatmap',
  component: HeatmapPlot,
  tags: ['autodocs'],
};

export default meta;

export const Heatmap: StoryObj<typeof HeatmapPlot> = {
  args: {
    selections: [] as SelectionBase[],
    plotConfig: {
      title: 'Sample Heatmap Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    } as PlotConfig,
    key: 'Example heatmap',
    values: ndarray(new Float32Array([5, 10, 15, 1.5, 4.5, 3.5]), [3, 2]),
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
      } else {
        updateArgs({ selections: [] });
      }
    }

    return <HeatmapPlot {...args} addSelection={onChange} />;
  },
};
