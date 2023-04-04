import { PointerEvent, SVGProps, useMemo } from 'react';
import { Size } from '@h5web/lib';
import { Drag } from '@visx/drag';
import { UseDrag } from '@visx/drag/lib/useDrag';

import type { HandleChangeFunction } from '../selections';

interface HandleProps extends SVGProps<SVGElement> {
  n: string;
  i: number;
  x: number;
  y: number;
  drag?: UseDrag;
}

function Handle(props: HandleProps) {
  const { n, x, y, i, drag, ...svgProps } = props;

  const handlers = useMemo(
    () => ({
      onPointerMove: drag?.dragMove,
      onPointerUp:
        drag &&
        ((e: PointerEvent) => {
          (e.target as Element).releasePointerCapture(e.pointerId);
          drag.dragEnd(e);
        }),
      onPointerDown:
        drag &&
        ((e: PointerEvent) => {
          (e.target as Element).setPointerCapture(e.pointerId);
          drag.dragStart(e);
        }),
    }),
    [drag]
  );

  const circleProps = useMemo(() => {
    if ('ref' in svgProps) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ref, ...nProps } = svgProps; // remove legacy ref
      return nProps;
    }
    return svgProps;
  }, [svgProps]) as SVGProps<SVGCircleElement>;

  return (
    <g
      transform={`translate(${drag?.dx ?? 0}, ${drag?.dy ?? 0})`}
      style={{ cursor: drag ? 'move' : undefined }}
      {...handlers}
    >
      <circle
        key={`${n}-handle-${i}`}
        cx={x}
        cy={y}
        r={10}
        pointerEvents="visibleFill"
        {...circleProps}
        fill={drag?.isDragging ? 'white' : 'transparent'}
        fillOpacity={drag?.isDragging ? 0.3 : 1.0}
        strokeWidth={1}
      />
      <circle
        key={`${n}-handle-surround-${i}`}
        cx={x}
        cy={y}
        r={20}
        fill="transparent"
        fillOpacity={0}
        stroke="none"
      />
    </g>
  );
}

export interface DvdDragHandleProps extends SVGProps<SVGElement> {
  name: string;
  size: Size;
  i: number;
  x: number;
  y: number;
  onHandleChange?: HandleChangeFunction;
}

export function DvdDragHandle(props: DvdDragHandleProps) {
  const { name, size, i, x, y, onHandleChange, ...svgProps } = props;
  return (
    <Drag
      width={size.width}
      height={size.height}
      x={x}
      y={y}
      captureDragArea={true}
      onDragMove={({ x, y, dx, dy }) => {
        onHandleChange?.(i, [(x ?? 0) + dx, (y ?? 0) + dy], false);
      }}
      onDragEnd={({ x, y, dx, dy, isDragging }) => {
        console.debug('DE:', x, y, '; delta:', dx, dy, '; drag:', isDragging);
        onHandleChange?.(i, [(x ?? 0) + dx, (y ?? 0) + dy]);
      }}
    >
      {(dragState) => (
        <Handle
          n={name}
          i={i}
          x={x}
          y={y}
          drag={onHandleChange && dragState}
          {...svgProps}
        />
      )}
    </Drag>
  );
}
