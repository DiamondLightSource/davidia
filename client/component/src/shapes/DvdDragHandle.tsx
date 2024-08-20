import { type PointerEvent, type SVGProps, useMemo } from 'react';
import type { Size } from '@h5web/lib';
import { Drag } from '@visx/drag';
import type { UseDrag } from '@visx/drag/lib/useDrag';

import type { HandleChangeFunction } from '../selections/utils';

interface HandleProps extends SVGProps<SVGElement> {
  n: string;
  i: number;
  nx: number;
  ny: number;
  drag?: UseDrag;
}

const HANDLE_SIZE = 8;

function Handle(props: HandleProps) {
  const { n, nx, ny, i, drag, ...svgProps } = props;

  const handlers = useMemo(
    () => ({
      onPointerMove: drag?.dragMove,
      onPointerUp:
        drag &&
        ((e: PointerEvent) => {
          e.stopPropagation();
          (e.target as Element).releasePointerCapture(e.pointerId);
          drag.dragEnd(e);
        }),
      onPointerDown:
        drag &&
        ((e: PointerEvent) => {
          e.stopPropagation();
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
        cx={nx}
        cy={ny}
        r={HANDLE_SIZE}
        pointerEvents="visibleFill"
        {...circleProps}
        fill={drag?.isDragging ? 'white' : 'transparent'}
        fillOpacity={drag?.isDragging ? 0.3 : 1.0}
        strokeWidth={1}
      />
      <circle
        key={`${n}-handle-surround-${i}`}
        cx={nx}
        cy={ny}
        r={2 * HANDLE_SIZE}
        fill="transparent"
        fillOpacity={0}
        stroke="none"
      />
    </g>
  );
}

interface DvdDragHandleProps extends SVGProps<SVGElement> {
  name: string;
  size: Size;
  i: number;
  nx: number;
  ny: number;
  onHandleChange?: HandleChangeFunction;
  restrictX?: boolean;
  restrictY?: boolean;
}

function DvdDragHandle(props: DvdDragHandleProps) {
  const {
    name,
    size,
    i,
    nx,
    ny,
    onHandleChange,
    restrictX,
    restrictY,
    ...svgProps
  } = props;
  let restrict = {};
  if (restrictX) {
    restrict = { xMin: nx, xMax: nx };
  }
  if (restrictY) {
    restrict = { yMin: ny, yMax: ny, ...restrict };
  }

  return (
    <Drag
      width={size.width}
      height={size.height}
      x={nx}
      y={ny}
      captureDragArea={true}
      onDragMove={({ x, y, dx, dy }) => {
        onHandleChange?.(i, [(x ?? 0) + dx, (y ?? 0) + dy]);
      }}
      onDragEnd={({ x, y, dx, dy, isDragging }) => {
        console.debug('DE:', x, y, '; delta:', dx, dy, '; drag:', isDragging);
        onHandleChange?.(i, [(x ?? 0) + dx, (y ?? 0) + dy], false);
      }}
      restrict={restrict}
    >
      {(dragState) => (
        <Handle
          n={name}
          i={i}
          nx={nx}
          ny={ny}
          drag={onHandleChange && dragState}
          {...svgProps}
        />
      )}
    </Drag>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { DvdDragHandle, HANDLE_SIZE };
export type { DvdDragHandleProps };
