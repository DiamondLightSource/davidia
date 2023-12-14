import type { StoryObj } from '@storybook/react';
import {
  RectangularSelection,
  RectangularSelectionConfig,
  RectangularSelectionConfigProps,
} from '@davidia/component';

const meta = {
  title: 'Buttons/RectangularSelectionConfig',
  component: RectangularSelectionConfig,
};

export default meta;
type Story = StoryObj<typeof meta>;

const plotArgs = {
  selection: new RectangularSelection([2, 3], [4, 5]),
  updateSelection: () => {},
  disabled: false,
} as RectangularSelectionConfigProps;

export const Static: Story = {
  name: "RectangularSelectionConfig",
  args: plotArgs,
};
