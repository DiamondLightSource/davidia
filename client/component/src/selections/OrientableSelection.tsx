import { Matrix3 } from 'three';
import BaseSelection from './BaseSelection';
import type { SelectionBase } from './utils';

/** Superclass for all orientable selections */
export default class OrientableSelection extends BaseSelection {
  /** angle of selection (radians) */
  angle: number;
  protected _transform: Matrix3;
  protected _invTransform: Matrix3;
  constructor(start: [number, number], angle = 0) {
    super(start);
    this.angle = angle;
    this._transform = new Matrix3().identity().rotate(-this.angle);
    this._invTransform = new Matrix3().identity().rotate(this.angle);
  }

  setAngle(angle: number) {
    this.angle = angle;
    this._transform = new Matrix3().identity().rotate(-this.angle);
    this._invTransform = new Matrix3().identity().rotate(this.angle);
  }

  static override isShape(
    s: OrientableSelection | SelectionBase
  ): s is OrientableSelection {
    return '_transform' in s;
  }
}
