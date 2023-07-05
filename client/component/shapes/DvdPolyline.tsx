import { SVGProps, useMemo } from 'react';
import { Matrix3, Vector3 } from 'three';
import type { HandleChangeFunction } from '../selections/utils';
import { Size } from '@h5web/lib';
import { DvdDragHandle, HANDLE_SIZE } from './DvdDragHandle';

export interface DvdPolylineProps extends SVGProps<SVGPolylineElement> {
  size: Size; // canvas width, height
  coords: Vector3[]; // last coordinate vector is centre handle
  isClosed?: boolean;
  isFixed?: boolean;
  onHandleChange?: HandleChangeFunction;
  useHandles?: boolean;
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
    useHandles,
    ...svgProps
  } = props;

  const points = coords.slice(0, -1); // remove centre handle

  const disableHandles = useHandles === false;
  const drag_handles = useMemo(() => {
    const handles = coords.map((c, i) => {
      const name = `${isClosed ? 'polygon' : 'polyline'}-drag-${i}`;

      return (
        <DvdDragHandle
          key={name}
          name={name}
          size={size}
          i={i}
          x={c.x}
          y={c.y}
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

  const arrow = useMemo(() => createArrow(points[0], points[1]), [points]);

  return (
    <>
      {isClosed ? (
        <polygon points={pts} {...svgProps} />
      ) : (
        <polyline points={pts} {...svgProps} fill="none" />
      )}
      <polygon points={arrow} {...svgProps} fill={svgProps.stroke} />
      {!isFixed && !disableHandles && drag_handles}
    </>
  );
}

export default DvdPolyline;
