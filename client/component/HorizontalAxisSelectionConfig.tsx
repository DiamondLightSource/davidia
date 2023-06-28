import { LabelledInput } from './LabelledInput';
import { getSelectionLabel, SELECTION_ICONS } from './selections/utils';
import { isNumber, toFixedNumber } from './utils';
import HorizontalAxisSelection from './selections/HorizontalAxisSelection';
import {
  AlphaInput,
  ColourPicker,
  NameInput,
  XInput,
} from './SelectionConfigComponents';

interface HorizontalAxisSelectionConfigProps {
  selection: HorizontalAxisSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
}

export function HorizontalAxisSelectionConfig(
  props: HorizontalAxisSelectionConfigProps
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
      <XInput
        selection={props.selection}
        updateSelections={props.updateSelections}
      />
      <LabelledInput<number>
        key="x length"
        label="x length"
        input={toFixedNumber(props.selection.dimensionLength[0], 5)}
        updateValue={(l: number) => {
          props.selection.dimensionLength[0] = l;
          props.updateSelections(props.selection);
        }}
        isValid={(v) => isNumber(v)}
      />
    </>
  );
}
