import type BaseSelection from './selections/BaseSelection';
import { Btn } from '@h5web/lib';
import type { SelectionHandler } from './selections/utils';

/**
 * Props for the `ClearSelectionsBtn` component.
 */
interface ClearSelectionsBtnProps {
  /** The current selections */
  selections: BaseSelection[];
  /** The function to call to update the selections state */
  updateSelection: SelectionHandler;
  /** The ID of the current selection */
  currentSelectionID: string | null;
  /** The function to call to update the current selection ID */
  updateCurrentSelectionID: (s: string | null) => void;
  /** Indicates whether the component is disabled (optional) */
  disabled?: boolean;
}

/**
 * Render a button to clear selections.
 * @param {ClearSelectionsBtnProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function ClearSelectionsBtn(props: ClearSelectionsBtnProps): JSX.Element {
  function handleDeleteSelection() {
    if (props.updateSelection) {
      props.updateSelection(null, true, true);
    }
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
    />
  );
}

export type { ClearSelectionsBtnProps };
export default ClearSelectionsBtn;
