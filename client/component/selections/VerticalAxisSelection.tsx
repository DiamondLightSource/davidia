import { Vector3 } from 'three';
import AxisSelection from './AxisSelection';

/** export class for a vertical axis selection */
export default class VerticalAxisSelection extends AxisSelection {
  readonly verticalAxis: boolean = true;
  readonly dimension = 1;
  constructor(start: [number, number], dimensionLength: [number, number]) {
    super(start, dimensionLength, 0);
    this.dimensionLength = [...dimensionLength];
    this.colour = this.defaultColour;
  }
  static isShape(
    s: VerticalAxisSelection | AxisSelection | SelectionBase
  ): s is VerticalAxisSelection {
    return 'verticalAxis' in s;
  }
  static createFromPoints(points: Vector3[]) {
    const orderedPoints =
      points[0].y > points[1].y
        ? [
            new Vector3(points[0].x, points[1].y),
            new Vector3(points[1].x, points[0].y),
          ]
        : points;

    const l = new Vector3().subVectors(orderedPoints[0], orderedPoints[1]);
    l.x = Math.abs(l.x);
    l.y = Math.abs(l.y);

    const r = new VerticalAxisSelection(
      [orderedPoints[0].x, orderedPoints[0].y],
      [l.x, l.y]
    );
    return r;
  }

  static createFromSelection(s: VerticalAxisSelection) {
    const r = new VerticalAxisSelection([...s.start], [...s.dimensionLength]);
    r.setProperties(s.id, s.name, s.colour, s.alpha);
    r.setFixed(s.fixed);
    return r;
  }

  onHandleChange(i: number, pos: [number | undefined, number | undefined]) {
    const r = VerticalAxisSelection.createFromSelection(this);
    const o = this.getPoint(i);
    if (o !== null) {
      const x = pos[0] ?? 0;
      const y = pos[1] ?? 0;
      if (i === 4) {
        const d = new Vector3(x, y).sub(o);
        const s = r.vStart;
        s.x += d.x;
        s.y += d.y;
        r.start[0] = s.x;
        r.start[1] = s.y;
        return r;
      }

      const d = new Vector3(x, y).sub(o);
      const [rx, ry] = r.dimensionLength;
      // limit start point to interior of current rectangle and new lengths are non-negative
      let lx, ly;
      if (i !== 2) {
        lx = Math.max(0, rx - d.x);
        ly = Math.max(0, ry - d.y);
      } else {
        lx = Math.max(0, rx + d.x);
        ly = Math.max(0, ry + d.y);
      }
      let p = undefined;
      switch (i) {
        case 0:
          p = new Vector3(rx - lx, ry - ly);
          break;
        case 1:
          p = new Vector3(0, ry - ly);
          lx = Math.max(0, rx + d.x);
          break;
        case 2:
          break;
        case 3:
          p = new Vector3(rx - lx);
          ly = Math.max(0, ry + d.y);
          break;
      }
      if (p !== undefined) {
        p.add(this.vStart);
        r.start[0] = p.x;
        r.start[1] = p.y;
        r.vStart.x = p.x;
        r.vStart.y = p.y;
      }
      r.dimensionLength[0] = lx;
      r.dimensionLength[1] = ly;
    }
    return r;
  }
}
