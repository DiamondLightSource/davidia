import '@h5web/lib/dist/styles.css';

import styles from './InteractionModeToggle.module.css';

import { IoShapesOutline } from 'react-icons/io5';
import { TbZoomInArea, TbZoomPan } from 'react-icons/tb';

import { ToggleGroup } from '@h5web/lib';

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
        <div className={styles.tooltip}>
          <ToggleGroup.Btn
            label=""
            icon={TbZoomPan}
            value={'panAndWheelZoom'}
          />
          <div className={styles.bottom}>
            <p>pan & wheel zoom</p>
          </div>
        </div>
        <div className={styles.tooltip}>
          <ToggleGroup.Btn
            label=""
            icon={TbZoomInArea}
            value={'selectToZoom'}
          />
          <div className={styles.bottom}>
            <p>select to zoom</p>
          </div>
        </div>
        <div className={styles.tooltip}>
          <ToggleGroup.Btn
            label=""
            icon={IoShapesOutline}
            value={'selectRegion'}
          />
          <div className={styles.bottom}>
            <p>select region</p>
          </div>
        </div>
      </ToggleGroup>
    </>
  );
}
