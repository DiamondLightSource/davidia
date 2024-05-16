import { Matrix3 } from 'three';
import BaseSelection from './BaseSelection';
import type { SelectionBase } from './utils';

/** Superclass for all orientable selections */
export default class OrientableSelection extends BaseSelection {
  /** angle of selection (radians) */
  angle: number;
  protected transform: Matrix3;
  protected invTransform: Matrix3;
  constructor(start: [number, number], angle = 0) {
    super(start);
    this.angle = angle;
    this.transform = new Matrix3().identity().rotate(-this.angle);
    this.invTransform = new Matrix3().identity().rotate(this.angle);
  }

  setAngle(angle: number) {
    this.angle = angle;
    this.transform = new Matrix3().identity().rotate(-this.angle);
    this.invTransform = new Matrix3().identity().rotate(this.angle);
  }

  static override isShape(
    s: OrientableSelection | SelectionBase
  ): s is OrientableSelection {
    return 'transform' in s;
  }
}
