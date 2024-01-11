import { useState } from 'react';
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

const ComponentWithHooks = () => {
  const [selection, setSelection] = useState<string>('abcdef');
  const props: SelectionIDDropdownProps = {
    selections: [selection0, selection1],
    selectionID: selection,
    onSelectionIDChange: (s: string) => {setSelection(s)},
    options: ['abcdef', 'ghijkl'],
  }
  return <SelectionIDDropdown {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
