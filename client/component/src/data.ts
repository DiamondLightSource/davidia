import { rgb } from 'd3-color';
import { interpolateNumberArray } from 'd3-interpolate';

interface ColourPoint {
    point: number;
    colour: [number, number, number];
}

const terrainValues: ColourPoint[] = [ // from https://github.com/matplotlib/matplotlib/blob/bfa823972223d1c8d18c21b614c61b04668c94f5/lib/matplotlib/_cm.py#L195
    {
        point: 0.00,
        colour: [0.2, 0.2, 0.6],
    },
    {
        point: 0.15,
        colour: [0.0, 0.6, 1.0]
    },
    {
        point: 0.25,
        colour: [0.0, 0.8, 0.4],
    },
    {
        point: 0.50,
        colour: [1.0, 1.0, 0.6],
    },
    {
        point: 0.75,
        colour: [0.5, 0.36, 0.33],
    },
    {
        point: 1.00,
        colour: [1.0, 1.0, 1.0],
    },
    ];

function piecewiseArrayRGB(values: ColourPoint[]) {
  const n = values.length - 1;
  const P = new Array(n + 1);
  const D = new Array(n);
  const I = new Array(n);
  let cV = values[0];
  let cP = cV.point;
  let cC = cV.colour.map(x => x*255);
  for (let i = 0; i < n; i++) {
    const nV = values[i+1];
    const nP = nV.point;
    const nC = nV.colour.map(x => x*255);
    P[i] = cP;
    D[i] = nP - cP;
    I[i] = interpolateNumberArray(cC, nC);
    cV = nV;
    cP = nP;
    cC = nC;
  }
  P[n] = cP * 1.01;

  const c = rgb(0, 0, 0);
  return function(t: number) {
    const f = P.findIndex(p => t < p) - 1;
    const nc = I[f]((t - P[f])/D[f]);
    c.r = nc[0];
    c.g = nc[1];
    c.b = nc[2];
    return c.formatRgb();
  };
}

// piecewise linearly interpolate
const terrainInterpolator = piecewiseArrayRGB(terrainValues);
export { piecewiseArrayRGB, terrainInterpolator, type ColourPoint };