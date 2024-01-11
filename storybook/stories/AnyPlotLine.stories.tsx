import { useState } from 'react';
import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react';
import {
  AnyPlot,
  BatonProps,
  DAxesParameters,
  LinePlotProps,
  DLineData,
  SelectionBase,
  LinePlot,
} from '@davidia/component';

const meta = {
  title: 'Plots/AnyPlot/Line',
  component: AnyPlot,
  tags: ['autodocs'],
  argTypes: {
    cellWidth: { table: { disable: true } },
    dataArray: { table: { disable: true } },
    dataParams: { table: { disable: true } },
    domain: { table: { disable: true } },
    heatmapScale: { table: { disable: true } },
    colourMap: { table: { disable: true } },
    values: { table: { disable: true } },
    aspect: { table: { disable: true } },
    xData: { table: { disable: true } },
    yData: { table: { disable: true } },
    surfaceScale: { table: { disable: true } },
    displayParams: { table: { disable: true } },
  },
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

const SingleComponentWithHooks = () => {
  const [selections, setSelections] = useState<SelectionBase[]>([]);
  const singleProps: LinePlotProps = {
    addSelection: (
      s: SelectionBase | null,
      _broadcast?: boolean | undefined,
      _clear?: boolean | undefined
    ) => {
      if (s != null) {
        setSelections(selections.concat([s]));
      }
    },
    selections: selections,
    batonProps: batonProps,
    data: [line0],
    xDomain: [8, 22],
    yDomain: [0, 12],
    axesParameters: {
      title: 'Sample Line Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    } as DAxesParameters,
  };
  return <LinePlot {...singleProps} />;
};

const MultiComponentWithHooks = () => {
  const [selections, setSelections] = useState<SelectionBase[]>([]);
  const singleProps: LinePlotProps = {
    addSelection: (
      s: SelectionBase | null,
      _broadcast?: boolean | undefined,
      _clear?: boolean | undefined
    ) => {
      if (s != null) {
        setSelections(selections.concat([s]));
      }
    },
    selections: selections,
    batonProps: batonProps,
    data: [line0, line1],
    xDomain: [8, 27],
    yDomain: [0, 17],
    axesParameters: {
      title: 'Sample Multiline Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    } as DAxesParameters,
  };
  return <LinePlot {...singleProps} />;
};

export const SingleDynamic: StoryObj<typeof SingleComponentWithHooks> = {
  render: () => <SingleComponentWithHooks />,
};

export const MultiDynamic: StoryObj<typeof MultiComponentWithHooks> = {
  render: () => <MultiComponentWithHooks />,
};
