import { describe, expect, test } from 'vitest';
import { type ColourPoint, piecewiseArrayRGB } from './data';
import { rgb, type RGBColor } from 'd3-color';

const testValues: ColourPoint[] = [
    {
        point: 0.00,
        colour: [0.0, 0.2, 0.6],
    },
    {
        point: 0.50,
        colour: [0.6, 0.6, 1.0]
    },
    {
        point: 0.75,
        colour: [1.0, 0.8, 0.4],
    },
    {
        point: 1.00,
        colour: [0.4, 1.0, 1.0],
    },
    ];

const testInterpolator = piecewiseArrayRGB(testValues);

describe('Check piecewise array rgb', () => {
    test.each([
        [0.00, rgb(0, 51, 153)],
        [0.25, rgb(77, 102, 204)],
        [0.50, rgb(153, 153, 255)],
        [0.75, rgb(255, 204, 102)],
        [1.00, rgb(102, 255, 255)],
    ])('interpolate(%f) -> %s', (t: number, rgb: RGBColor) => {
        const it = testInterpolator(t);
        expect(it).toBe(rgb.toString());
    });
});