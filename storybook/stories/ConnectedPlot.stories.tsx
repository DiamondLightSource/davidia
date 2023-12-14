import type { StoryObj } from '@storybook/react';
import { ConnectedPlot, ConnectedPlotProps } from '@davidia/component';

const meta = {
  title: 'Plots/ConnectedPlot',
  component: ConnectedPlot,
};

export default meta;
type Story = StoryObj<typeof meta>;

const plotArgs = {
  plot_id: 'plot_0',
  hostname: '127.0.0.1',
  port: '8000',
  uuid: 'fg5678jk',
} as ConnectedPlotProps;

export const connectedPlot: Story = {
  args: plotArgs,
};
