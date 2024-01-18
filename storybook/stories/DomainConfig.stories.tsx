import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import { CustomDomain, Domain, ScaleType } from '@h5web/lib';
import { createHistogramParams, DomainConfig } from '@davidia/component';

const meta: Meta<typeof DomainConfig> = {
  title: 'Toolbar components/DomainConfig',
  component: DomainConfig,
  tags: ['autodocs'],
};

export default meta;

const histo_function = () =>
  createHistogramParams(
    new Float64Array([4, 5, 6, 7, 12, 20]),
    [0, 20],
    'Cividis',
    false
  );

export const Dynamic: StoryObj<typeof DomainConfig> = {
  args: {
    dataDomain: [0, 20] as Domain,
    customDomain: [5, 15] as CustomDomain,
    scaleType: ScaleType.Linear,
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onChange(c: CustomDomain) {
      updateArgs({ customDomain: c });
    }

    return (
      <DomainConfig
        {...args}
        onCustomDomainChange={onChange}
        histogramFunction={histo_function}
      />
    );
  },
};
