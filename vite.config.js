import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';

export default {
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  server: {
    mimeTypes: {
      'text/javascript': ['js', 'jsx'],
    },
  },
  plugins: [reactRefresh()],
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
};
