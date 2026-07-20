import { globalIgnores } from 'eslint/config';

import base from '../eslint.config.js';

export default [
  ...base,
  globalIgnores(['!.storybook', '**/public', '**/storybook-static']),
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  },
];
