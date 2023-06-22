import { Matrix3 } from 'three';
import BaseSelection from './BaseSelection';

/** export class for all orientable selections */
export default class OrientableSelection extends BaseSelection {
  angle: number;
  transform: Matrix3;
  invTransform: Matrix3;
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

  static isShape(
    s: OrientableSelection | SelectionBase
  ): s is OrientableSelection {
    return 'transform' in s;
  }
}
