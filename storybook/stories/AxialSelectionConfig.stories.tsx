import type { StoryObj } from '@storybook/react';
import {
  AxialSelection,
  AxialSelectionConfig,
  SelectionBase,
} from '@davidia/component';

const meta = {
  title: 'Modals/AxialSelectionConfig',
  component: AxialSelectionConfig,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const selection = new AxialSelection([21, 0], 1.224, 0);

export const AxialConfig: Story = {
  name: 'AxialSelectionConfig',
  args: {
    selection: selection,
    updateSelection: (
      _s: SelectionBase | null,
      _b?: boolean | undefined,
      _c?: boolean | undefined
    ) => ({}),
    disabled: false,
  },
};
