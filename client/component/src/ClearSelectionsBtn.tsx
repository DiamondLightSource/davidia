import type BaseSelection from './selections/BaseSelection';
import { Btn } from '@h5web/lib';
import type { SelectionBase } from '.';

/**
 * The props for the `ClearSelectionsBtn` component.
 * @interface {object} ClearSelectionsBtnProps
 * @member {BaseSelection[]} selections - The current selections.
 * @member {(s: SelectionBase | null, b?: boolean, c?: boolean) => void} updateSelections - The function to call to update the selections state.
 * @member {string | null} currentSelectionID - The ID of the current selection.
 * @member {(s: string | null) => void} updateCurrentSelectionID - The function to call to update the current selection iD.
 * @member {boolean} [disabled] - Indicates whether the component is disabled.
 */
interface ClearSelectionsBtnProps {
  selections: BaseSelection[];
  updateSelections: (s: SelectionBase | null, b?: boolean, d?: boolean) => void;
  currentSelectionID: string | null;
  updateCurrentSelectionID: (s: string | null) => void;
  disabled?: boolean;
}

/**
 *
 * Renders a button to clear selections.
 * @param {ClearSelectionsBtnProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function ClearSelectionsBtn(props: ClearSelectionsBtnProps): JSX.Element {
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
