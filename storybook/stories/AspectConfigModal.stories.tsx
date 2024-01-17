import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import { BsCardHeading } from 'react-icons/bs';
import { Aspect } from '@h5web/lib';
import { AspectConfigModal } from '@davidia/component';

const meta: Meta<typeof AspectConfigModal> = {
  title: 'Toolbar components/AspectConfigModal',
  component: AspectConfigModal,
  tags: ['autodocs'],
};

export default meta;


export const Dynamic: StoryObj<typeof AspectConfigModal> = {
  args: {
    title: `Example Modal`,
    aspect: 'equal',
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(a: Aspect) {
      updateArgs({aspect: a});
    }

    return (
      <AspectConfigModal
        {...args}
        icon={BsCardHeading}
        setAspect={onChange}
      />
    );
  },
};
