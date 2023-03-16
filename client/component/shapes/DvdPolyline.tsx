import type { SVGProps } from 'react';
import { Vector3 } from 'three';

export interface DvdPolylineProps extends SVGProps<SVGPolylineElement> {
  coords: Vector3[];
}

function DvdPolyline(props: DvdPolylineProps) {
  const { coords, ...svgProps } = props;
  const pts = coords.map((c) => `${c.x},${c.y}`).join(' ');
  return <polyline points={pts} {...svgProps} />;
}

export default DvdPolyline;
