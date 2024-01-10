import type { StoryObj } from '@storybook/react';
import { BsCardHeading } from 'react-icons/bs';
import { Modal, ModalProps } from '@davidia/component';

const meta = {
  title: 'Toolbar components/Modal',
  component: Modal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const props = {
  title: `Example Modal`,
  icon: BsCardHeading,
  children: (
    <>
      <div>Content of Modal</div>
    </>
  ),
} as ModalProps;

export const ModalStory: Story = {
  name: 'Modal',
  args: props,
};
