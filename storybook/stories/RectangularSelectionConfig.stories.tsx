import type { StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import {
  RectangularSelection,
  RectangularSelectionConfig,
  SelectionBase,
} from '@diamondlightsource/davidia';

const meta = {
  title: 'Toolbar components/RectangularSelectionConfig',
  component: RectangularSelectionConfig,
  tags: ['autodocs'],
};

export default meta;

export const Rectangular: StoryObj<typeof RectangularSelectionConfig> = {
  args: {
    selection: new RectangularSelection([2, 3], [4, 5]),
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(s: SelectionBase | null) {
      if (s != null) {
        updateArgs({ selection: s });
      }
    }

    return (
      <RectangularSelectionConfig
        {...args}
        updateSelection={onChange}
        disabled={false}
      />
    );
  },
};
