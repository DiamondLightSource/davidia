import { useState } from 'react';
import type { StoryObj } from '@storybook/react';
import { CustomDomain, Domain, ScaleType } from '@h5web/lib';
import {
  createHistogramParams,
  DomainConfig,
  DomainConfigProps,
} from '@davidia/component';

const meta = {
  title: 'Toolbar components/DomainConfig',
  component: DomainConfig,
  tags: ['autodocs'],
};

export default meta;

const ComponentWithHooks = () => {
  const histo_function = () =>
  createHistogramParams(
    new Float64Array([4, 5, 6, 7, 12, 20]),
    [0, 20],
    'Cividis',
    false
  );
  const [customDomain, setCustomDomain] = useState<CustomDomain>([5, 15] as CustomDomain);
  const props: DomainConfigProps = {
    dataDomain: [0, 20] as Domain,
    customDomain: customDomain,
    scaleType: ScaleType.Linear,
    onCustomDomainChange: (c: CustomDomain) => {setCustomDomain(c)},
    histogramFunction: histo_function,
  };
  return <DomainConfig {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
