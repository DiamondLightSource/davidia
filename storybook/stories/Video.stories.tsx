import type { Meta, StoryObj } from '@storybook/react-vite';
import { VideoPlot } from '@diamondlightsource/davidia';

const meta: Meta<typeof VideoPlot> = {
  title: 'Plots/Video',
  component: VideoPlot,
  tags: ['autodocs'],
};

export default meta;

export const Heatmap: StoryObj<typeof VideoPlot> = {
  args: {
    plotConfig: {
      title: 'Sample Video Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    },
    // sourceURL: "http://localhost:8080/stream.mjpeg",
    // isImage: true,
    sourceURL: "Jellyfish_1080_10s_2MB.webm",
  },
};
