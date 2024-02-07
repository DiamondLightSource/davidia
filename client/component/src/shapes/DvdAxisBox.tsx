import { type SVGProps, useMemo } from 'react';
import { Vector3 } from 'three';
import type { HandleChangeFunction } from '../specific-selections/utils';
import type { Size } from '@h5web/lib';
import { DvdDragHandle } from './DvdDragHandle';

function generateInitialPoints(
  axis: number,
  cMin: number,
  size: Size,
  cMax: number
): Vector3[] {
  if (axis === 0) {
    return [
      new Vector3(cMin, size.height),
      new Vector3(cMin, 0),
      new Vector3(cMax, 0),
      new Vector3(cMax, size.height),
      new Vector3((cMin + cMax) / 2, size.height / 2),
    ];
  }

  return [
    new Vector3(0, cMax),
    new Vector3(size.width, cMax),
    new Vector3(size.width, cMin),
    new Vector3(0, cMin),
    new Vector3(size.width / 2, (cMin + cMax) / 2),
  ];
}

// todo
function useCustomDragHandles(
  points: Vector3[],
  size: Size,
  onHandleChange: HandleChangeFunction | undefined,
  axis: number,
  svgProps: SVGProps<SVGPolygonElement>
) {
  return useMemo(() => {
    const handles = points.map((c, i) => {
      const name = `'axisbox-drag-${i}`;

      return (
        <DvdDragHandle
          key={name}
          name={name}
          size={size}
          i={i}
          nx={c.x}
          ny={c.y}
          onHandleChange={onHandleChange}
          restrictX={axis !== 0}
          restrictY={axis === 0}
          {...svgProps}
        />
      );
    });
    return handles;
  }, [points, size, onHandleChange, axis, svgProps]);
}

interface DvdAxisBoxProps extends SVGProps<SVGPolygonElement> {
  size: Size; // canvas width, height
  coords: Vector3[]; // only two coordinates expected
  isFixed?: boolean;
  axis: number;
  onHandleChange?: HandleChangeFunction;
}

function DvdAxisBox({
  size,
  coords,
  isFixed,
  axis,
  onHandleChange,
  ...svgProps
}: DvdAxisBoxProps) {
  const values = [coords[0].getComponent(axis), coords[1].getComponent(axis)];
  const cMin = Math.min(values[0], values[1]);
  const cMax = Math.max(values[0], values[1]);

  const points: Vector3[] = generateInitialPoints(axis, cMin, size, cMax);

  const drag_handles: JSX.Element[] = useCustomDragHandles(
    points,
    size,
    onHandleChange,
    axis,
    svgProps
  );

  points.pop(); // remove centre handle // why?

  const pts: string = useMemo(
    () => points.map((c) => `${c.x},${c.y}`).join(' '),
    [points]
  );

  return (
    <>
      <polygon points={pts} {...svgProps} stroke="none" />
      {!isFixed && drag_handles}
      {axis === 0 && (
        <>
          <line
            x1={cMin}
            y1={0}
            x2={cMin}
            y2={size.height}
            stroke={svgProps.fill}
            strokeDasharray={svgProps.strokeDasharray}
          />
          <line
            x1={cMax}
            y1={0}
            x2={cMax}
            y2={size.height}
            stroke={svgProps.fill}
            strokeDasharray={svgProps.strokeDasharray}
          />
        </>
      )}
      {axis !== 0 && (
        <>
          <line
            x1={0}
            y1={cMin}
            x2={size.width}
            y2={cMin}
            stroke={svgProps.fill}
            strokeDasharray={svgProps.strokeDasharray}
          />
          <line
            x1={0}
            y1={cMax}
            x2={size.width}
            y2={cMax}
            stroke={svgProps.fill}
            strokeDasharray={svgProps.strokeDasharray}
          />
        </>
      )}
    </>
  );
}

export default DvdAxisBox;
export type { DvdAxisBoxProps };
