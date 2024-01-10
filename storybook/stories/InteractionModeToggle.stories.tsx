import type { StoryObj } from '@storybook/react';
import {
  InteractionModeToggle,
  InteractionModeToggleProps,
} from '@davidia/component';

const meta = {
  title: 'Toolbar components/InteractionModeToggle',
  component: InteractionModeToggle,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const toggleArgs = {
  value: 'selectRegion',
  onModeChange: () => {},
  hasBaton: true,
} as InteractionModeToggleProps;

export const Static: Story = {
  name: 'InteractionModeToggle',
  args: toggleArgs,
};
