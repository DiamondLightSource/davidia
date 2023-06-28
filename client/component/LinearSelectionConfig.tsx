import LinearSelection from './selections/LinearSelection';
import { AngleInput, XInput, YInput } from './SelectionConfigComponents';

interface LinearSelectionConfigProps {
  selection: LinearSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
}

export function LinearSelectionConfig(props: LinearSelectionConfigProps) {
  return (
    <>
      <XInput
        selection={props.selection}
        updateSelections={props.updateSelections}
      />

      <YInput
        selection={props.selection}
        updateSelections={props.updateSelections}
      />

      <AngleInput
        selection={props.selection}
        updateSelections={props.updateSelections}
      />
    </>
  );
}
