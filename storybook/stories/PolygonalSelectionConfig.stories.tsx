import type { StoryObj } from '@storybook/react';
import {
  PolygonalSelection,
  PolygonalSelectionConfig,
  PolygonalSelectionConfigProps,
} from '@davidia/component';

const meta = {
  title: 'Buttons/PolygonalSelectionConfig',
  component: PolygonalSelectionConfig,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const plotArgs = {
  selection: new PolygonalSelection(
    [
      [1, 1],
      [1, 2],
      [2, 3],
      [4, 1],
    ] as [number, number][],
    true
  ),
  updateSelection: () => {},
  disabled: false,
} as PolygonalSelectionConfigProps;

export const Static: Story = {
  args: plotArgs,
};
