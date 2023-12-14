import type { StoryObj } from '@storybook/react';
import {
  BatonProps,
  SelectionBase,
  SelectionComponent,
  SelectionComponentProps,
} from '@davidia/component';

const meta = {
  title: 'Buttons/SelectionComponent',
  component: SelectionComponent,
  tags: ['autodocs'],
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
  addSelection: () => {},
  selections: [selection0, selection1],
  selectionType: 'line',
  modifierKey: 'Control',
  batonProps: batonProps,
  disabled: false,
} as SelectionComponentProps;

export const Static: Story = {
  args: plotArgs
};
