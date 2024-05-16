import ndarray from 'ndarray';
import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import {
  LineData,
  LineParams,
  LinePlot,
  PlotConfig,
  SelectionBase,
} from '@diamondlightsource/davidia';

const meta: Meta<typeof LinePlot> = {
  title: 'Plots/Line',
  component: LinePlot,
  tags: ['autodocs'],
};

export default meta;

export const Single: StoryObj<typeof LinePlot> = {
  args: {
    selections: [] as SelectionBase[],
    plotConfig: {
      title: 'Sample Line Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    } as PlotConfig,
    lineData: [
      {
        key: 'squares',
        lineParams: {
          colour: 'purple',
          pointSize: 4,
        } as LineParams,
        x: ndarray(new Float32Array([1, 2, 3, 4, 6, 10])),
        xDomain: [1, 10],
        y: ndarray(new Float32Array([1, 4, 9, 16, 36, 100])),
        yDomain: [1, 100],
        defaultIndices: false,
      } as LineData,
    ],
    xDomain: [0, 11],
    yDomain: [0, 101],
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

    return <LinePlot {...args} addSelection={onChange} />;
  },
};

export const Multi: StoryObj<typeof LinePlot> = {
  args: {
    selections: [] as SelectionBase[],
    plotConfig: {
      title: 'Sample Multiline Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    } as PlotConfig,
    lineData: [
      {
        key: 'tuvwxyz',
        lineParams: {
          colour: 'red',
          pointSize: 8,
        } as LineParams,
        x: ndarray(new Float32Array([10, 12, 13, 16, 19, 20])),
        xDomain: [10, 20],
        y: ndarray(new Float32Array([1, 2, 3, 6, 9, 11])),
        yDomain: [1, 11],
        defaultIndices: false,
      } as LineData,
      {
        key: 'qrs',
        lineParams: {
          colour: 'green',
          pointSize: 12,
        } as LineParams,
        x: ndarray(new Float32Array([10, 12, 13, 16, 19, 20, 22, 25])),
        xDomain: [10, 25],
        y: ndarray(new Float32Array([4, 3, 2, 4, 7, 11, 16, 11])),
        yDomain: [1, 11],
        defaultIndices: false,
      } as LineData,
    ],
    xDomain: [8, 27],
    yDomain: [0, 17],
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

    return <LinePlot {...args} addSelection={onChange} />;
  },
};
