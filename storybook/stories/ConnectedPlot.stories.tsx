import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectedPlot } from '@diamondlightsource/davidia';

const meta: Meta<typeof ConnectedPlot> = {
  title: 'Plots/ConnectedPlot',
  component: ConnectedPlot,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * If the plot server connection is not available, see the `Using Davidia` tab for how to set it up.
 */
export const Plot: Story = {
  args: {
    plotId: 'plot_0',
    hostname: '127.0.0.1',
    port: '8000',
    uuid: 'fg5678jk',
  },
};
