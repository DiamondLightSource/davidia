import type { SVGProps } from 'react';
import { Vector3 } from 'three';

export interface DvdPolygonProps extends SVGProps<SVGPolygonElement> {
  coords: Vector3[];
}

function DvdPolygon(props: DvdPolygonProps) {
  const { coords, ...svgProps } = props;
  const pts = coords.map((c) => `${c.x},${c.y}`).join(' ');
  return <polygon points={pts} {...svgProps} />;
}

export default DvdPolygon;
