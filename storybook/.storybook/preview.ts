import type { Preview } from '@storybook/react';
import { fn } from '@storybook/test';

const preview: Preview = {
  parameters: {
    actions: { onClick: fn() },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Plots',
          [
            'Line',
            'Image',
            'Heatmap',
            'Scatter',
            'Surface',
            'Table',
            'ConnectedPlot',
          ],
          'Modals',
          'Toolbar Components',
        ],
      },
    },
  },

  tags: ['autodocs'],
};

export default preview;
