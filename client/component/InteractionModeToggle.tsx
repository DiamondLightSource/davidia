import { useEffect } from 'react';
import { IoShapesOutline } from 'react-icons/io5';
import { TbZoomInArea, TbZoomPan } from 'react-icons/tb';

import { ToggleGroup } from '@h5web/lib';

interface InteractionModeToggleProps {
  value: string;
  onModeChange: (value: string) => void;
  hasBaton: boolean;
}

export function InteractionModeToggle(props: InteractionModeToggleProps) {
  const { value, onModeChange, hasBaton } = props;

  useEffect(() => {
    if (!hasBaton && value === 'selectRegion') {
      onModeChange('panAndWheelZoom');
    }
  }, [value, onModeChange, hasBaton]);

  return (
    <>
      <ToggleGroup
        role="radiogroup"
        ariaLabel="mode"
        value={value}
        onChange={onModeChange}
      >
        <ToggleGroup.Btn
          label={decodeURI(
            'pan & wheel zoom%0A      alt: x-only%0A     shift: y-only'
          )}
          iconOnly
          icon={TbZoomPan}
          value={'panAndWheelZoom'}
        />
        <ToggleGroup.Btn
          label={decodeURI('select to zoom%0A   alt: x-only%0A  shift: y-only')}
          iconOnly
          icon={TbZoomInArea}
          value={'selectToZoom'}
        />
        <div // wrapper hack to add tooltip (note corners are not correctly drawn for this last child)
          style={{
            pointerEvents: hasBaton ? 'inherit' : 'auto',
            display: 'inline-flex',
          }}
          title={hasBaton ? '' : 'need baton'}
        >
          <ToggleGroup.Btn
            label="select region"
            iconOnly
            icon={IoShapesOutline}
            value={'selectRegion'}
            disabled={!hasBaton}
          />
        </div>
      </ToggleGroup>
    </>
  );
}
