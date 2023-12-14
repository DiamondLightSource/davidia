import type { StoryObj } from '@storybook/react';
import { IoShapesOutline } from "react-icons/io5";
import {
  BaseSelection,
  SelectionConfig,
  SelectionConfigProps,
} from '@davidia/component';

const meta = {
  title: 'Buttons/SelectionConfig',
  component: SelectionConfig,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const bSelection0 = new BaseSelection([2, 3]);
const bSelection1 = new BaseSelection([5, 1]);


const plotArgs = {
  title: "Selection Config Example",
  selections: [bSelection0, bSelection1],
  updateSelections: () => {},
  currentSelectionID: bSelection0.id,
  updateCurrentSelectionID: () => {},
  showSelectionConfig: true,
  updateShowSelectionConfig: () => {},
  hasBaton: true,
  icon: IoShapesOutline,
  label: 'label',
  domain: [0, 5],
  customDomain: [0, 5],
} as SelectionConfigProps;

export const Static: Story = {
  args: plotArgs,
};
