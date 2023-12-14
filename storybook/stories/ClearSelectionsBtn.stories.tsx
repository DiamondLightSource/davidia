import type { StoryObj } from '@storybook/react';
import { ClearSelectionsBtnProps, ClearSelectionsBtn, BaseSelection } from '@davidia/component';

const meta = {
  title: 'Buttons/ClearSelectionsBtn',
  component: ClearSelectionsBtn,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const selection = {'start': [0, 10]} as BaseSelection;
const selectionID = selection.id;

const btnArgs = {
  selections: [selection],
  updateSelections: () => ({}),
  currentSelectionID: selectionID,
  updateCurrentSelectionID: () => ({}),
  disabled: false,
} as ClearSelectionsBtnProps;

export const Static: Story = {
  args: btnArgs,
};
