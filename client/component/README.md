## Frontend documentation

View the frontend Typescript documentation [here](https://diamondlightsource.github.io/davidia/typedocs/index.html).

## Installation

Currently, only React 18 is supported.

### `pnpm add @diamondlightsource/davidia`

## Vite configuration

Use `vite < 8` in your devDependencies.

Some davidia dependencies require a global object to be defined when used in Vite applications. Add the following to your vite.config.ts:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
});
```
