import ndarray from 'ndarray';
import type { StoryFn, StoryObj } from '@storybook/react';
import {
  TableDisplayProps,
  TableDisplayParams,
  TableDisplay,
} from '@diamondlightsource/davidia';

const meta = {
  title: 'Plots/Table',
  component: TableDisplay,
  tags: ['autodocs'],
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

const numbers = Array.from({ length: 101 }, (_, i) => i);

const tableArgs = {
  addSelection: () => {},
  selections: [],
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
