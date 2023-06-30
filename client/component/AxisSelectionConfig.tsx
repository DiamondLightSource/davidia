import { LabelledInput } from './LabelledInput';
import { isNumber } from './utils';
import AxisSelection from './selections/AxisSelection';
import { XInput, YInput } from './SelectionConfigComponents';
import { Fragment } from 'react';

interface AxisSelectionConfigProps {
  selection: AxisSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
}

export function AxisSelectionConfig(props: AxisSelectionConfigProps) {
  const { selection, updateSelections } = props;

  return selection.dimension === 0 ? (
    <Fragment key="axis x">
      <XInput selection={selection} updateSelections={updateSelections} />
      <LabelledInput<number>
        key="x length"
        label="x length"
        input={selection.length}
        updateValue={(l: number) => {
          selection.length = l;
          updateSelections(selection);
        }}
        decimalPlaces={8}
        isValid={(v) => isNumber(v)}
      />
    </Fragment>
  ) : (
    <Fragment key="axis y">
      <YInput selection={selection} updateSelections={updateSelections} />
      <LabelledInput<number>
        key="y length"
        label="y length"
        input={selection.length}
        updateValue={(l: number) => {
          selection.length = l;
          updateSelections(selection);
        }}
        decimalPlaces={8}
        isValid={(v) => isNumber(v)}
      />
    </Fragment>
  );
}
