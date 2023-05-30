import Select, { StylesConfig } from 'react-select';
import { SELECTION_ICONS } from './SelectionConfig';
import { getSelectionLabel } from './selections';
import { ValueType } from 'react-select/lib/types';

interface OptionType {
  label: string;
  value: string;
  bgcolour: string;
}

interface SelectionIDDropdownProps {
  selections: SelectionBase[];
  selectionID: string | null;
  onSelectionIDChange: (s: string) => void;
  options?: string[];
}

export function SelectionIDDropdown(props: SelectionIDDropdownProps) {
  const {
    selectionID,
    onSelectionIDChange,
    options = props.selections.map((s) => s.id),
  } = props;

  if (selectionID === '' && props.selections.length > 0) {
    console.log(
      'Setting selectionID to default selection: ',
      props.selections[0]
    );
    onSelectionIDChange(props.selections[0].id);
  }

  const defaultColour = '#ffffff';

  function getSelectionColour(i: string) {
    const selection = props.selections.find((s) => s.id === i);
    return selection?.colour ?? defaultColour;
  }

  const selectStyles: StylesConfig<OptionType> = {
    option: (provided, state) => {
      return {
        ...provided,
        backgroundColor: state.data.bgcolour,
      };
    },
  };

  const optionsArr = options.map((s) => ({
    value: s,
    label: getSelectionLabel(props.selections, s, SELECTION_ICONS),
    bgcolour: getSelectionColour(s),
  }));

  return (
    <Select
      styles={selectStyles}
      value={{
        value: selectionID,
        label: getSelectionLabel(
          props.selections,
          selectionID,
          SELECTION_ICONS
        ),
        bgcolour: getSelectionColour(selectionID ?? ''),
      }}
      options={optionsArr}
      onChange={(selectedOption: ValueType<OptionType>) =>
        onSelectionIDChange((selectedOption as OptionType).value)
      }
    />
  );
}
