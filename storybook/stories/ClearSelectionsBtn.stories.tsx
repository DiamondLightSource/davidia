import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import {
  ClearSelectionsBtn,
  BaseSelection,
  SelectionBase,
} from '@diamondlightsource/davidia';

const meta: Meta<typeof ClearSelectionsBtn> = {
  title: 'Toolbar components/ClearSelectionsBtn',
  component: ClearSelectionsBtn,
  tags: ['autodocs'],
};

export default meta;

const selection = { start: [0, 10] } as BaseSelection;

export const Dynamic: StoryObj<typeof ClearSelectionsBtn> = {
  args: {
    selections: [selection],
    currentSelectionID: selection.id,
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onSelectionChange(_s: SelectionBase | null) {
      updateArgs({ selections: [] });
    }

    function onSelectionIDChange(s: string | null) {
      if (s != null) {
        updateArgs({ currentSelectionID: s });
      }
    }

    return (
      <ClearSelectionsBtn
        {...args}
        updateSelections={onSelectionChange}
        updateCurrentSelectionID={onSelectionIDChange}
        disabled={false}
      />
    );
  },
};
