import { Vector3 } from 'three';
import BaseSelection from './BaseSelection';
import type { SelectionBase } from './utils';

/** Class to select a polygon */
export default class PolygonalSelection extends BaseSelection {
  readonly defaultOpenColour = '#88ccee'; // cyan
  readonly defaultClosedColour = '#ffa07a'; // lightsalmon
  readonly defaultColour = this.defaultOpenColour;
  /** array of point coordinates */
  points: [number, number][];
  /** if true, polygon is closed by joining last and first point */
  closed: boolean;
  constructor(points: [number, number][], closed?: boolean) {
    super(points[0]);
    this.points = points;
    this.closed = !!closed;
    this.colour = this.closed
      ? this.defaultClosedColour
      : this.defaultOpenColour;
  }

  override getPoints(): Vector3[] {
    const pts = this.points.map((p) => new Vector3(...p));
    const midPt = new Vector3();
    pts.forEach((p) => {
      midPt.add(p);
    });
    midPt.divideScalar(pts.length);
    const allPts = [...pts, midPt];
    return allPts;
  }

  getPoint(i: number): Vector3 | null {
    const n = this.points.length;
    if (i < n) {
      const p = this.points[i];
      return new Vector3(p[0], p[1]);
    } else if (i == n) {
      const midPt = new Vector3();
      this.points.forEach((p) => {
        midPt.add(new Vector3(p[0], p[1]));
      });
      midPt.divideScalar(n);
      return midPt;
    }
    return null;
  }

  static clicks() {
    return [2, -1];
  }

  static override isShape(
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

  static override createFromSelection(s: PolygonalSelection) {
    const p = new PolygonalSelection(
      s.points.map((p) => [...p]),
      s.closed
    );
    p.setProperties(s);
    return p;
  }

  override onHandleChange(
    i: number,
    pos: [number | undefined, number | undefined]
  ) {
    const poly = PolygonalSelection.createFromSelection(this);
    const n = this.points.length;
    if (i < n) {
      const p = this.points[i];
      poly.points[i] = [pos[0] ?? p[0], pos[1] ?? p[1]];
    } else if (i == n) {
      const b = this.getPoint(i);
      if (b) {
        const d = [(pos[0] ?? b.x) - b.x, (pos[1] ?? b.y) - b.y];
        poly.points.forEach((p, i) => {
          poly.points[i] = [p[0] + d[0], p[1] + d[1]];
        });
      }
    }
    return poly;
  }
}
