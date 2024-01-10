import type { Domain } from '@h5web/lib';

import type { StoryObj } from '@storybook/react';
import { ScaleType } from '@h5web/lib';
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
type Story = StoryObj<typeof meta>;

const histo_function = () =>
  createHistogramParams(
    new Float64Array([4, 5, 6, 7, 12, 20]),
    [0, 20],
    'Cividis',
    false
  );

const plotArgs = {
  dataDomain: [0, 20] as Domain,
  customDomain: [5, 15] as Domain,
  scaleType: ScaleType.Linear,
  onCustomDomainChange: () => ({}),
  histogramFunction: histo_function,
} as DomainConfigProps;

export const DomainConf: Story = {
  name: 'DomainConfig',
  args: plotArgs,
};
