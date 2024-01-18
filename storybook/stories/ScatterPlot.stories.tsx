import ndarray from 'ndarray';
import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import { AxisScaleType, ScaleType } from '@h5web/lib';
import {
  ScatterPlot,
  BatonProps,
  DAxesParameters,
  SelectionBase,
} from '@davidia/component';

const meta: Meta<typeof ScatterPlot> = {
  title: 'Plots/Scatter',
  component: ScatterPlot,
  tags: ['autodocs'],
};

export default meta;

const selections = [] as SelectionBase[];

export const Dynamic: StoryObj<typeof ScatterPlot> = {
  args: {
    selections: selections,
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
    const updateArgs = useArgs()[1];

    function onChange(s: SelectionBase | null) {
      if (s != null) {
        updateArgs({ selections: selections.concat([s]) });
      }
    }

    return (
      <ScatterPlot
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
        // addSelection={onChange}
      />
    );
  },
};
