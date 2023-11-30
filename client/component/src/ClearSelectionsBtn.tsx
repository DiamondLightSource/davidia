import type BaseSelection from './selections/BaseSelection';
import { Btn } from '@h5web/lib';
import type { SelectionBase } from '.';

interface ClearSelectionsBtnProps {
  selections: BaseSelection[];
  updateSelections: (s: SelectionBase | null, b?: boolean, d?: boolean) => void;
  currentSelectionID: string | null;
  updateCurrentSelectionID: (s: string | null) => void;
  disabled?: boolean;
}

function ClearSelectionsBtn(props: ClearSelectionsBtnProps) {
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
      disabled={props.disabled}
    ></Btn>
  );
}

export type { ClearSelectionsBtnProps };
export default ClearSelectionsBtn;
