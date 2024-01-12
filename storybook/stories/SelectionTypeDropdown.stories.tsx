import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import {
  SelectionType,
  SelectionTypeDropdown,
} from '@davidia/component';


const meta: Meta<typeof SelectionTypeDropdown> = {
  title: 'Toolbar components/SelectionTypeDropdown',
  component: SelectionTypeDropdown,
  tags: ['autodocs'],
};
export default meta;

export const Dynamic: StoryObj<typeof SelectionTypeDropdown> = {
  args: {
    value: SelectionType.circle,
    options: [SelectionType.line, SelectionType.rectangle, SelectionType.circle],
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(v: SelectionType) {
      updateArgs({value: v});
    }
    
    return <SelectionTypeDropdown {...args} onSelectionTypeChange={onChange} disabled={false} />;
  },
};
