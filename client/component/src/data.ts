import { rgb } from 'd3-color';
import { interpolateNumberArray, interpolateNumber } from 'd3-interpolate';

interface ColourPoint {
  point: number;
  colour: [number, number, number];
}

const terrainValues: ColourPoint[] = [
  // from https://github.com/matplotlib/matplotlib/blob/bfa823972223d1c8d18c21b614c61b04668c94f5/lib/matplotlib/_cm.py#L195
  {
    point: 0.0,
    colour: [0.2, 0.2, 0.6],
  },
  {
    point: 0.15,
    colour: [0.0, 0.6, 1.0],
  },
  {
    point: 0.25,
    colour: [0.0, 0.8, 0.4],
  },
  {
    point: 0.5,
    colour: [1.0, 1.0, 0.6],
  },
  {
    point: 0.75,
    colour: [0.5, 0.36, 0.33],
  },
  {
    point: 1.0,
    colour: [1.0, 1.0, 1.0],
  },
];

interface ChannelValues {
  red: Array<[number, number, number]>; // parameter value, finish, start
  green: Array<[number, number, number]>;
  blue: Array<[number, number, number]>;
}
const gistEarthValues: ChannelValues = {
  // https://github.com/matplotlib/matplotlib/blob/c7db3a61e120e55dd89fed906307fee08a55f496/lib/matplotlib/_cm.py#L983
  red: [
    [0.0, 0.0, 0.0],
    [0.2824, 0.1882, 0.1882],
    [0.4588, 0.2714, 0.2714],
    [0.549, 0.4719, 0.4719],
    [0.698, 0.7176, 0.7176],
    [0.7882, 0.7553, 0.7553],
    [1.0, 0.9922, 0.9922],
  ],
  green: [
    [0.0, 0.0, 0.0],
    [0.0275, 0.0, 0.0],
    [0.1098, 0.1893, 0.1893],
    [0.1647, 0.3035, 0.3035],
    [0.2078, 0.3841, 0.3841],
    [0.2824, 0.502, 0.502],
    [0.5216, 0.6397, 0.6397],
    [0.698, 0.7171, 0.7171],
    [0.7882, 0.6392, 0.6392],
    [0.7922, 0.6413, 0.6413],
    [0.8, 0.6447, 0.6447],
    [0.8078, 0.6481, 0.6481],
    [0.8157, 0.6549, 0.6549],
    [0.8667, 0.6991, 0.6991],
    [0.8745, 0.7103, 0.7103],
    [0.8824, 0.7216, 0.7216],
    [0.8902, 0.7323, 0.7323],
    [0.898, 0.743, 0.743],
    [0.9412, 0.8275, 0.8275],
    [0.9569, 0.8635, 0.8635],
    [0.9647, 0.8816, 0.8816],
    [0.9961, 0.9733, 0.9733],
    [1.0, 0.9843, 0.9843],
  ],
  blue: [
    [0.0, 0.0, 0.0],
    [0.0039, 0.1684, 0.1684],
    [0.0078, 0.2212, 0.2212],
    [0.0275, 0.4329, 0.4329],
    [0.0314, 0.4549, 0.4549],
    [0.2824, 0.5004, 0.5004],
    [0.4667, 0.2748, 0.2748],
    [0.5451, 0.3205, 0.3205],
    [0.7843, 0.3961, 0.3961],
    [0.8941, 0.6651, 0.6651],
    [1.0, 0.9843, 0.9843],
  ],
};

function piecewiseColour(values: ColourPoint[]) {
  const n = values.length - 1;
  const P = new Array(n + 1);
  const D = new Array(n);
  const I = new Array(n);
  let cV = values[0];
  let cP = cV.point;
  let cC = cV.colour.map((x) => x * 255);
  for (let i = 0; i < n; i++) {
    const nV = values[i + 1];
    const nP = nV.point;
    const nC = nV.colour.map((x) => x * 255);
    P[i] = cP;
    D[i] = nP - cP;
    I[i] = interpolateNumberArray(cC, nC);
    cV = nV;
    cP = nP;
    cC = nC;
  }
  P[n] = cP * 1.01;

  const c = rgb(0, 0, 0);
  return function (t: number) {
    const f = P.findIndex((p) => t < p) - 1;
    const nc = I[f]((t - P[f]) / D[f]);
    c.r = nc[0];
    c.g = nc[1];
    c.b = nc[2];
    return c.formatRgb();
  };
}

// piecewise linearly interpolate
const terrainInterpolator = piecewiseColour(terrainValues);

function piecewiseChannel(values: Array<[number, number, number]>) {
  const n = values.length - 1;
  const P = new Array(n + 1);
  const D = new Array(n);
  const I = new Array(n);
  let cV = values[0];
  let cP = cV[0];
  let cC = cV[2] * 255;
  for (let i = 0; i < n; i++) {
    const nV = values[i + 1];
    const nP = nV[0];
    const nC = nV[1] * 255;
    P[i] = cP;
    D[i] = nP - cP;
    I[i] = interpolateNumber(cC, nC);
    cV = nV;
    cP = nP;
    cC = nC;
  }
  P[n] = cP * 1.01;

  return function (t: number) {
    const f = P.findIndex((p) => t < p) - 1;
    return I[f]((t - P[f]) / D[f]);
  };
}

function piecewiseRGBChannels(values: ChannelValues) {
  const rI = piecewiseChannel(values.red);
  const gI = piecewiseChannel(values.green);
  const bI = piecewiseChannel(values.blue);

  const c = rgb(0, 0, 0);
  return function (t: number) {
    c.r = rI(t);
    c.g = gI(t);
    c.b = bI(t);
    return c.toString();
  };
}

const earthInterpolator = piecewiseRGBChannels(gistEarthValues);

export {
  piecewiseColour,
  piecewiseRGBChannels,
  earthInterpolator,
  terrainInterpolator,
  type ChannelValues,
  type ColourPoint,
};
