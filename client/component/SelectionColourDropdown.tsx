import { Selector } from '@h5web/lib';
import styles from './SelectionTypeOption.module.css';

interface SelectionColourDropdownProps {
  value: string | null;
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

  options.push('Choose colour');

  return (
    <Selector
      value={value ?? 'Choose colour'}
      onChange={onSelectionColourChange}
      options={options}
      optionComponent={SelectionColourOption}
    />
  );
}

function SelectionColourOption(props: { option: string }) {
  const { option } = props;
  console.log('Label is ', option);

  return (
    <div className={styles.option}>
      <span>{option}</span>
    </div>
  );
}
