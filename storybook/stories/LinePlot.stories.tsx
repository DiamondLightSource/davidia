import ndarray from 'ndarray';
import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import {
  BatonProps,
  DAxesParameters,
  DLineData,
  SelectionBase,
  LinePlot,
} from '@davidia/component';

const meta: Meta<typeof LinePlot> = {
  title: 'Plots/Line',
  component: LinePlot,
  tags: ['autodocs'],
};

export default meta;

const line0 = {
  key: 'tuvwxyz',
  colour: 'red',
  x: ndarray(new Float32Array([10, 12, 13, 16, 19, 20])),
  dx: [10, 20],
  y: ndarray(new Float32Array([1, 2, 3, 6, 9, 11])),
  dy: [1, 11],
  line_on: true,
  point_size: 8,
  default_indices: false,
} as DLineData;

const line1 = {
  key: 'qrs',
  colour: 'green',
  x: ndarray(new Float32Array([10, 12, 13, 16, 19, 20, 22, 25])),
  dx: [10, 25],
  y: ndarray(new Float32Array([4, 3, 2, 4, 7, 11, 16, 11])),
  dy: [1, 11],
  line_on: true,
  point_size: 12,
  default_indices: false,
} as DLineData;

const batonProps = {
  uuid: '14e9e388',
  batonUuid: '14e9e388',
  others: ['22f4c778', '32g5b835'] as string[],
  hasBaton: true,
  requestBaton: () => ({}),
  approveBaton: (_s: string) => ({}),
} as BatonProps;

const singleSelections = [] as SelectionBase[];
const multiSelections = [] as SelectionBase[];

export const Single: StoryObj<typeof LinePlot> = {
  args: {
    selections: singleSelections,
    data: [line0],
    xDomain: [8, 22],
    yDomain: [0, 12],
    axesParameters: {
      title: 'Sample Line Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    } as DAxesParameters,
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(s: SelectionBase | null) {
      if (s != null) {
        updateArgs({ selections: singleSelections.concat([s]) });
      }
    }

    return (
      <LinePlot {...args} batonProps={batonProps} addSelection={onChange} />
    );
  },
};

export const Multi: StoryObj<typeof LinePlot> = {
  args: {
    selections: multiSelections,
    data: [line0, line1],
    xDomain: [8, 27],
    yDomain: [0, 17],
    axesParameters: {
      title: 'Sample Multiline Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    } as DAxesParameters,
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(s: SelectionBase | null) {
      if (s != null) {
        updateArgs({ selections: singleSelections.concat([s]) });
      }
    }

    return (
      <LinePlot {...args} batonProps={batonProps} addSelection={onChange} />
    );
  },
};
