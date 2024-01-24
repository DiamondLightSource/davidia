module.exports = {
  env: { browser: true, es2020: true },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  parserOptions: {
    extraFileExtensions: ['.json'],
  },
};
