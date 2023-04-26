import { Selector } from '@h5web/lib';
import styles from './SelectionTypeOption.module.css';

interface SelectionIDDropdownProps {
  selections: SelectionBase[];
  value: string | null;
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

  options.push('Choose selection');

  return (
    <Selector
      value={value ?? 'Choose selection'}
      onChange={onSelectionIDChange}
      options={options}
      optionComponent={SelectionIDOption}
    />
  );
}

function SelectionIDOption(props: { option: string }) {
  const { option } = props;
  console.log('Label is ', option);

  return (
    <div className={styles.option}>
      <span>{option}</span>
    </div>
  );
}
