import '@h5web/lib/dist/styles.css';

import { IoShapesOutline } from 'react-icons/io5';
import { TbZoomInArea, TbZoomPan } from 'react-icons/tb';

import { ToggleGroup } from '@h5web/lib';

interface InteractionModeToggleProps {
  value: string;
  onModeChange: (value: string) => void;
  hasBaton: boolean;
}

export function InteractionModeToggle(props: InteractionModeToggleProps) {
  return (
    <>
      <ToggleGroup
        role="radiogroup"
        ariaLabel="mode"
        value={props.value}
        onChange={props.onModeChange}
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
        <ToggleGroup.Btn
          label="select region"
          iconOnly
          icon={IoShapesOutline}
          value={'selectRegion'}
          disabled={!props.hasBaton}
        />
      </ToggleGroup>
    </>
  );
}
