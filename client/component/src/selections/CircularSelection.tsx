import type { Vector3 } from 'three';
import BaseSelection from './BaseSelection';
import type { SelectionBase } from './utils';

/** Class to select a circle */
export default class CircularSelection extends BaseSelection {
  readonly _defaultColour = '#332288'; // indigo
  /** radius of circle */
  radius: number;
  constructor(start: [number, number], radius: number) {
    super(start);
    this.radius = radius;
    this.colour = this._defaultColour;
  }

  static clicks() {
    return [2, 2];
  }

  static override isShape(
    s: CircularSelection | SelectionBase
  ): s is CircularSelection {
    return 'radius' in s;
  }

  static createFromPoints(points: Vector3[]) {
    const [c, e] = points;
    return new CircularSelection([c.x, c.y], Math.hypot(e.x, e.y));
  }

  static override createFromSelection(s: CircularSelection) {
    const c = new CircularSelection([...s.start], s.radius);
    c.setProperties(s);
    return c;
  }
}
