import type { StoryObj } from '@storybook/react';
import { ConnectedPlot, ConnectedPlotProps } from '@diamondlightsource/davidia';

const meta = {
  title: 'Plots/ConnectedPlot',
  component: ConnectedPlot,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const plotArgs = {
  plotId: 'plot_0',
  hostname: '127.0.0.1',
  port: '8000',
  uuid: 'fg5678jk',
} as ConnectedPlotProps;

/**
 * If the plot server connection is not available, see the `Using Davidia` tab for how to set it up.
 */
export const Plot: Story = {
  args: plotArgs,
};
