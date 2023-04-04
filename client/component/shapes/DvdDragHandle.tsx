import { PointerEvent, useMemo } from 'react';
import { Size } from '@h5web/lib';
import { Drag } from '@visx/drag';
import { UseDrag } from '@visx/drag/lib/useDrag';

import type { HandleChangeFunction } from '../selections';

interface HandleProps {
  n: string;
  x: number;
  y: number;
  i: number;
  d?: UseDrag;
}

function Handle(props: HandleProps) {
  const { n, x, y, i, d } = props;

  const handlers = useMemo(
    () => ({
      onPointerMove: d?.dragMove,
      onPointerUp:
        d &&
        ((e: PointerEvent) => {
          (e.target as Element).releasePointerCapture(e.pointerId);
          d.dragEnd(e);
        }),
      onPointerDown:
        d &&
        ((e: PointerEvent) => {
          (e.target as Element).setPointerCapture(e.pointerId);
          d.dragStart(e);
        }),
    }),
    [d]
  );

  return (
    <g
      transform={`translate(${d?.dx ?? 0}, ${d?.dy ?? 0})`}
      style={{ cursor: d ? 'move' : undefined }}
      {...handlers}
    >
      <circle
        key={`${n}-handle-${i}`}
        cx={x}
        cy={y}
        r={10}
        fill={d?.isDragging ? 'white' : 'transparent'}
        stroke="black"
        strokeWidth={1}
        pointerEvents="visibleFill"
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

export interface DvdDragHandleProps {
  name: string;
  size: Size;
  i: number;
  x: number;
  y: number;
  onHandleChange?: HandleChangeFunction;
}

export function DvdDragHandle(props: DvdDragHandleProps) {
  const { name, size, i, x, y, onHandleChange } = props;
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
        <Handle n={name} x={x} y={y} i={i} d={onHandleChange && dragState} />
      )}
    </Drag>
  );
}
