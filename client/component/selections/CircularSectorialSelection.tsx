import { Vector3 } from 'three';
import { polar } from './utils';
import BaseSelection from './BaseSelection';

/** export class to select a circular sector */
export default class CircularSectorialSelection extends BaseSelection {
  readonly defaultColour = '#117733'; // green
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
    this.colour = this.defaultColour;
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
    cs.setProperties(s);
    return cs;
  }
}
