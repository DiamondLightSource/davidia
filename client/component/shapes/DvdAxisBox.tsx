import { SVGProps, useMemo } from 'react';
import { Vector3 } from 'three';
import type { HandleChangeFunction } from '../selections/utils';
import { Size } from '@h5web/lib';
import { DvdDragHandle } from './DvdDragHandle';

export interface DvdAxisBoxProps extends SVGProps<SVGPolygonElement> {
  size: Size; // canvas width, height
  coords: Vector3[]; // last coordinate vector is centre handle
  isFixed?: boolean;
  singleAxis: 'horizontal' | 'vertical';
  onHandleChange?: HandleChangeFunction;
}

function DvdAxisBox(props: DvdAxisBoxProps) {
  const { size, coords, isFixed, singleAxis, onHandleChange, ...svgProps } =
    props;

  const cCoords =
    singleAxis === 'horizontal'
      ? coords.map((c) => c.x)
      : coords.map((c) => c.y);
  const cMin = Math.min(...cCoords);
  const cMax = Math.max(...cCoords);

  let correctedCoords = useMemo(() => [...coords], [coords]);
  if (singleAxis === 'horizontal') {
    correctedCoords = [
      new Vector3(cMin, 0),
      new Vector3(cMax, 0),
      new Vector3(cMax, size.height),
      new Vector3(cMin, size.height),
      new Vector3((cMin + cMax) / 2, size.height / 2),
    ];
  } else {
    correctedCoords = [
      new Vector3(0, cMin),
      new Vector3(0, cMax),
      new Vector3(size.width, cMax),
      new Vector3(size.width, cMin),
      new Vector3(size.width / 2, (cMin + cMax) / 2),
    ];
  }

  const drag_handles = useMemo(() => {
    const handles = correctedCoords.map((c, i) => {
      const name = `'axisbox-drag-${i}`;

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
  }, [correctedCoords, size, onHandleChange, singleAxis, svgProps]);
  correctedCoords.pop(); // remove centre handle

  const pts = useMemo(
    () => correctedCoords.map((c) => `${c.x},${c.y}`).join(' '),
    [correctedCoords]
  );

  return (
    <>
      <polygon points={pts} {...svgProps} stroke="none" />
      {!isFixed && drag_handles}
      {singleAxis === 'horizontal' && (
        <>
          <line
            x1={cMin}
            y1={0}
            x2={cMin}
            y2={size.height}
            stroke={svgProps.fill}
          />
          <line
            x1={cMax}
            y1={0}
            x2={cMax}
            y2={size.height}
            stroke={svgProps.fill}
          />
        </>
      )}
      {singleAxis === 'vertical' && (
        <>
          <line
            x1={0}
            y1={cMin}
            x2={size.width}
            y2={cMin}
            stroke={svgProps.fill}
          />
          <line
            x1={0}
            y1={cMax}
            x2={size.width}
            y2={cMax}
            stroke={svgProps.fill}
          />
        </>
      )}
    </>
  );
}

export default DvdAxisBox;
