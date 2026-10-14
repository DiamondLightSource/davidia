import { defineConfig } from 'vite';
import dts from 'unplugin-dts/vite';
import fs from 'fs';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

export const externals = new Set([
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
]);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ bundleTypes: true })],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      name: 'davidia',
      fileName: 'index',
    },
    rolldownOptions: {
      external: Array.from(
        externals,
        (dep) => new RegExp(String.raw`^${dep}($|\/)`, 'u') // e.g. externalize `react-icons/fi`
      ),
    },
  },
});
