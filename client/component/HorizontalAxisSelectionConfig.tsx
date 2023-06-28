import { LabelledInput } from './LabelledInput';
import { isNumber } from './utils';
import HorizontalAxisSelection from './selections/HorizontalAxisSelection';
import { XInput } from './SelectionConfigComponents';

interface HorizontalAxisSelectionConfigProps {
  selection: HorizontalAxisSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
}

export function HorizontalAxisSelectionConfig(
  props: HorizontalAxisSelectionConfigProps
) {
  return (
    <>
      <XInput
        selection={props.selection}
        updateSelections={props.updateSelections}
      />
      <LabelledInput<number>
        key="x length"
        label="x length"
        input={props.selection.dimensionLength[0]}
        updateValue={(l: number) => {
          props.selection.dimensionLength[0] = l;
          props.updateSelections(props.selection);
        }}
        decimalPlaces={5}
        isValid={(v) => isNumber(v)}
      />
    </>
  );
}
