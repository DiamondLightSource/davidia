import { useState } from 'react';
import type { StoryObj } from '@storybook/react';
import { LabelledInput, LabelledInputProps } from '@davidia/component';

const meta = {
  title: 'Toolbar components/LabelledInput',
  component: LabelledInput<number>,
  tags: ['autodocs'],
};

export default meta;

function isNumber(value: string): [boolean, number] {
  const n = parseFloat(value);
  return [Number.isFinite(n), n];
}

const ComponentWithHooks = () => {
  const [value, setValue] = useState<number>(4.7234);
  const props: LabelledInputProps<number> = {
    updateValue: (v: number) => {setValue(v)},
    isValid: (value: string) => isNumber(value),
    label: 'length',
    input: value,
    decimalPlaces: 3,
    submitLabel: 'Submit',
    disabled: false,
    enableEnterKey: true,
    resetButton: true,
  };
  return <LabelledInput {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
