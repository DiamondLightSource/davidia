import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    global: 'window', // this fixes global is not defined
    'process.env.DRAGGABLE_DEBUG': 'undefined', // fixes react-draggable issue in its log function
  },
  build: {
    outDir: '../../server/example-client/sdist',
    emptyOutDir: true,
  },
});
