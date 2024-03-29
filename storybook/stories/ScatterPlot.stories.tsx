import ndarray from 'ndarray';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import { AxisScaleType, ScaleType } from '@h5web/lib';
import {
  ScatterPlot,
  DAxesParameters,
  SelectionBase,
} from '@diamondlightsource/davidia';

const meta: Meta<typeof ScatterPlot> = {
  title: 'Plots/Scatter',
  component: ScatterPlot,
  tags: ['autodocs'],
};

export default meta;

export const Scatter: StoryObj<typeof ScatterPlot> = {
  args: {
    selections: [] as SelectionBase[],
    domain: [0, 114],
    axesParameters: {
      title: 'Scatter Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
      xScale: ScaleType.Linear as AxisScaleType | undefined,
      yScale: ScaleType.Linear as AxisScaleType | undefined,
    } as DAxesParameters,
    colourMap: 'Turbo',
    xData: ndarray(new Int32Array([...Array(20).keys()]), [20]),
    yData: ndarray(new Int32Array([...Array(10).keys(), ...Array(10).keys()]), [
      20,
    ]),
    dataArray: ndarray(
      new Int32Array([...Array(20).keys()].map((x) => x * 6)),
      [20]
    ),
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

    return <ScatterPlot {...args} addSelection={onChange} />;
  },
};
