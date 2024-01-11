import type { StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  SelectionType,
  SelectionTypeDropdown,
  SelectionDropdownProps,
} from '@davidia/component';

const meta = {
  title: 'Toolbar components/SelectionTypeDropdown',
  component: SelectionTypeDropdown,
  tags: ['autodocs'],
};

export default meta;

const ComponentWithHooks = () => {
    const [value, setValue] = useState<SelectionType>(SelectionType.circle);
    const props: SelectionDropdownProps = {
      value: value,
      onSelectionTypeChange: (v: SelectionType) => {setValue(v)},
      disabled: false,
      options: [SelectionType.line, SelectionType.rectangle, SelectionType.circle],
    }
    return <SelectionTypeDropdown {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
    render: () => <ComponentWithHooks />,
};
