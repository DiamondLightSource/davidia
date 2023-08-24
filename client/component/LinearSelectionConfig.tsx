import LinearSelection from './selections/LinearSelection';
import { AngleInput, XInput, YInput } from './SelectionConfigComponents';
import { Fragment } from 'react';

interface LinearSelectionConfigProps {
  selection: LinearSelection;
  updateSelection: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
  disabled?: boolean;
}

export function LinearSelectionConfig(props: LinearSelectionConfigProps) {
  const { selection, updateSelection, disabled } = props;

  return (
    <Fragment key="line">
      <XInput
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />

      <YInput
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />

      <AngleInput
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />
    </Fragment>
  );
}
