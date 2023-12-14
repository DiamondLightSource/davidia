import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react';
import {
  AnyPlot,
  BatonProps,
  TableDisplayProps,
  TableDisplayParams,
} from '@davidia/component';

const meta = {
  title: 'Plots/AnyPlot/Table',
  component: AnyPlot,
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

const dataArray = ndarray(new Float32Array(5 * 20), [5, 20]);
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 20; j++) {
    dataArray.set(i, j, 6.23 * j);
  }
}
const tableArgs = {
  addSelection: () => {},
  selections: [],
  batonProps: batonProps,
  cellWidth: 100,
  dataArray: dataArray,
  displayParams: {} as TableDisplayParams,
} as TableDisplayProps;

export const Table: Story = {
  args: tableArgs,
};
