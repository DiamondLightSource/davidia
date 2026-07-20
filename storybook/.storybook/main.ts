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
  ],

  addons: ['@storybook/addon-links', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  docs: {},

  core: {
    disableTelemetry: true,
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      include: ['../../client/component/src/**/*.{ts,tsx}'],
      tsconfigPath: '../tsconfig.json',
    },
  },

  // workaround Firefox ESR 140 bug (fixed in 147+)
  // https://github.com/storybookjs/storybook/issues/33743
  // solution from https://github.com/storybookjs/storybook/issues/33769
  // fix in 10.5.0
  managerHead: (head: string | undefined) => `
    ${head}
    <style>
    main[aria-labelledby="main-preview-heading"] > div {
      place-content: stretch;
    }
    </style>
  `,
};
export default config;
