import type { StoryObj } from '@storybook/react';
import {
  SelectionTypeDropdown,
  SelectionDropdownProps,
} from '@davidia/component';

const meta = {
  title: 'Toolbar components/SelectionTypeDropdown',
  component: SelectionTypeDropdown,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const plotArgs = {
  value: 'circle',
  onSelectionTypeChange: () => {},
  disabled: false,
  options: ['line', 'rectangle', 'circle'],
} as SelectionDropdownProps;

export const Static: Story = {
  name: 'SelectionTypeDropdown',
  args: plotArgs,
};
