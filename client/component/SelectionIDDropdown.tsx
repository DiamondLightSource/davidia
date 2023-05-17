import Select, { StylesConfig } from 'react-select';
import { getSelectionType } from './selections';
import { ValueType } from 'react-select/lib/types';

interface OptionType {
  label: string;
  value: string;
  bgcolour: string;
}

interface SelectionIDDropdownProps {
  selections: SelectionBase[];
  value: string;
  onSelectionIDChange: (s: string) => void;
  disabled: boolean;
  options?: string[];
}

export function SelectionIDDropdown(props: SelectionIDDropdownProps) {
  const {
    value,
    onSelectionIDChange,
    options = props.selections.map((s) => s.id),
  } = props;

  const selectionIcons = {
    line: '\u2014',
    rectangle: '\u25ad',
    polyline: '\u299a',
    polygon: '\u2b21',
    circle: '\u25cb',
    ellipse: '\u2b2d',
    sector: '\u25d4',
    unknown: ' ',
  };

  const defaultColour = '#ffffff';

  function getSelectionLabel(i: string): string {
    const selection = props.selections.find((s) => s.id == i);
    if (selection != undefined) {
      const selectionIcon = selectionIcons[getSelectionType(selection)];
      const selectionLabel = `${selectionIcon} ${selection.name} ${i}`;
      return selectionLabel;
    } else {
      return 'Choose selection';
    }
  }

  function getSelectionColour(i: string) {
    const selection = props.selections.find((s) => s.id == i);
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

  const optionComps = options.map((s) => ({
    value: s,
    label: getSelectionLabel(s),
    bgcolour: getSelectionColour(s),
  }));
  optionComps.push({
    value: '',
    label: 'Choose selection',
    bgcolour: defaultColour,
  });

  console.log('optionComps: ', optionComps);

  return (
    <Select
      styles={selectStyles}
      value={{
        value: value,
        label: getSelectionLabel(value),
        bgcolour: getSelectionColour(value),
      }}
      options={optionComps}
      onChange={(selectedOption: ValueType<OptionType>) =>
        onSelectionIDChange((selectedOption as OptionType).value)
      }
    />
  );
}
