import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import { LabelledInput } from '@davidia/component';

const meta: Meta<typeof LabelledInput<number>> = {
  title: 'Toolbar components/LabelledInput',
  component: LabelledInput<number>,
  tags: ['autodocs'],
};

export default meta;

function isNumber(value: string): [boolean, number] {
  const n = parseFloat(value);
  return [Number.isFinite(n), n];
}

export const Dynamic: StoryObj<typeof LabelledInput<number>> = {
  args: {
    isValid: (value: string) => isNumber(value),
    label: 'length',
    input: 4.7234,
    decimalPlaces: 3,
    submitLabel: 'Submit',
    enableEnterKey: true,
    resetButton: true,
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(v: number) {
      updateArgs({ input: v });
    }

    return (
      <LabelledInput<number>
        {...args}
        updateValue={onChange}
        disabled={false}
      />
    );
  },
};
