import { type SVGProps, useMemo } from 'react';
import { Matrix3, Vector3 } from 'three';
import type { HandleChangeFunction } from '../selections/utils';
import type { Size } from '@h5web/lib';
import { DvdDragHandle, HANDLE_SIZE } from './DvdDragHandle';

interface DvdPolylineProps extends SVGProps<SVGPolylineElement> {
  size: Size; // canvas width, height
  coords: Vector3[]; // last coordinate vector is centre handle
  isClosed?: boolean;
  isFixed?: boolean;
  onHandleChange?: HandleChangeFunction;
}

const ARROW_SIZE = 10;
const ARROW_OFFSET = HANDLE_SIZE * 2 + 4;
const ROTATE_90_SCALE = new Matrix3()
  .identity()
  .rotate(Math.PI / 2)
  .multiplyScalar(Math.sin(Math.PI / 3));

function createArrow(a: Vector3, b: Vector3) {
  const d = new Vector3().subVectors(b, a);
  const l = Math.hypot(d.x, d.y);
  const hd = d.clone().multiplyScalar(0.5 + ARROW_OFFSET / l); // halfway along edge plus offset
  d.multiplyScalar(ARROW_SIZE / l); // arrow edge

  let a1, a2;
  if (l > 4 * ARROW_SIZE) {
    const c = new Vector3().addVectors(a, hd);
    a1 = new Vector3().subVectors(c, d);
    a2 = c.add(d);
  } else {
    a1 = b;
    a2 = new Vector3().addVectors(b, d);
  }

  const a3 = d.applyMatrix3(ROTATE_90_SCALE).add(a1);
  return [a1, a2, a3].map((c) => `${c.x},${c.y}`).join(' ');
}

function DvdPolyline(props: DvdPolylineProps) {
  const {
    size,
    coords,
    isClosed = false,
    isFixed,
    onHandleChange,
    ...svgProps
  } = props;

  const points = coords.slice(0, -1); // remove centre handle

  const dragHandles = useMemo(() => {
    const handles = coords.map((c, i) => {
      const name = `${isClosed ? 'polygon' : 'polyline'}-drag-${i}`;

      return (
        <DvdDragHandle
          key={name}
          name={name}
          size={size}
          i={i}
          nx={c.x}
          ny={c.y}
          onHandleChange={onHandleChange}
          {...svgProps}
        />
      );
    });
    return handles;
  }, [coords, isClosed, size, onHandleChange, svgProps]);

  const pts = useMemo(
    () => points.map((c) => `${c.x},${c.y}`).join(' '),
    [points]
  );

  const arrow = useMemo(() => createArrow(coords[0], coords[1]), [coords]);

  return (
    <>
      {isClosed ? (
        <polygon points={pts} {...svgProps} />
      ) : (
        <polyline points={pts} {...svgProps} fill="none" />
      )}
      <polygon points={arrow} {...svgProps} fill={svgProps.stroke} />
      {!isFixed && dragHandles}
    </>
  );
}

export default DvdPolyline;
export type { DvdPolylineProps };
