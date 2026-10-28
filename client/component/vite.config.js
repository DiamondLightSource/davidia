var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { defineConfig } from 'vite';
import dts from 'unplugin-dts/vite';
import fs from 'fs';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
var pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
export var externals = new Set(__spreadArray(__spreadArray([], Object.keys(pkg.dependencies), true), Object.keys(pkg.peerDependencies), true));
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
            external: Array.from(externals, function (dep) { return new RegExp(String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["^", "($|/)"], ["^", "($|\\/)"])), dep), 'u'); } // e.g. externalize `react-icons/fi`
            ),
        },
    },
});
var templateObject_1;
