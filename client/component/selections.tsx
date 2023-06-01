/**
 * 2D selections
 *
 * @remark All points are [x,y], all angles in radians
 */

import { DataToHtml, Size, SvgElement, useVisCanvasContext } from '@h5web/lib';
import { useThree } from '@react-three/fiber';
import { useCallback } from 'react';
import { Matrix3, Vector3 } from 'three';
import DvdPolyline from './shapes/DvdPolyline';

export enum SelectionType {
  line = 'line',
  rectangle = 'rectangle',
  polyline = 'polyline',
  polygon = 'polygon',
  circle = 'circle',
  ellipse = 'ellipse',
  sector = 'sector',
  unknown = 'unknown',
}

function polar(xy: Vector3): [number, number] {
  const x = xy.x;
  const y = xy.y;
  return [Math.hypot(y, x), Math.atan2(y, x)];
}

/** export class for all selections */
export class BaseSelection implements SelectionBase {
  id: string;
  name = '';
  colour?: string;
  alpha = 1;
  fixed = false;
  start: [number, number];
  asDashed?: boolean;
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

  static createFromSelection(s: BaseSelection) {
    const l = new BaseSelection([...s.start]);
    l.setProperties(s.id, s.name, s.colour, s.alpha);
    l.setFixed(s.fixed);
    return l;
  }

  onHandleChange(i: number, pos: [number | undefined, number | undefined]) {
    console.debug('line: oHC', i, pos);
    if (i === 0) {
      const b = BaseSelection.createFromSelection(this);
      const x = pos[0];
      if (x !== undefined) {
        b.start[0] = x;
        b.vStart.x = x;
      }
      const y = pos[1];
      if (y !== undefined) {
        b.start[1] = y;
        b.vStart.y = y;
      }
      return b;
    }
    return this;
  }

  static isShape(s: BaseSelection | SelectionBase): s is BaseSelection {
    return 'vStart' in s;
  }
}

/** export class for all orientable selections */
export class OrientableSelection extends BaseSelection {
  angle: number;
  transform: Matrix3;
  invTransform: Matrix3;
  constructor(start: [number, number], angle = 0) {
    super(start);
    this.angle = angle;
    this.transform = new Matrix3().identity().rotate(-this.angle);
    this.invTransform = new Matrix3().identity().rotate(this.angle);
  }

  setAngle(angle: number) {
    this.angle = angle;
    this.transform = new Matrix3().identity().rotate(-this.angle);
    this.invTransform = new Matrix3().identity().rotate(this.angle);
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
  constructor(start: [number, number] = [0, 0], length = 1, angle = 0) {
    super(start, angle);
    this.length = length;
  }

  _getPoint(fraction = 1): Vector3 {
    return new Vector3(this.length * fraction, 0, 1)
      .applyMatrix3(this.transform)
      .add(this.vStart);
  }

  getPoints(): Vector3[] {
    return [this.vStart.clone(), this._getPoint(), this._getPoint(0.5)];
  }

  toString() {
    const e = this._getPoint();
    return `Line: ${this.start.toString()}; ${this.length}; ${this.angle}; to ${
      e.x
    },${e.y}`;
  }

  static clicks() {
    return [2, 2];
  }

  static isShape(s: LinearSelection | SelectionBase): s is LinearSelection {
    return 'length' in s;
  }

  _setFromPoints(points: Vector3[]) {
    const b = points[0];
    this.start = [b.x, b.y];
    this.vStart.x = b.x;
    this.vStart.y = b.y;
    const l = new Vector3().subVectors(points[1], b);
    const pl = polar(l);
    this.length = pl[0];
    this.setAngle(pl[1]);
  }

  static createFromPoints(points: Vector3[]) {
    const l = new LinearSelection();
    l._setFromPoints(points);
    return l;
  }

  static createFromSelection(s: LinearSelection) {
    const l = new LinearSelection([...s.start], s.length, s.angle);
    l.setProperties(s.id, s.name, s.colour, s.alpha);
    l.setFixed(s.fixed);
    return l;
  }

  onHandleChange(i: number, pos: [number | undefined, number | undefined]) {
    const l = LinearSelection.createFromSelection(this);
    const b = l.vStart;
    let e;
    switch (i) {
      case 0:
        b.x = pos[0] ?? b.x;
        b.y = pos[1] ?? b.y;
        e = l._getPoint();
        l._setFromPoints([b, e]);
        break;
      case 1:
        e = l._getPoint();
        e.x = pos[0] ?? e.x;
        e.y = pos[1] ?? e.y;
        l._setFromPoints([b, e]);
        break;
      case 2:
        e = l._getPoint(0.5);
        b.x += (pos[0] ?? 0) - e.x;
        b.y += (pos[1] ?? 0) - e.y;
        l.start[0] = b.x;
        l.start[1] = b.y;
        break;
    }
    return l;
  }
}

/** export class to select a rectangle */
export class RectangularSelection extends OrientableSelection {
  lengths: [number, number];
  constructor(start: [number, number], lengths: [number, number], angle = 0) {
    super(start, angle);
    this.lengths = [...lengths];
  }

  getPoints(): Vector3[] {
    const a = new Array<Vector3 | null>(5).fill(null, 0, 5);
    return a
      .map((_v, i) => this.getPoint(i))
      .filter((v) => v !== null) as Vector3[];
  }

  getPoint(i: number): Vector3 | null {
    let v = null;
    switch (i) {
      case 0:
        v = new Vector3(0, 0, 1);
        break;
      case 1:
        v = new Vector3(this.lengths[0], 0, 1);
        break;
      case 2:
        v = new Vector3(...this.lengths, 1);
        break;
      case 3:
        v = new Vector3(0, this.lengths[1], 1);
        break;
      case 4:
        v = new Vector3(this.lengths[0] * 0.5, this.lengths[1] * 0.5, 1);
        break;
      default:
        return null;
    }

    return v.applyMatrix3(this.transform).add(this.vStart);
  }

  toString() {
    const e = this.getPoint(2);
    return `Rect: ${this.start.toString()}; ${this.lengths.toString()};
     ${this.angle * (180 / Math.PI)}; to ${e?.x ?? '='},${e?.y ?? '='}`;
  }

  static clicks() {
    return [2, 2];
  }

  static isShape(
    s: RectangularSelection | SelectionBase
  ): s is RectangularSelection {
    return 'lengths' in s;
  }

  static createFromPoints(axesFlipped: [boolean, boolean], points: Vector3[]) {
    const b = points[0].clone();
    const l = new Vector3().subVectors(points[1], b);
    let a = 0;
    const dx = l.x;
    const dy = l.y;
    if (dx < 0 !== axesFlipped[0]) {
      l.x = -dx;
      if (dy < 0 !== axesFlipped[1]) {
        a = Math.PI;
        l.y = -dy;
      } else {
        a = Math.PI / 2;
        l.y = l.x;
        l.x = dy;
      }
    } else {
      if (dy < 0 !== axesFlipped[1]) {
        a = -Math.PI / 2;
        l.y = l.x;
        l.x = -dy;
      }
    }
    const r = new RectangularSelection([b.x, b.y], [l.x, l.y], a);
    return r;
  }

  static createFromSelection(s: RectangularSelection) {
    const r = new RectangularSelection([...s.start], [...s.lengths], s.angle);
    r.setProperties(s.id, s.name, s.colour, s.alpha);
    r.setFixed(s.fixed);
    return r;
  }

  onHandleChange(i: number, pos: [number | undefined, number | undefined]) {
    const r = RectangularSelection.createFromSelection(this);
    const o = this.getPoint(i);
    if (o !== null) {
      const x = pos[0] ?? 0;
      const y = pos[1] ?? 0;
      if (i === 4) {
        const d = new Vector3(x, y).sub(o);
        const s = r.vStart;
        s.x += d.x;
        s.y += d.y;
        r.start[0] = s.x;
        r.start[1] = s.y;
        return r;
      }

      const d = new Vector3(x, y).sub(o).applyMatrix3(this.invTransform);
      const [rx, ry] = r.lengths;
      // limit start point to interior of current rectangle and new lengths are non-negative
      let lx, ly;
      if (i !== 2) {
        lx = Math.max(0, rx - d.x);
        ly = Math.max(0, ry - d.y);
      } else {
        lx = Math.max(0, rx + d.x);
        ly = Math.max(0, ry + d.y);
      }
      let p = undefined;
      switch (i) {
        case 0:
          p = new Vector3(rx - lx, ry - ly);
          break;
        case 1:
          p = new Vector3(0, ry - ly);
          lx = Math.max(0, rx + d.x);
          break;
        case 2:
          break;
        case 3:
          p = new Vector3(rx - lx);
          ly = Math.max(0, ry + d.y);
          break;
      }
      if (p !== undefined) {
        p.applyMatrix3(this.transform).add(this.vStart);
        r.start[0] = p.x;
        r.start[1] = p.y;
        r.vStart.x = p.x;
        r.vStart.y = p.y;
      }
      r.lengths[0] = lx;
      r.lengths[1] = ly;
    }
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
    const p = new PolygonalSelection(
      s.points.map((p) => [...p]),
      s.closed
    );
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
    const e = new EllipticalSelection([...s.start], [...s.semi_axes]);
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
    const c = new CircularSelection([...s.start], s.radius);
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
    const cs = new CircularSectorialSelection(
      [...s.start],
      [...s.radii],
      [...s.angles]
    );
    cs.setProperties(s.id, s.name, s.colour, s.alpha);
    cs.setFixed(s.fixed);
    return cs;
  }
}

export function enableSelection(s: SelectionBase) {
  s.fixed = true;
  s.asDashed = true;
}

export function disableSelection(s: SelectionBase) {
  s.fixed = false;
  s.asDashed = false;
}

export function getSelectionType(selection: SelectionBase) {
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
  selectionType: SelectionType,
  axesFlipped: [boolean, boolean],
  points: Vector3[]
) {
  switch (selectionType) {
    case SelectionType.rectangle:
      return RectangularSelection.createFromPoints(axesFlipped, points);
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
  const s = createSelection(selectionType, [false, false], points);
  s.colour = colour;
  s.alpha = alpha;
  return s;
}

export type HandleChangeFunction = (
  i: number,
  pos: [number | undefined, number | undefined],
  b?: boolean
) => BaseSelection;

function createShape(
  selectionType: SelectionType,
  points: Vector3[],
  colour: string,
  alpha: number,
  size: Size,
  asDashed?: boolean,
  isFixed?: boolean,
  onHandleChange?: HandleChangeFunction
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
          <DvdPolyline
            size={size}
            coords={points}
            isClosed={true}
            strokeDasharray={asDashed ? '10, 10' : undefined}
            isFixed={isFixed}
            onHandleChange={onHandleChange}
            {...props}
          />
        </SvgElement>
      );
    case SelectionType.line:
    case SelectionType.polyline:
      return (
        <SvgElement>
          <DvdPolyline
            size={size}
            coords={points}
            strokeDasharray={asDashed ? '10, 10' : undefined}
            isFixed={isFixed}
            onHandleChange={onHandleChange}
            {...props}
          />
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
  axesFlipped: [boolean, boolean],
  colour: string,
  alpha: number,
  size: Size,
  asDashed?: boolean,
  isFixed?: boolean
) {
  const s = createSelection(selectionType, axesFlipped, points);
  return createShape(
    selectionType,
    s.getPoints(),
    colour,
    alpha,
    size,
    asDashed,
    isFixed
  );
}

interface SelectionShapeProps {
  key: string;
  size: Size;
  selection: SelectionBase;
  updateSelection: (s: SelectionBase, b?: boolean) => void;
}

function SelectionShape(props: SelectionShapeProps) {
  const { size, selection, updateSelection } = props;
  const selectionType = getSelectionType(selection);
  const context = useVisCanvasContext();
  const { htmlToData } = context;
  const camera = useThree((state) => state.camera);

  const htmlToDataFunction = useCallback(
    (x: number | undefined, y: number | undefined) => {
      const v = htmlToData(camera, new Vector3(x, y));
      return [v.x, v.y] as [number, number];
    },
    [htmlToData, camera]
  );
  const combinedUpdate = useCallback(
    (s: SelectionBase) => {
      const h = s.onHandleChange.bind(s);
      const f = (
        i: number,
        pos: [number | undefined, number | undefined],
        b = true
      ) => {
        const p = htmlToDataFunction(pos[0], pos[1]);
        console.debug('UH:', i, pos, p);
        const ns = h(i, p);
        updateSelection(ns, b);
        return ns;
      };
      return f as HandleChangeFunction;
    },
    [updateSelection, htmlToDataFunction]
  );
  if (
    selectionType !== SelectionType.unknown &&
    selection.getPoints !== undefined
  ) {
    const pts = selection.getPoints();
    return (
      <DataToHtml points={pts} key={selection.id}>
        {(...htmlSelection: Vector3[]) =>
          createShape(
            selectionType,
            htmlSelection,
            selection.colour ?? '#000000',
            selection.alpha,
            size,
            selection.asDashed,
            selection.fixed,
            combinedUpdate(selection)
          )
        }
      </DataToHtml>
    );
  }
  console.error('Unknown selection type or has no points getter', selection);
  return null;
}

export function makeShapes(
  size: Size,
  selections: SelectionBase[],
  update: (s: SelectionBase) => void
) {
  return selections.map((s) => (
    <SelectionShape
      key={s.id}
      size={size}
      selection={s}
      updateSelection={update}
    />
  ));
}

export function getSelectionLabel(
  selections: SelectionBase[],
  id: string | null,
  selectionIcons: {
    line: string;
    rectangle: string;
    polyline: string;
    polygon: string;
    circle: string;
    ellipse: string;
    sector: string;
    unknown: string;
  }
): string {
  const selection = selections.find((s) => s.id === id);
  if (id !== null && selection !== undefined) {
    const selectionIcon = selectionIcons[getSelectionType(selection)];
    const selectionLabel = `${selectionIcon} ${selection.name} ${id}`;
    return selectionLabel;
  } else {
    return 'No selection chosen';
  }
}
