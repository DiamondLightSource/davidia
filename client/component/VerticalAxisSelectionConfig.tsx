import { LabelledInput } from './LabelledInput';
import { getSelectionLabel, SELECTION_ICONS } from './selections/utils';
import { isNumber, toFixedNumber } from './utils';
import VerticalAxisSelection from './selections/VerticalAxisSelection';
import {
  AlphaInput,
  ColourPicker,
  NameInput,
  YInput,
} from './SelectionConfigComponents';

interface VerticalAxisSelectionConfigProps {
  selection: VerticalAxisSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
}

export function VerticalAxisSelectionConfig(
  props: VerticalAxisSelectionConfigProps
) {
  return (
    <>
      <h4 key="Selection">
        {' '}
        {getSelectionLabel(props.selection, SELECTION_ICONS)}{' '}
      </h4>
      <ColourPicker
        selection={props.selection}
        updateSelections={props.updateSelections}
      />
      <NameInput
        selection={props.selection}
        updateSelections={props.updateSelections}
      />

      <AlphaInput
        selection={props.selection}
        updateSelections={props.updateSelections}
      />
      <YInput
        selection={props.selection}
        updateSelections={props.updateSelections}
      />
      <LabelledInput<number>
        key="y length"
        label="y length"
        input={toFixedNumber(props.selection.dimensionLength[1], 5)}
        updateValue={(l: number) => {
          props.selection.dimensionLength[1] = l;
          props.updateSelections(props.selection);
        }}
        isValid={(v) => isNumber(v)}
      />
    </>
  );
}
