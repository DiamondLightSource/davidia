import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import {
  PolygonalSelection,
  PolygonalSelectionConfig,
  SelectionBase,
} from '@davidia/component';

const meta: Meta<typeof PolygonalSelectionConfig> = {
  title: 'Toolbar components/PolygonalSelectionConfig',
  component: PolygonalSelectionConfig,
  tags: ['autodocs'],
};

export default meta;

const selection = new PolygonalSelection(
  [
    [1, 1],
    [1, 2],
    [2, 3],
    [4, 1],
  ] as [number, number][],
  true
);

export const Polygonal: StoryObj<typeof PolygonalSelectionConfig> = {
  args: {
    selection: selection,
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(s: SelectionBase | null) {
      if (s != null) {
        updateArgs({ selection: s });
      }
    }

    return (
      <PolygonalSelectionConfig
        {...args}
        updateSelection={onChange}
        disabled={false}
      />
    );
  },
};
