import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import { BsCardHeading } from 'react-icons/bs';
import { IconType } from 'react-icons';
import { Aspect } from '@h5web/lib';
import { AspectConfigModal } from '@diamondlightsource/davidia';

const meta: Meta<typeof AspectConfigModal> = {
  title: 'Modals/AspectConfigModal',
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
      updateArgs({ aspect: a });
    }

    return (
      <AspectConfigModal
        {...args}
        icon={BsCardHeading as IconType}
        setAspect={onChange}
      />
    );
  },
};
