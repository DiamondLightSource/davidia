import ndarray from 'ndarray';
import { useArgs } from '@storybook/preview-api';
import type { StoryObj } from '@storybook/react';
import {
  BatonProps,
  DAxesParameters,
  ImagePlot,
  SelectionBase,
} from '@davidia/component';

const meta = {
  title: 'Plots/Image',
  component: ImagePlot,
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

const selections = [] as SelectionBase[];

export const Dynamic: StoryObj<typeof ImagePlot> = {
  args: {
    selections: selections,
    batonProps: batonProps,
    values: ndarray(
      new Float32Array([
        255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0, 255, 0, 255, 0, 255, 255, 0,
        165, 0, 128, 0, 128,
      ]),
      [2, 4, 3]
    ),
    axesParameters: {
      title: 'Sample Image Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    } as DAxesParameters,
    aspect: 'auto',
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(s: SelectionBase | null) {
      if (s != null) {
        updateArgs({ selections: selections.concat([s]) });
      }
    }

    return (
      <ImagePlot {...args} batonProps={batonProps} />
    );
  },
};
