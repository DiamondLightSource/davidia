/**
 * 2D selections
 *
 * @remark All points are [x,y], all angles in radians
 */

import { DataToHtml, SvgElement } from '@h5web/lib';
import { Matrix3, Vector3 } from 'three';
import DvdPolygon from './shapes/DvdPolygon';
import DvdPolyline from './shapes/DvdPolyline';

export enum SelectionType {
  line,
  rectangle,
  polyline,
  polygon,
  circle,
  ellipse,
  sector,
  unknown,
}

function polar(xy: Vector3): [number, number] {
  const x = xy.x;
  const y = xy.y;
  return [Math.hypot(y, x), Math.atan2(y, x)];
}

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
    return [this.vStart.clone()];
  }

  setProperties(id: string, name: string, colour?: string, alpha?: number) {
    this.id = id;
    this.name = name;
    this.colour = colour;
    this.alpha = alpha ?? 1;
  }

  setName(name: string) {
    this.name = name;
  }

  setFixed(fixed: boolean) {
    this.fixed = fixed;
  }

  static isShape(s: BaseSelection | SelectionBase): s is BaseSelection {
    return 'vStart' in s;
  }
}

/** export class for all orientable selections */
export class OrientableSelection extends BaseSelection {
  angle: number;
  transform: Matrix3;
  constructor(start: [number, number], angle = 0) {
    super(start);
    this.angle = angle;
    this.transform = new Matrix3().identity().rotate(-this.angle);
  }

  setAngle(angle: number) {
    this.angle = angle;
    this.transform = new Matrix3().identity().rotate(-this.angle);
  }

  static isShape(
    s: OrientableSelection | SelectionBase
  ): s is OrientableSelection {
    return 'transform' in s;
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
    const e = new Vector3(this.length, 0, 1).applyMatrix3(m).add(s);
    return [s, e];
  }

  static clicks() {
    return [2, 2];
  }

  static isShape(s: LinearSelection | SelectionBase): s is LinearSelection {
    return 'length' in s;
  }

  static createFromPoints(points: Vector3[]) {
    const b = points[0];
    const l = new Vector3().subVectors(points[1], b);
    const pl = polar(l);
    return new LinearSelection([b.x, b.y], pl[0], pl[1]);
  }

  static createFromSelection(s: LinearSelection) {
    const l = new LinearSelection(s.start, s.length, s.angle);
    l.setProperties(s.id, s.name, s.colour, s.alpha);
    l.setFixed(s.fixed);
    return l;
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

  static clicks() {
    return [2, 2];
  }

  static isShape(
    s: RectangularSelection | SelectionBase
  ): s is RectangularSelection {
    return 'lengths' in s;
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
          a = Math.PI / 2;
          l.y = l.x;
          l.x = dy;
        }
      } else {
        if (dy < 0) {
          a = -Math.PI / 2;
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

  static createFromSelection(s: RectangularSelection) {
    const r = new RectangularSelection(s.start, s.lengths, s.angle);
    r.setProperties(s.id, s.name, s.colour, s.alpha);
    r.setFixed(s.fixed);
    return r;
  }
}

/** export class to select a polygon */
export class PolygonalSelection extends BaseSelection {
  points: [number, number][];
  closed: boolean;
  constructor(points: [number, number][], closed?: boolean) {
    super(points[0]);
    this.points = points;
    this.closed = closed ?? true;
  }

  getPoints(): Vector3[] {
    return this.points.map((p) => new Vector3(...p));
  }

  static clicks() {
    return [2, -1];
  }

  static isShape(
    s: PolygonalSelection | SelectionBase
  ): s is PolygonalSelection {
    return 'points' in s;
  }

  static createFromPoints(closed: boolean, points: Vector3[]) {
    const p = new PolygonalSelection(
      points.map((p) => [p.x, p.y]),
      closed
    );
    return p;
  }

  static createFromSelection(s: PolygonalSelection) {
    const p = new PolygonalSelection(s.points, s.closed);
    p.setProperties(s.id, s.name, s.colour, s.alpha);
    p.setFixed(s.fixed);
    return p;
  }
}

/** export class to select an ellipse */
export class EllipticalSelection extends OrientableSelection {
  semi_axes: [number, number];
  constructor(start: [number, number], semi_axes: [number, number], angle = 0) {
    super(start, angle);
    this.semi_axes = semi_axes;
  }

  static clicks() {
    return [2, 3];
  }

  static isShape(
    s: EllipticalSelection | SelectionBase
  ): s is EllipticalSelection {
    return 'semi_axes' in s;
  }

  static createFromPoints(points: Vector3[]) {
    const c = points[0];
    const i = new Vector3().subVectors(points[1], c);
    if (points.length < 3) {
      return new EllipticalSelection(
        [c.x, c.y],
        [Math.abs(i.x), Math.abs(i.y)]
      );
    }
    const pi = polar(i);
    const si = pi[0];
    const o = new Vector3().subVectors(points[2], c);
    const so = Math.hypot(o.x, o.y);
    const ss = si < so ? [si, so] : [so, si];

    return new EllipticalSelection([c.x, c.y], ss as [number, number], pi[1]);
  }

  static createFromSelection(s: EllipticalSelection) {
    const e = new EllipticalSelection(s.start, s.semi_axes);
    e.setProperties(s.id, s.name, s.colour, s.alpha);
    e.setFixed(s.fixed);
    return e;
  }
}

/** export class to select a circle */
export class CircularSelection extends BaseSelection {
  radius: number;
  constructor(start: [number, number], radius: number) {
    super(start);
    this.radius = radius;
  }

  static clicks() {
    return [2, 2];
  }

  static isShape(s: CircularSelection | SelectionBase): s is CircularSelection {
    return 'radius' in s;
  }

  static createFromPoints(points: Vector3[]) {
    const [c, e] = points;
    return new CircularSelection([c.x, c.y], Math.hypot(e.x, e.y));
  }

  static createFromSelection(s: CircularSelection) {
    const c = new CircularSelection(s.start, s.radius);
    c.setProperties(s.id, s.name, s.colour, s.alpha);
    c.setFixed(s.fixed);
    return c;
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

  static clicks() {
    return [2, 3];
  }

  static isShape(
    s: CircularSectorialSelection | SelectionBase
  ): s is CircularSectorialSelection {
    return 'radii' in s;
  }

  static createFromPoints(points: Vector3[]) {
    const c = points[0];
    const i = new Vector3().subVectors(points[1], c);
    const pi = polar(i);
    const ri = pi[0];
    const ai = pi[1];
    let ro = ri;
    let ao = ai;
    if (points.length > 2) {
      const o = new Vector3().subVectors(points[2], c);
      const po = polar(o);
      ro = po[0];
      ao = po[1];
    }
    const rs = ri < ro ? [ri, ro] : [ro, ri];
    const as = ai < ao ? [ai, ao] : [ao, ai];

    return new CircularSectorialSelection(
      [c.x, c.y],
      rs as [number, number],
      as as [number, number]
    );
  }

  static createFromSelection(s: CircularSectorialSelection) {
    const cs = new CircularSectorialSelection(s.start, s.radii, s.angles);
    cs.setProperties(s.id, s.name, s.colour, s.alpha);
    cs.setFixed(s.fixed);
    return cs;
  }
}

function getSelectionType(selection: SelectionBase) {
  if (RectangularSelection.isShape(selection)) {
    return SelectionType.rectangle;
  } else if (LinearSelection.isShape(selection)) {
    return SelectionType.line;
  } else if (PolygonalSelection.isShape(selection)) {
    return selection.closed ? SelectionType.polygon : SelectionType.polyline;
  } else if (EllipticalSelection.isShape(selection)) {
    return SelectionType.ellipse;
  } else if (CircularSelection.isShape(selection)) {
    return SelectionType.circle;
  } else if (CircularSectorialSelection.isShape(selection)) {
    return SelectionType.sector;
  } else {
    return SelectionType.unknown;
  }
}

export function recreateSelection(selection: SelectionBase) {
  if (RectangularSelection.isShape(selection)) {
    return RectangularSelection.createFromSelection(selection);
  } else if (LinearSelection.isShape(selection)) {
    return LinearSelection.createFromSelection(selection);
  } else if (PolygonalSelection.isShape(selection)) {
    return PolygonalSelection.createFromSelection(selection);
  } else if (EllipticalSelection.isShape(selection)) {
    return EllipticalSelection.createFromSelection(selection);
  } else if (CircularSelection.isShape(selection)) {
    return CircularSelection.createFromSelection(selection);
  } else if (CircularSectorialSelection.isShape(selection)) {
    return CircularSectorialSelection.createFromSelection(selection);
  } else {
    return null;
  }
}

function createSelection(
  clicks: boolean,
  selectionType: SelectionType,
  points: Vector3[]
) {
  switch (selectionType) {
    case SelectionType.rectangle:
      return RectangularSelection.createFromPoints(!clicks, points);
    case SelectionType.sector:
      return CircularSectorialSelection.createFromPoints(points);
    case SelectionType.circle:
      return CircularSelection.createFromPoints(points);
    case SelectionType.ellipse:
      return CircularSelection.createFromPoints(points);
    case SelectionType.polygon:
      return PolygonalSelection.createFromPoints(true, points);
    case SelectionType.polyline:
      return PolygonalSelection.createFromPoints(false, points);
    case SelectionType.line:
    case SelectionType.unknown:
    default:
      return LinearSelection.createFromPoints(points);
  }
}

export function pointsToSelection(
  selectionType: SelectionType,
  points: Vector3[],
  colour: string,
  alpha: number
): BaseSelection {
  console.debug('Points', selectionType, points);
  const s = createSelection(false, selectionType, points);
  s.colour = colour;
  s.alpha = alpha;
  return s;
}

function createShape(
  selectionType: SelectionType,
  points: Vector3[],
  colour: string,
  alpha: number
) {
  const props = {
    fill: colour,
    fillOpacity: alpha,
    stroke: colour,
    strokeWidth: 1,
  };
  switch (selectionType) {
    case SelectionType.rectangle:
    case SelectionType.polygon:
      return (
        <SvgElement>
          <DvdPolygon coords={points} {...props} />
        </SvgElement>
      );
    case SelectionType.line:
    case SelectionType.polyline:
      return (
        <SvgElement>
          <DvdPolyline coords={points} {...props} />
        </SvgElement>
      );
    case SelectionType.ellipse:
    case SelectionType.circle:
    case SelectionType.sector:
    case SelectionType.unknown:
    default:
      return null;
  }
}

export function pointsToShape(
  selectionType: SelectionType,
  points: Vector3[],
  colour: string,
  alpha: number
) {
  const s = createSelection(true, selectionType, points);
  return createShape(selectionType, s.getPoints(), colour, alpha);
}

function createSelectionShape(selection: SelectionBase) {
  const selectionType = getSelectionType(selection);
  if (
    selectionType !== SelectionType.unknown &&
    selection.getPoints !== undefined
  ) {
    const pts = selection.getPoints();
    console.debug('Shape points', selectionType, pts);
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
  console.error('Unknown selection type or has no points getter', selection);
  return null;
}

export function makeShapes(selections: SelectionBase[]) {
  return selections
    .map((s) => createSelectionShape(s))
    .filter((s) => s !== null);
}
