/**
 * 2D selections
 *
 * @remark All points are [x,y], all angles in radians
 */

import { Vector3 } from 'three';

/** export class for all selections */
export default class BaseSelection implements SelectionBase {
  id: string;
  name = '';
  colour?: string;
  alpha = 0.3;
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

  setProperties(other: BaseSelection) {
    this.id = other.id;
    this.name = other.name;
    this.colour = other.colour;
    this.alpha = other.alpha;
    this.asDashed = other.asDashed;
    this.fixed = other.fixed;
  }

  setName(name: string) {
    this.name = name;
  }

  setFixed(fixed: boolean) {
    this.fixed = fixed;
  }

  static createFromSelection(s: BaseSelection) {
    const l = new BaseSelection([...s.start]);
    l.setProperties(s);
    return l;
  }

  onHandleChange(i: number, pos: [number | undefined, number | undefined]) {
    console.debug('base: oHC', i, pos);
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
