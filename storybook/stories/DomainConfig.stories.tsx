import type { Domain } from '@h5web/lib';

import type { StoryObj } from '@storybook/react';
import {
  createHistogramParams,
  DomainConfig,
  DomainConfigProps,
} from '@davidia/component';

const meta = {
  title: 'Modals/DomainConfig',
  component: DomainConfig,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const histo_function = () =>
  createHistogramParams([4, 5, 6, 7, 12, 20], [0, 20], 'Cividis', false);

const plotArgs = {
  dataDomain: [0, 20] as Domain,
  customDomain: [5, 15] as Domain,
  scaleType: 'linear',
  onCustomDomainChange: () => ({}),
  histogramFunction: histo_function,
} as DomainConfigProps;

export const Static: Story = {
  args: plotArgs,
};
