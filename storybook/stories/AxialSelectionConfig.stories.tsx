import { Vector3 } from 'three';
import type { StoryObj } from '@storybook/react';
import {
  AxialSelection,
  AxialSelectionConfig,
  SelectionBase,
} from '@davidia/component';

const meta = {
  title: 'Modals/AxialSelectionConfig',
  component: AxialSelectionConfig,
};

export default meta;
type Story = StoryObj<typeof meta>;

const selection = {
  alpha: 0.3,
  asDashed: false,
  colour: '#882255',
  defaultColour: '#882255',
  dimension: 0,
  fixed: false,
  id: '14e9e388',
  length: 1.224,
  name: 'horizonatalAxis0',
  start: [21, 0],
  vStart: new Vector3(21, 0, 0),
} as AxialSelection;

export const AxialConfig: Story = {
  name: 'AxialSelectionConfig',
  args: {
    selection: selection,
    updateSelection: (
      _s: SelectionBase | null,
      _b?: boolean | undefined,
      _c?: boolean | undefined
    ) => ({}),
    disabled: false,
  },
};
