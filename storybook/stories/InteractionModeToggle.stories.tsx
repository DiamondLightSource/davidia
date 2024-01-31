import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import { InteractionModeToggle, InteractionModeType } from '@diamondlightsource/davidia';

const meta: Meta<typeof InteractionModeToggle> = {
  title: 'Toolbar components/InteractionModeToggle',
  component: InteractionModeToggle,
  tags: ['autodocs'],
};

export default meta;

export const Dynamic: StoryObj<typeof InteractionModeToggle> = {
  args: {
    value: InteractionModeType.selectRegion,
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(s: string) {
      updateArgs({ value: s });
    }

    return (
      <InteractionModeToggle
        {...args}
        onModeChange={onChange}
        hasBaton={true}
      />
    );
  },
};
