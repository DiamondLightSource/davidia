import { Vector3 } from 'three';
import type { StoryObj } from '@storybook/react';
import {
  LinearSelectionConfig,
  LinearSelection,
  LinearSelectionConfigProps
} from '@davidia/component';

const meta = {
  title: 'Modals/LinearSelectionConfig',
  component: LinearSelectionConfig,
};

export default meta;
type Story = StoryObj<typeof meta>;


const linearSelection = LinearSelection.createFromPoints([new Vector3(4, 0, 0), new Vector3(19.6, -1.5, 0)]);

const inputArgs = {
  selection: linearSelection,
  updateSelection: () => {},
  disabled: false,
} as LinearSelectionConfigProps;

export const linearSelectionConfig: Story = {
  name: "LinearSelectionConfig",
  args: inputArgs
};
