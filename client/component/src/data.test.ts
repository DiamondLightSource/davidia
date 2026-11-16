import { describe, expect, test } from 'vitest';
import {
  type ColourPoint,
  type ChannelValues,
  piecewiseColour,
  piecewiseRGBChannels,
} from './data';
import { rgb, type RGBColor } from 'd3-color';

const testColourValues: ColourPoint[] = [
  {
    point: 0.0,
    colour: [0.0, 0.2, 0.6],
  },
  {
    point: 0.5,
    colour: [0.6, 0.6, 1.0],
  },
  {
    point: 0.75,
    colour: [1.0, 0.8, 0.4],
  },
  {
    point: 1.0,
    colour: [0.4, 1.0, 1.0],
  },
];

const testPAInterpolator = piecewiseColour(testColourValues);

describe('Check piecewise colour', () => {
  test.each([
    [0.0, rgb(0, 51, 153)],
    [0.25, rgb(77, 102, 204)],
    [0.5, rgb(153, 153, 255)],
    [0.75, rgb(255, 204, 102)],
    [1.0, rgb(102, 255, 255)],
  ])('interpolate(%f) -> %s', (t: number, rgb: RGBColor) => {
    const it = testPAInterpolator(t);
    expect(it).toBe(rgb.toString());
  });
});

const testChannels: ChannelValues = {
  red: [
    [0.0, 0.0, 0.0],
    [0.5, 0.6, 0.6],
    [0.75, 1.0, 1.0],
    [1.0, 0.4, 0.4],
  ],
  green: [
    [0.0, 0.2, 0.2],
    [0.5, 0.6, 0.6],
    [0.75, 0.8, 0.8],
    [1.0, 1.0, 1.0],
  ],
  blue: [
    [0.0, 0.6, 0.6],
    [0.5, 1.0, 1.0],
    [0.75, 0.4, 0.4],
    [1.0, 1.0, 1.0],
  ],
};

const testPCInterpolator = piecewiseRGBChannels(testChannels);

describe('Check piecewise channels', () => {
  test.each([
    [0.0, rgb(0, 51, 153)],
    [0.25, rgb(77, 102, 204)],
    [0.5, rgb(153, 153, 255)],
    [0.75, rgb(255, 204, 102)],
    [1.0, rgb(102, 255, 255)],
  ])('interpolate(%f) -> %s', (t: number, rgb: RGBColor) => {
    const it = testPCInterpolator(t);
    expect(it).toBe(rgb.toString());
  });
});
