import '@h5web/lib/dist/styles.css';

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
        <ToggleGroup.Btn label="pan & wheel zoom" value={'panAndWheelZoom'} />
        <ToggleGroup.Btn label="select to zoom" value={'selectToZoom'} />
        <ToggleGroup.Btn label="select region" value={'selectRegion'} />
      </ToggleGroup>
    </>
  );
}
