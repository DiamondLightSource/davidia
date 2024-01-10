import type { StoryObj } from '@storybook/react';
import {
  SelectionIDDropdown,
  SelectionIDDropdownProps,
  SelectionBase,
} from '@davidia/component';

const meta = {
  title: 'Toolbar components/SelectionIDDropdown',
  component: SelectionIDDropdown,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const selection0 = {
  id: 'abcdef',
  name: 'blue',
  colour: 'blue',
  alpha: 0.3,
  fixed: false,
  start: [0, 0],
  asDashed: false,
  toString: () => {},
} as SelectionBase;

const selection1 = {
  id: 'ghijkl',
  name: 'red',
  colour: 'red',
  alpha: 0.3,
  fixed: false,
  start: [2, 3],
  asDashed: false,
  toString: () => {},
} as SelectionBase;

const plotArgs = {
  selections: [selection0, selection1],
  selectionID: 'selection0',
  onSelectionIDChange: () => {},
  options: ['abcdef', 'ghijkl'],
} as SelectionIDDropdownProps;

export const Static: Story = {
  name: 'SelectionIDDropdown',
  args: plotArgs,
};
