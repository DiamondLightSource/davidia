import { Vector3 } from 'three';
import type { StoryObj } from '@storybook/react';
import { AxialSelection, AxialSelectionConfig } from '@davidia/component';

const meta = {
  title: 'Toolbar components/AxialSelectionConfig',
  component: AxialSelectionConfig,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const axialArgs = {
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
  args: { selection: axialArgs, updateSelection: () => ({}), disabled: false },
};
