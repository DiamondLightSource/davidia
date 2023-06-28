import { LabelledInput } from './LabelledInput';
import { getSelectionLabel, SELECTION_ICONS } from './selections/utils';
import { isNumber, toFixedNumber } from './utils';
import RectangularSelection from './selections/RectangularSelection';
import {
  AlphaInput,
  AngleInput,
  ColourPicker,
  NameInput,
  XInput,
  YInput,
} from './SelectionConfigComponents';

interface RectangularSelectionConfigProps {
  selection: RectangularSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
}

export function RectangularSelectionConfig(
  props: RectangularSelectionConfigProps
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
        input={toFixedNumber(props.selection.lengths[0], 5)}
        updateValue={(l: number) => {
          props.selection.lengths[0] = l;
          props.updateSelections(props.selection);
        }}
        isValid={(v) => isNumber(v)}
      />

      <LabelledInput<number>
        key="y length"
        label="y length"
        input={toFixedNumber(props.selection.lengths[1], 5)}
        updateValue={(l: number) => {
          props.selection.lengths[1] = l;
          props.updateSelections(props.selection);
        }}
        isValid={(v) => isNumber(v)}
      />
    </>
  );
}
