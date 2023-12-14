import type { StoryObj } from '@storybook/react';
import { BsCardHeading } from 'react-icons/bs';
import { Modal, ModalProps } from '@davidia/component';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Modals/Modal',
  component: Modal,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // text: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Static: Story = {
  args: {
    text: 'Hello world',
  },
};

const ComponentWithHooks = () => {
  const props: ModalProps = {
    title: `Example Modal`,
    icon: BsCardHeading,
    children: (
      <>
        <div>Content of Modal</div>
      </>
    ),
  };
  return <Modal {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
