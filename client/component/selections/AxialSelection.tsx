import { Vector3 } from 'three';
import BaseSelection from './BaseSelection';

/** export class to make an axis selection */
export default class AxialSelection extends BaseSelection {
  readonly defaultColour = '#882255'; // wine
  length: number;
  dimension: number;
  constructor(start: [number, number], length: number, dimension: number) {
    super(start);
    this.length = length;
    this.dimension = dimension;
    this.colour = this.defaultColour;
  }

  _getPoint(fraction = 1): Vector3 {
    const v = new Vector3(0, 0, 1);
    v.setComponent(this.dimension, this.length * fraction);
    return v.add(this.vStart);
  }

  getPoints(): Vector3[] {
    return [this.vStart.clone(), this._getPoint()];
  }

  toString(): string {
    const e = this._getPoint();
    const d = this.dimension;

    return `Axis: ${this.start[d]}; ${this.length}; to ${e.getComponent(d)}`;
  }

  static clicks() {
    return [2, 2];
  }

  static isShape(s: AxialSelection | SelectionBase): s is AxialSelection {
    return 'dimension' in s;
  }

  _setFromPoints(points: Vector3[]) {
    const b = points[0];
    const e = points[1];
    const d = this.dimension;
    const bv = b.getComponent(d);
    const ev = e.getComponent(d);
    this.start = [0, 0];
    if (bv < ev) {
      this.start[d] = bv;
      this.length = ev - bv;
    } else {
      this.start[d] = ev;
      this.length = bv - ev;
    }
    this.vStart.setComponent(d, this.start[d]);
  }

  static createFromPoints(points: Vector3[], dimension: number) {
    const b = points[0].getComponent(dimension);
    const e = points[1].getComponent(dimension);

    const l = e - b;
    const s: [number, number] = [0, 0];
    s[dimension] = l > 0 ? b : e;
    return new AxialSelection(s, Math.abs(l), dimension);
  }

  static createFromSelection(s: AxialSelection) {
    const r = new AxialSelection([...s.start], s.length, s.dimension);
    r.setProperties(s.id, s.name, s.colour, s.alpha);
    r.setFixed(s.fixed);
    return r;
  }

  onHandleChange(i: number, pos: [number | undefined, number | undefined]) {
    const r = AxialSelection.createFromSelection(this);
    // handles are ordered as min,a_l; min,a_h; max,a_h; max,a_l; centre

    const d = this.dimension;
    if (i === 4) {
      const b = pos[d] ?? 0;
      const o = this._getPoint(0.5);
      const db = b - o.getComponent(d);
      const nb = r.start[d] + db;
      r.start[d] = nb;
      r.vStart.setComponent(d, nb);
      return r;
    }

    const c = pos[d] ?? 0;
    if (i < 2) {
      const ce = r.start[d] + r.length - c;
      if (ce >= 0) {
        r.start[d] = c;
        r.vStart.setComponent(d, c);
        r.length = ce;
      }
    } else {
      const cs = c - r.start[d];
      if (cs >= 0) {
        r.length = cs;
      }
    }

    return r;
  }
}
