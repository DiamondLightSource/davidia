interface SelectionColourDropdownProps {
  value: string;
  onSelectionColourChange: (s: string) => void;
  disabled: boolean;
  options?: string[];
}

export function SelectionColourDropdown(props: SelectionColourDropdownProps) {
  const {
    value,
    onSelectionColourChange,
    options = [
      'black',
      'white',
      'red',
      'orange',
      'yellow',
      'green',
      'blue',
      'indigo',
      'violet',
      'grey',
    ],
  } = props;

  return (
    <select
      value={value}
      onChange={(e) => onSelectionColourChange(e.target.value)}
    >
      {options.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      <option value={''}>Choose colour</option>
    </select>
  );
}
