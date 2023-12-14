import type { StoryObj } from '@storybook/react';
import { BsCardHeading } from 'react-icons/bs';

import { AspectConfigModal, AspectConfigModalProps } from '@davidia/component';

const meta = {
  title: 'Modals/AspectConfigModal',
  component: AspectConfigModal,
};

export default meta;
type Story = StoryObj<typeof meta>;

const props = {
  title: `Example Modal`,
  icon: BsCardHeading,
  aspect: 'equal',
  setAspect: () => ({}),
} as AspectConfigModalProps;

export const aspectConfigModal: Story = {
  args: props,
};
