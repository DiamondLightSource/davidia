import { Vector3 } from 'three';
import { polar } from './utils';
import OrientableSelection from './OrientableSelection';
import type { SelectionBase } from './utils';

/** Class to select an ellipse */
export default class EllipticalSelection extends OrientableSelection {
  readonly _defaultColour = '#999933'; // olive
  /** lengths of major and minor semi-axes */
  semiAxes: [number, number];
  constructor(start: [number, number], semiAxes: [number, number], angle = 0) {
    super(start, angle);
    this.semiAxes = semiAxes;
    this.colour = this._defaultColour;
  }

  static clicks() {
    return [2, 3];
  }

  static override isShape(
    s: EllipticalSelection | SelectionBase
  ): s is EllipticalSelection {
    return 'semiAxes' in s;
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

  static override createFromSelection(s: EllipticalSelection) {
    const e = new EllipticalSelection([...s.start], [...s.semiAxes]);
    e.setProperties(s);
    return e;
  }
}
