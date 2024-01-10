import type { StoryObj } from '@storybook/react';
import { LabelledInput, LabelledInputProps } from '@davidia/component';

const meta = {
  title: 'Toolbar components/LabelledInput',
  component: LabelledInput<number>,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function isNumber(value: string): [boolean, number] {
  const n = parseFloat(value);
  return [Number.isFinite(n), n];
}

const inputArgs = {
  updateValue: () => {},
  isValid: (value: string) => isNumber(value),
  label: 'length',
  input: 4.7234,
  decimalPlaces: 3,
  submitLabel: 'Submit',
  disabled: false,
  enableEnterKey: true,
  resetButton: true,
} as LabelledInputProps<number>;

export const Static: Story = {
  name: 'LabelledInput',
  args: inputArgs,
};
