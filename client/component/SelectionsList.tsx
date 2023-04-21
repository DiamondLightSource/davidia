import { ColorMap } from '@h5web/lib';
import { ComponentType, ReactNode, SVGAttributes } from 'react';
import { useState } from 'react';

interface SelectionsListProps {
  title: string;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  label?: string;
  setLabel?: (value: string) => void;
  scaleType?: ScaleType;
  setScaleType?: (value: ScaleType) => void;
  colourMap?: ColorMap;
  setColourMap?: (value: ColorMap) => void;
  invertColourMap?: boolean;
  toggleColourMapInversion?: () => void;
  domain?: Domain;
  customDomain?: CustomDomain;
  setCustomDomain?: (value: CustomDomain) => void;
  values?: TypedArray;
  children?: ReactNode;
}

export function SelectionsList(props: SelectionsListProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Selections</button>
      <div
        className="willFloat"
        style={{
          display: isOpen ? 'block' : 'none',
          height: '110px',
          width: '150px',
          position: 'fixed',
          zIndex: 1,
          top: '50%',
          left: '50%',
        }}
      >
        <p>This will float in the center</p>
        <button onClick={() => setIsOpen(false)}>Close Modal</button>
      </div>
    </div>
  );
}
