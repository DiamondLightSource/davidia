import ndarray from 'ndarray';
import type { StoryFn, StoryObj } from '@storybook/react';
import {
  AnyPlot,
  BatonProps,
  TableDisplayProps,
  TableDisplayParams,
} from '@davidia/component';

const meta = {
  title: 'Plots/AnyPlot/Table',
  component: AnyPlot,
  tags: ['autodocs'],
  argTypes: {
    domain: { table: { disable: true } },
    heatmapScale: { table: { disable: true } },
    colourMap: { table: { disable: true } },
    values: { table: { disable: true } },
    axesParameters: { table: { disable: true } },
    aspect: { table: { disable: true } },
    data: { table: { disable: true } },
    xDomain: { table: { disable: true } },
    yDomain: { table: { disable: true } },
    xData: { table: { disable: true } },
    yData: { table: { disable: true } },
    surfaceScale: { table: { disable: true } },
  },
  decorators: [
    (Story: StoryFn) => (
      <div style={{ display: 'grid', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const batonProps = {
  uuid: '14e9e388',
  batonUuid: '14e9e388',
  others: ['22f4c778', '32g5b835'] as string[],
  hasBaton: true,
  requestBaton: () => ({}),
  approveBaton: () => ({}),
} as BatonProps;

const numbers = Array.from({ length: 101 }, (_, i) => i);

const tableArgs = {
  addSelection: () => {},
  selections: [],
  batonProps: batonProps,
  cellWidth: 100,
  dataArray: ndarray(new Float32Array(numbers.length * 5), [5, 20]),
  displayParams: {} as TableDisplayParams,
} as TableDisplayProps;

export const Table: Story = {
  args: tableArgs,
  parameters: {
    layout: 'padded',
  },
};
