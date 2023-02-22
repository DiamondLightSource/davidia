import '@h5web/lib/dist/styles.css';

import { IoShapesOutline } from 'react-icons/io5';
import { TbZoomInArea, TbZoomPan } from 'react-icons/tb';

import { ToggleGroup } from './ToggleGroup';

interface InteractionModeToggleProps {
  value: string;
  onModeChange: (value: string) => void;
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
          label=""
          icon={TbZoomPan}
          value={'panAndWheelZoom'}
          tooltipText={'pan & wheel zoom; alt=x-only & shift=y-only'}
        />
        <ToggleGroup.Btn
          label=""
          icon={TbZoomInArea}
          value={'selectToZoom'}
          tooltipText={'select to zoom; alt=x-only & shift=y-only'}
        />
        <ToggleGroup.Btn
          label=""
          icon={IoShapesOutline}
          value={'selectRegion'}
          tooltipText={'select region'}
        />
      </ToggleGroup>
    </>
  );
}
