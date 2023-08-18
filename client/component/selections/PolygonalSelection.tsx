import { Vector3 } from 'three';
import BaseSelection from './BaseSelection';

/** export class to select a polygon */
export default class PolygonalSelection extends BaseSelection {
  readonly defaultColour = '#88ccee'; // cyan
  points: [number, number][];
  closed: boolean;
  constructor(points: [number, number][], closed?: boolean) {
    super(points[0]);
    this.points = points;
    this.closed = closed ?? true;
    this.colour = this.defaultColour;
  }

  getPoints(): Vector3[] {
    const pts = this.points.map((p) => new Vector3(...p));
    const mid_pt = new Vector3();
    pts.forEach((p) => {
      mid_pt.add(p);
    });
    mid_pt.divideScalar(pts.length);
    const all_pts = [...pts, mid_pt];
    return all_pts;
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
