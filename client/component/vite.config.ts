import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import fs from 'fs';
import react from '@vitejs/plugin-react';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

export const externals = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    // @ts-ignore
    dts({ bundleTypes: true })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: externals.map((dep) => new RegExp(`^${dep}($|\\/)`, 'u')), // e.g. externalize `react-icons/fi`
      output: { interop: 'compat' }, // for compatibility with Jest in consumer projects (default changed in Rollup 3/Vite 4: https://rollupjs.org/migration/#changed-defaults)
    },
  },
});
