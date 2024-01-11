import type { StoryObj } from '@storybook/react';
import { BatonConfigModal, BatonProps } from '@davidia/component';

const meta = {
  title: 'Modals/BatonConfigModal',
  component: BatonConfigModal,
};

export default meta;
type Story = StoryObj<typeof meta>;

const batonArgs = {
  uuid: '14e9e388',
  batonUuid: '14e9e388',
  others: ['22f4c778', '32g5b835'] as string[],
  hasBaton: true,
  requestBaton: () => ({}),
  approveBaton: (_s: string) => ({}),
} as BatonProps;

export const BatonConfig: Story = {
  name: 'BatonConfigModal',
  args: batonArgs,
};
