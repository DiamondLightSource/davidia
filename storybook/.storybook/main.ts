import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  staticDirs: [
    {
      from: '../../typedocs',
      to: 'typedocs',
    },
    '../public',
  ],

  addons: ['@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  docs: {},

  core: {
    builder: '@storybook/builder-vite',
    disableTelemetry: true,
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      include: ['../../client/component/src/**/*.{ts,tsx}'],
      tsconfigPath: '../tsconfig.json',
    },
  },
};
export default config;
