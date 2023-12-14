import type { StoryObj } from '@storybook/react';
import { BsCardHeading } from 'react-icons/bs';
import { type AxisScaleType, ScaleType } from '@h5web/lib';
import { AxisConfigModal, AxisConfigModalProps } from '@davidia/component';

const meta = {
  title: 'Modals/AxisConfigModal',
  component: AxisConfigModal,
};

export default meta;
type Story = StoryObj<typeof meta>;

const props = {
  title: `Example Modal`,
  icon: BsCardHeading,
  label: 'modal label',
  scaleOptions: [ScaleType.Linear, ScaleType.Log,],
} as AxisConfigModalProps<AxisScaleType>;

export const axisConfigModal: Story = {
  args: props,
};
