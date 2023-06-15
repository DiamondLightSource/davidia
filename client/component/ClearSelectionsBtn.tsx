import { BaseSelection } from './selections';
import { Btn } from '@h5web/lib';

interface ClearSelectionsBtnProps {
  selections: BaseSelection[];
  updateSelections: (s: SelectionBase | null, b?: boolean, d?: boolean) => void;
  currentSelectionID: string | null;
  updateCurrentSelectionID: (s: string | null) => void;
}

export function ClearSelectionsBtn(props: ClearSelectionsBtnProps) {
  function handleDeleteSelection() {
    props.updateSelections(null, true, true);
    props.updateCurrentSelectionID(null);
  }

  return (
    <Btn
      label="Clear all selections"
      onClick={() => {
        if (window.confirm('Clear all selections?')) {
          handleDeleteSelection();
        }
      }}
    ></Btn>
  );
}
