import type { StoryObj } from '@storybook/react';
import { BsCardHeading } from 'react-icons/bs';

import { AspectConfigModal, AspectConfigModalProps } from '@davidia/component';

const meta = {
  title: 'Modals/AspectConfigModal',
  component: AspectConfigModal,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // text: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {
  args: {
    title: `First AspectConfigModal`,
    icon: BsCardHeading,
    aspect: 'equal',
    setAspect: () => ({}),
  },
};

const ComponentWithHooks = () => {
  const props: AspectConfigModalProps = {
    title: `Example Modal`,
    icon: BsCardHeading,
    aspect: 'equal',
    setAspect: () => ({}),
  };
  return <AspectConfigModal {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
