import { LabelledInput } from './LabelledInput';
import { isNumber } from './utils';
import RectangularSelection from './selections/RectangularSelection';
import { AngleInput, XInput, YInput } from './SelectionConfigComponents';
import { Fragment } from 'react';

interface RectangularSelectionConfigProps {
  selection: RectangularSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
  disabled?: boolean;
}

export function RectangularSelectionConfig(
  props: RectangularSelectionConfigProps
) {
  const { selection, updateSelections, disabled } = props;

  return (
    <Fragment key="rectangle">
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

      <LabelledInput<number>
        key="x length"
        label="x length"
        input={selection.lengths[0]}
        updateValue={(l: number) => {
          selection.lengths[0] = l;
          updateSelections(selection);
        }}
        decimalPlaces={8}
        isValid={(v) => isNumber(v)}
        disabled={disabled}
      />

      <LabelledInput<number>
        key="y length"
        label="y length"
        input={selection.lengths[1]}
        updateValue={(l: number) => {
          selection.lengths[1] = l;
          updateSelections(selection);
        }}
        decimalPlaces={8}
        isValid={(v) => isNumber(v)}
        disabled={disabled}
      />
    </Fragment>
  );
}
