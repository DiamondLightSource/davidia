import { ToggleGroup } from '@h5web/lib';

import { SelectionType } from './selections';

interface SelectionTypeSelectorProps {
  selectionType: SelectionType;
  setSelectionType: (value: SelectionType) => void;
}

export function SelectionTypeSelector(props: SelectionTypeSelectorProps) {
  function selectionTypeToString(val: SelectionType): string {
    return SelectionType[val];
  }

  function handleSelectionType(val: string) {
    if (val === 'line') {
      props.setSelectionType(SelectionType.line);
    } else {
      props.setSelectionType(SelectionType.rectangle);
    }
  }

  return (
    <ToggleGroup
      role="radiogroup"
      ariaLabel="selectionType"
      value={selectionTypeToString(props.selectionType)}
      onChange={handleSelectionType}
    >
      <ToggleGroup.Btn label="rectangle" value="rectangle" />
      <ToggleGroup.Btn label="line" value="line" />
    </ToggleGroup>
  );
}
