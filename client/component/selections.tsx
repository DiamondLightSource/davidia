/**
 * 2D selections
 *
 * @remark All points are [x,y], all angles in radians
 */

import { DataToHtml, SvgElement } from '@h5web/lib';
import { Matrix3, Vector3 } from 'three';
import DvdPolygon from './shapes/DvdPolygon';
import DvdPolyline from './shapes/DvdPolyline';

/** export class for all selections */
class BaseSelection implements SelectionBase {
  id: string;
  name = '';
  colour?: string;
  alpha = 1;
  fixed = true;
  start: [number, number];
  vStart: Vector3;
  constructor(start: [number, number]) {
    this.id = crypto.randomUUID().slice(-8); // use last 8 characters only
    this.start = start;
    this.vStart = new Vector3(...start);
  }

  getPoints() {
    return [new Vector3(...this.start)];
  }
}

/** export class for all orientable selections */
export class OrientableSelection extends BaseSelection {
  angle: number;
  transform: Matrix3;
  constructor(start: [number, number], angle = 0) {
    super(start);
    this.angle = angle;
    this.transform = new Matrix3().identity().rotate(this.angle);
  }

  setAngle(angle: number) {
    this.angle = angle;
    this.transform = new Matrix3().identity().rotate(this.angle);
  }
}

/** export class to select a line */
export class LinearSelection extends OrientableSelection {
  length: number;
  constructor(start: [number, number], length: number, angle = 0) {
    super(start, angle);
    this.length = length;
  }

  getPoints(): Vector3[] {
    const m = this.transform;
    const s = this.vStart.clone();
    return [s, new Vector3(this.length, 0, 1).applyMatrix3(m).add(s)];
  }

  static createFromPoints(points: Vector3[]) {
    const b = points[0];
    const l = new Vector3().subVectors(points[1], b);
    const a = Math.atan2(l.y, l.x);
    return new LinearSelection([b.x, b.y], Math.hypot(l.x, l.y), a);
  }
}

/** export class to select a rectangle */
export class RectangularSelection extends OrientableSelection {
  lengths: [number, number];
  constructor(start: [number, number], lengths: [number, number], angle = 0) {
    super(start, angle);
    this.lengths = lengths;
  }

  getPoints(): Vector3[] {
    const v = new Vector3(...this.lengths, 1);
    const all = [
      new Vector3(0, 0, 1),
      new Vector3(v.x, 0, 1),
      v,
      new Vector3(0, v.y, 1),
    ];
    const m = this.transform;
    const s = this.vStart;
    return all.map((a) => a.applyMatrix3(m).add(s));
  }

  static createFromPoints(data: boolean, points: Vector3[]) {
    const b = data ? points[0] : points[0].clone();
    const l = new Vector3().subVectors(points[1], b);
    let a = 0;
    if (data) {
      const dx = l.x;
      const dy = l.y;
      if (dx < 0) {
        l.x = -dx;
        if (dy < 0) {
          a = Math.PI;
          l.y = -dy;
        } else {
          a = -Math.PI / 2;
          l.y = l.x;
          l.x = dy;
        }
      } else {
        if (dy < 0) {
          a = Math.PI / 2;
          l.y = l.x;
          l.x = -dy;
        }
      }
    } else {
      const dx = l.x;
      if (dx < 0) {
        b.x += dx;
        l.x = -dx;
      }
      const dy = l.y;
      if (dy < 0) {
        b.y += dy;
        l.y = -dy;
      }
    }
    return new RectangularSelection([b.x, b.y], [l.x, l.y], a);
  }
}

/** export class to select a polygon */
export class PolygonalSelection extends BaseSelection {
  points: [number, number][];
  constructor(points: [number, number][]) {
    super(points[0]);
    this.points = points;
  }

  getPoints(): Vector3[] {
    return this.points.map((p) => new Vector3(...p));
  }

  static createFromPoints(points: Vector3[]) {
    return new PolygonalSelection(points.map((p) => [p.x, p.y]));
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

export function pointsToSelection(
  selectionType: string,
  points: Vector3[],
  colour: string,
  alpha: number
): BaseSelection {
  console.debug('Points', selectionType, points);
  let s: BaseSelection;
  switch (selectionType) {
    case 'rectangle':
      s = RectangularSelection.createFromPoints(true, points);
      break;
    case 'line':
    default:
      s = LinearSelection.createFromPoints(points);
      break;
  }
  s.colour = colour;
  s.alpha = alpha;
  return s;
}

export function createShape(
  selectionType: string,
  points: Vector3[],
  colour: string,
  alpha: number
) {
  const props = {
    fill: colour,
    fillOpacity: alpha,
    stoke: colour,
    stokeWidth: 1,
  };
  switch (selectionType) {
    case 'rectangle':
      return (
        <SvgElement>
          <DvdPolygon coords={points} {...props} />
        </SvgElement>
      );
    case 'line':
    default:
      return (
        <SvgElement>
          <DvdPolyline coords={points} {...props} />
        </SvgElement>
      );
  }
}

export function pointsToShape(
  selectionType: string,
  points: Vector3[],
  colour: string,
  alpha: number
) {
  let s: BaseSelection;
  switch (selectionType) {
    case 'rectangle':
      s = RectangularSelection.createFromPoints(false, points);
      break;
    case 'line':
    default:
      s = LinearSelection.createFromPoints(points);
  }
  return createShape(selectionType, s.getPoints(), colour, alpha);
}

function createSelectionShape(selection: SelectionBase) {
  let selectionType: string;
  if ('lengths' in selection) {
    selectionType = 'rectangle';
  } else {
    selectionType = 'line';
  }
  if (selection.getPoints !== undefined) {
    const pts = selection.getPoints();
    return (
      <DataToHtml points={pts} key={selection.id}>
        {(...htmlSelection: Vector3[]) =>
          createShape(
            selectionType,
            htmlSelection,
            selection.colour ?? 'black',
            selection.alpha
          )
        }
      </DataToHtml>
    );
  }
  return null;
}

export function makeShapes(selections: SelectionBase[]) {
  return selections
    .map((s) => createSelectionShape(s))
    .filter((s) => s !== null);
}
