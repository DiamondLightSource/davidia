import LinearSelection from './selections/LinearSelection';
import { AngleInput, XInput, YInput } from './SelectionConfigComponents';
import { Fragment } from 'react';

interface LinearSelectionConfigProps {
  selection: LinearSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
  disabled?: boolean;
}

export function LinearSelectionConfig(props: LinearSelectionConfigProps) {
  const { selection, updateSelections, disabled } = props;

  return (
    <Fragment key="line">
      <XInput
        selection={selection}
        updateSelections={updateSelections}
        disabled={disabled}
      />

      <YInput
        selection={selection}
        updateSelections={updateSelections}
        disabled={disabled}
      />

      <AngleInput
        selection={selection}
        updateSelections={updateSelections}
        disabled={disabled}
      />
    </Fragment>
  );
}
