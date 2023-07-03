import LinearSelection from './selections/LinearSelection';
import { AngleInput, XInput, YInput } from './SelectionConfigComponents';
import { Fragment } from 'react';

interface LinearSelectionConfigProps {
  selection: LinearSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
}

export function LinearSelectionConfig(props: LinearSelectionConfigProps) {
  const { selection, updateSelections } = props;

  return (
    <Fragment key="line">
      <XInput selection={selection} updateSelections={updateSelections} />

      <YInput selection={selection} updateSelections={updateSelections} />

      <AngleInput selection={selection} updateSelections={updateSelections} />
    </Fragment>
  );
}
