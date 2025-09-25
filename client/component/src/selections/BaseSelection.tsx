/**
 * 2D selections
 *
 * @remark All points are [x,y], all angles in radians
 */

import { Vector3 } from 'three';
import type { SelectionBase } from './utils';

/** Base class for all selections */
export default class BaseSelection implements SelectionBase {
  /* NOTE: use attributes beginning with underscore to avoid serialization to pydantic models */
  id: string;
  name = '';
  _defaultColour: string = '#000000'; // black
  colour?: string;
  alpha = 0.3;
  fixed = false;
  start: [number, number];
  _asDashed?: boolean;
  /** Vector3 copy of start coordinate */
  _vStart: Vector3;
  constructor(start: [number, number]) {
    this.id = crypto.randomUUID().slice(-8); // use last 8 characters only
    this.start = start;
    this._vStart = new Vector3(...start);
  }

  toString() {
    return '';
  }

  setStart(i: number, v: number) {
    this.start[i] = v;
    if (i == 0) {
      this._vStart.x = v;
    } else if (i == 1) {
      this._vStart.y = v;
    } else if (i == 2) {
      this._vStart.z = v;
    } else {
      console.log('Index error (%i > 2) on setting start', i);
    }
  }

  getPoints() {
    return [this._vStart.clone()];
  }

  setProperties(other: BaseSelection) {
    this.id = other.id;
    this.name = other.name;
    this.colour = other.colour;
    this.alpha = other.alpha;
    this._asDashed = other._asDashed;
    this.fixed = other.fixed;
  }

  static createFromSelection(s: BaseSelection) {
    const l = new BaseSelection([...s.start]);
    l.setProperties(s);
    return l;
  }

  onHandleChange(
    i: number,
    pos: [number | undefined, number | undefined],
    d?: boolean
  ) {
    console.debug('base: oHC', i, pos, d);
    if (i === 0) {
      const b = BaseSelection.createFromSelection(this);
      const x = pos[0];
      if (x !== undefined) {
        b.start[0] = x;
        b._vStart.x = x;
      }
      const y = pos[1];
      if (y !== undefined) {
        b.start[1] = y;
        b._vStart.y = y;
      }
      return b;
    }
    return this;
  }

  static isShape(s: BaseSelection | SelectionBase): s is BaseSelection {
    return '_vStart' in s;
  }
}
