import { getSelectionLabel, SELECTION_ICONS } from './selections/utils';
import LinearSelection from './selections/LinearSelection';
import {
  AlphaInput,
  AngleInput,
  ColourPicker,
  NameInput,
  XInput,
  YInput,
} from './SelectionConfigComponents';

interface LinearSelectionConfigProps {
  selection: LinearSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
}

export function LinearSelectionConfig(props: LinearSelectionConfigProps) {
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
    </>
  );
}
