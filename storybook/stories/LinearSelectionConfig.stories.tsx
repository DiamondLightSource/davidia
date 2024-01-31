import { Vector3 } from 'three';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import {
  LinearSelectionConfig,
  LinearSelection,
  SelectionBase,
} from '@diamondlightsource/davidia';

const meta: Meta<typeof LinearSelectionConfig> = {
  title: 'Toolbar components/LinearSelectionConfig',
  component: LinearSelectionConfig,
  tags: ['autodocs'],
};

export default meta;

const selection = LinearSelection.createFromPoints([
  new Vector3(4, 0, 0),
  new Vector3(19.6, -1.5, 0),
]);

export const Dynamic: StoryObj<typeof LinearSelectionConfig> = {
  args: {
    selection: selection,
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(s: SelectionBase | null) {
      if (s != null) {
        if (s != null) {
          updateArgs({ selection: s });
        }
      }
    }

    return (
      <LinearSelectionConfig
        {...args}
        updateSelection={onChange}
        disabled={false}
      />
    );
  },
};
