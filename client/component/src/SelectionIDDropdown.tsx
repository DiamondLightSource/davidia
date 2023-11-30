import Select, { type StylesConfig } from 'react-select';
import { SELECTION_ICONS } from './SelectionConfig';
import { getSelectionLabelFromID } from './selections/utils';
import type { SelectionBase } from './selections/utils';

interface SelectionOption {
  value: string;
  label: string;
  bgcolour: string;
}

interface SelectionIDDropdownProps {
  selections: SelectionBase[];
  selectionID: string | null;
  onSelectionIDChange: (s: string) => void;
  options?: string[];
}

function SelectionIDDropdown(props: SelectionIDDropdownProps) {
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

  const selectStyles: StylesConfig<SelectionOption> = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.data.bgcolour,
    }),
  };

  const optionsArr = options.map(
    (s) =>
      ({
        value: s,
        label: getSelectionLabelFromID(props.selections, s, SELECTION_ICONS),
        bgcolour: getSelectionColour(s),
      } as SelectionOption)
  );

  return (
    <Select<SelectionOption>
      styles={selectStyles}
      value={
        {
          value: selectionID,
          label: getSelectionLabelFromID(
            props.selections,
            selectionID,
            SELECTION_ICONS
          ),
          bgcolour: getSelectionColour(selectionID ?? ''),
        } as SelectionOption
      }
      options={optionsArr}
      onChange={(selectedOption) => {
        if (selectedOption !== null) {
          onSelectionIDChange(selectedOption.value);
        }
      }}
    />
  );
}

export default SelectionIDDropdown;
export type { SelectionIDDropdownProps };
