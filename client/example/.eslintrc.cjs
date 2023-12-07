module.exports = {
  env: { browser: true, es2020: true },
  ignorePatterns: [
    'dist',
    '.eslintrc.cjs',
    '**/*.css',
    '**/*.html',
    '**/*.svg',
    '**/*.md',
  ],
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};
