import { getSelectionType } from './selections';

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

  function getSelectionLabel(i: string) {
    const selection = props.selections.find((s) => s.id == i);
    if (selection != undefined) {
      const colour = selection.colour ?? '';
      const selectionType = getSelectionType(selection);
      const selectionLabel = `${selection.name} ${colour} ${selectionType} ${i}`;
      return selectionLabel;
    } else {
      return null;
    }
  }

  return (
    <select value={value} onChange={(e) => onSelectionIDChange(e.target.value)}>
      {options.map((s) => (
        <option key={s} value={s}>
          {getSelectionLabel(s)}
        </option>
      ))}
      <option value={''}>Choose selection</option>
    </select>
  );
}
