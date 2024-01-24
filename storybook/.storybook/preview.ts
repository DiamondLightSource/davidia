import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Plots', ['Line', 'Image', 'Heatmap', 'Scatter', 'Surface', 'Table', 'ConnectedPlot'], 'Modals', 'Toolbar Components'],
      },
    },
  },
};

export default preview;
