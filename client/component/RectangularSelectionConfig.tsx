import { LabelledInput } from './LabelledInput';
import { isNumber } from './utils';
import RectangularSelection from './selections/RectangularSelection';
import { AngleInput, XInput, YInput } from './SelectionConfigComponents';

interface RectangularSelectionConfigProps {
  selection: RectangularSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
}

export function RectangularSelectionConfig(
  props: RectangularSelectionConfigProps
) {
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

      <LabelledInput<number>
        key="x length"
        label="x length"
        input={props.selection.lengths[0]}
        updateValue={(l: number) => {
          props.selection.lengths[0] = l;
          props.updateSelections(props.selection);
        }}
        decimalPlaces={5}
        isValid={(v) => isNumber(v)}
      />

      <LabelledInput<number>
        key="y length"
        label="y length"
        input={props.selection.lengths[1]}
        updateValue={(l: number) => {
          props.selection.lengths[1] = l;
          props.updateSelections(props.selection);
        }}
        decimalPlaces={5}
        isValid={(v) => isNumber(v)}
      />
    </>
  );
}
