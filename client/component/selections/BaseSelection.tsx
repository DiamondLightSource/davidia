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
