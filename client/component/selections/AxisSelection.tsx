import { Vector3 } from 'three';
import BaseSelection from './BaseSelection';

/** export class to make an axis selection */
export default class AxisSelection extends BaseSelection {
  readonly defaultColour = '#882255'; // wine
  dimensionLength: [number, number];
  dimension: number;
  constructor(
    start: [number, number],
    dimensionLength: [number, number],
    dimension: number
  ) {
    super(start);
    this.dimensionLength = [...dimensionLength];
    this.dimension = dimension;
    this.colour = this.defaultColour;
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
        v = new Vector3(this.dimensionLength[0], 0, 1);
        break;
      case 2:
        v = new Vector3(...this.dimensionLength, 1);
        break;
      case 3:
        v = new Vector3(0, this.dimensionLength[1], 1);
        break;
      case 4:
        v = new Vector3(
          this.dimensionLength[0] * 0.5,
          this.dimensionLength[1] * 0.5,
          1
        );
        break;
      default:
        return null;
    }

    return v.add(this.vStart);
  }

  toString() {
    const e = this.getPoint(2);
    return `Rect: ${this.start.toString()}; ${this.dimensionLength.toString()};
    to ${e?.x ?? '='},${e?.y ?? '='}`;
  }

  static clicks() {
    return [2, 2];
  }

  static isShape(s: AxisSelection | SelectionBase): s is AxisSelection {
    return 'dimensionLength' in s;
  }

  static createFromSelection(s: AxisSelection) {
    const r = new AxisSelection(
      [...s.start],
      [...s.dimensionLength],
      s.dimension
    );
    r.setProperties(s.id, s.name, s.colour, s.alpha);
    r.setFixed(s.fixed);
    return r;
  }

  onHandleChange(i: number, pos: [number | undefined, number | undefined]) {
    const r = AxisSelection.createFromSelection(this);
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

      const d = new Vector3(x, y).sub(o);
      const [rx, ry] = r.dimensionLength;
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
        p.add(this.vStart);
        r.start[0] = p.x;
        r.start[1] = p.y;
        r.vStart.x = p.x;
        r.vStart.y = p.y;
      }
      r.dimensionLength[0] = lx;
      r.dimensionLength[1] = ly;
    }
    return r;
  }
}
