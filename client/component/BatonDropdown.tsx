import Select from 'react-select';

interface BatonDropdownProps {
  options: string[];
  baton: string;
  onBatonSelection: (s: string) => void;
}

export function BatonDropdown(props: BatonDropdownProps) {
  const optionsArr = props.options.map((s) => ({
    value: s,
    label: s,
  }));

  return (
    <div style={{ width: '200px' }}>
      <Select
        placeholder={'Select new baton holder'}
        options={optionsArr}
        onChange={(o) => {
          if (o !== null) {
            props.onBatonSelection(o.value);
          }
        }}
      />
    </div>
  );
}
