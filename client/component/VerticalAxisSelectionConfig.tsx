import { LabelledInput } from './LabelledInput';
import { isNumber } from './utils';
import VerticalAxisSelection from './selections/VerticalAxisSelection';
import { YInput } from './SelectionConfigComponents';

interface VerticalAxisSelectionConfigProps {
  selection: VerticalAxisSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
}

export function VerticalAxisSelectionConfig(
  props: VerticalAxisSelectionConfigProps
) {
  return (
    <>
      <YInput
        selection={props.selection}
        updateSelections={props.updateSelections}
      />
      <LabelledInput<number>
        key="y length"
        label="y length"
        input={props.selection.dimensionLength[1]}
        updateValue={(l: number) => {
          props.selection.dimensionLength[1] = l;
          props.updateSelections(props.selection);
        }}
        decimalPlaces={8}
        isValid={(v) => isNumber(v)}
      />
    </>
  );
}
