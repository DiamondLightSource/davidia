import { useState } from 'react';
import type { StoryObj } from '@storybook/react';
import { BsCardHeading } from 'react-icons/bs';
import { Aspect } from '@h5web/lib';
import { AspectConfigModal, AspectConfigModalProps } from '@davidia/component';

const meta = {
  title: 'Toolbar components/AspectConfigModal',
  component: AspectConfigModal,
  tags: ['autodocs'],
};

export default meta;

const ComponentWithHooks = () => {
  const [aspect, setAspect] = useState<Aspect>('equal');
  const props: AspectConfigModalProps = {
    title: `Example Modal`,
    icon: BsCardHeading,
    aspect: aspect,
    setAspect: (a: Aspect) => {
      setAspect(a);
    },
  };
  return <AspectConfigModal {...props} />;
};

type Story = StoryObj<typeof ComponentWithHooks>;

export const Dynamic: Story = {
  render: () => <ComponentWithHooks />,
};
