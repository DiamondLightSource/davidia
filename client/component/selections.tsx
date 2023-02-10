/**
 * 2D selections
 *
 * @remark All points are [x,y], all angles in radians
 */

import { DataToHtml, SvgElement, SvgRect } from '@h5web/lib';

import { Matrix3, Vector3 } from 'three';

/** export class for all selections */
class BaseSelection implements SelectionBase {
  name = '';
  color?: string;
  alpha = 1;
  fixed = true;
  start: [number, number];
  constructor(start: [number, number]) {
    this.start = start;
  }
}

/** export class for all orientable selections */
export class OrientableSelection extends BaseSelection {
  angle: number;
  constructor(start: [number, number], angle = 0) {
    super(start);
    this.angle = angle;
  }
}

/** export class to select a line */
export class LinearSelection extends OrientableSelection {
  length: number;
  constructor(start: [number, number], length: number, angle = 0) {
    super(start, angle);
    this.length = length;
  }
}

/** export class to select a rectangle */
export class RectangularSelection extends OrientableSelection {
  lengths: [number, number];
  constructor(start: [number, number], lengths: [number, number], angle = 0) {
    super(start, angle);
    this.lengths = lengths;
  }
}

/** export class to select a polygon */
export class PolygonalSelection extends BaseSelection {
  points: [number, number][];
  constructor(points: [number, number][]) {
    super(points[0]);
    this.points = points;
  }
}

/** export class to select an ellipse */
export class EllipticalSelection extends OrientableSelection {
  semi_axes: [number, number];
  constructor(start: [number, number], semi_axes: [number, number], angle = 0) {
    super(start, angle);
    this.semi_axes = semi_axes;
  }
}

/** export class to select a circle */
export class CircularSelection extends BaseSelection {
  radius: number;
  constructor(start: [number, number], radius: number) {
    super(start);
    this.radius = radius;
  }
}

/** export class to select a circular sector */
export class CircularSectorialSelection extends BaseSelection {
  radii: [number, number];
  angles: [number, number];
  constructor(
    start: [number, number],
    radii: [number, number],
    angles: [number, number]
  ) {
    super(start);
    this.radii = radii;
    this.angles = angles;
  }
}

export function rectToSelection(rect: Rect): RectangularSelection {
  const b = rect[0];
  const l = new Vector3().subVectors(rect[1], b);
  let a = 0;
  if (l.x < 0) {
    l.x = -l.x;
    if (l.y < 0) {
      a = Math.PI;
      l.y = -l.y;
    } else {
      a = Math.PI / 2;
      const t = l.y;
      l.y = l.x;
      l.x = t;
    }
  } else {
    if (l.y < 0) {
      a = -Math.PI / 2;
      const t = -l.y;
      l.y = l.x;
      l.x = t;
    }
  }
  return new RectangularSelection([b.x, b.y], [l.x, l.y], a);
}

function selectionToRect(selection: RectangularSelection): Rect {
  const b = new Vector3(selection.start[0], selection.start[1], 0);
  const l = new Vector3(selection.lengths[0], selection.lengths[1], 0);
  const ma = new Matrix3().rotate(-selection.angle);
  return [b, l.applyMatrix3(ma).add(b)];
}

function createRectSelection(selection: SelectionBase, i: number) {
  if ('lengths' in selection) {
    const pts = selectionToRect(selection as RectangularSelection);
    console.log('line rect', i, pts);
    return (
      <DataToHtml points={pts} key={i}>
        {(...htmlSelection) => (
          <SvgElement>
            <SvgRect coords={htmlSelection} fill="blue" fillOpacity="0.5" />
          </SvgElement>
        )}
      </DataToHtml>
    );
  }
  return null;
}

export function makeRects(selections: SelectionBase[]) {
  return selections
    .map((s, i) => createRectSelection(s, i))
    .filter((s) => s !== null);
}
