import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import {
  SelectionIDDropdown,
  SelectionBase,
} from '@davidia/component';

const meta: Meta<typeof SelectionIDDropdown> = {
  title: 'Toolbar components/SelectionIDDropdown',
  component: SelectionIDDropdown,
  tags: ['autodocs'],
};
export default meta;

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

export const Dynamic: StoryObj<typeof SelectionIDDropdown> = {
  args: {
    selections: [selection0, selection1],
    selectionID: selection0.id,
    options: [selection0.id, selection1.id],
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(v: string) {
      updateArgs({selectionID: v});
    }

    return <SelectionIDDropdown {...args} onSelectionIDChange={onChange} />;
  },
};
