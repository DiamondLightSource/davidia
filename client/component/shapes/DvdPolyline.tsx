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
  singleAxis?: 'horizontal' | 'vertical';
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
    singleAxis,
    onHandleChange,
    ...svgProps
  } = props;

  const xCoords = coords.map((c) => c.x);
  const xMin = Math.min(...xCoords);
  const xMax = Math.max(...xCoords);
  const yCoords = coords.map((c) => c.y);
  const yMin = Math.min(...yCoords);
  const yMax = Math.max(...yCoords);

  let correctedCoords = useMemo(() => [...coords], [coords]);
  if (singleAxis === 'vertical') {
    correctedCoords = [
      new Vector3(0, yMin),
      new Vector3(0, yMax),
      new Vector3(size.width, yMax),
      new Vector3(size.width, yMin),
      new Vector3(size.width / 2, (yMin + yMax) / 2),
    ];
  } else if (singleAxis === 'horizontal') {
    correctedCoords = [
      new Vector3(xMin, 0),
      new Vector3(xMax, 0),
      new Vector3(xMax, size.height),
      new Vector3(xMin, size.height),
      new Vector3((xMin + xMax) / 2, size.height / 2),
    ];
  }

  const drag_handles = useMemo(() => {
    const handles = correctedCoords.map((c, i) => {
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
          restrictX={singleAxis === 'vertical'}
          restrictY={singleAxis === 'horizontal'}
          {...svgProps}
        />
      );
    });
    return handles;
  }, [correctedCoords, isClosed, size, onHandleChange, singleAxis, svgProps]);
  correctedCoords.pop(); // remove centre handle

  const pts = useMemo(
    () => correctedCoords.map((c) => `${c.x},${c.y}`).join(' '),
    [correctedCoords]
  );

  const arrow = useMemo(() => createArrow(coords[0], coords[1]), [coords]);

  return (
    <>
      {isClosed ? (
        <polygon
          points={pts}
          {...svgProps}
          stroke={props.singleAxis !== undefined ? 'none' : svgProps.fill}
        />
      ) : (
        <polyline points={pts} {...svgProps} fill="none" />
      )}
      <polygon points={arrow} {...svgProps} />
      {!isFixed && drag_handles}
      {singleAxis === 'horizontal' && (
        <line
          x1={xMin}
          y1={0}
          x2={xMin}
          y2={size.height}
          stroke={svgProps.fill}
        />
      )}
      {singleAxis === 'horizontal' && (
        <line
          x1={xMax}
          y1={0}
          x2={xMax}
          y2={size.height}
          stroke={svgProps.fill}
        />
      )}
      {singleAxis === 'vertical' && (
        <line
          x1={0}
          y1={yMin}
          x2={size.width}
          y2={yMin}
          stroke={svgProps.fill}
        />
      )}
      {singleAxis === 'vertical' && (
        <line
          x1={0}
          y1={yMax}
          x2={size.width}
          y2={yMax}
          stroke={svgProps.fill}
        />
      )}
    </>
  );
}

export default DvdPolyline;
