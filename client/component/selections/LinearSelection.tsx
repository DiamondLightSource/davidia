import { Vector3 } from 'three';

import OrientableSelection from './OrientableSelection';
import { polar } from './utils';

/** export class to select a line */
export default class LinearSelection extends OrientableSelection {
  readonly defaultColour = '#44aa99'; // teal
  length: number;
  constructor(start: [number, number] = [0, 0], length = 1, angle = 0) {
    super(start, angle);
    this.length = length;
    this.colour = this.defaultColour;
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
    l.setProperties(s);
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
