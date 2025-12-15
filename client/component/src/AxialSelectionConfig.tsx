import LabelledInput from './LabelledInput';
import { isNumber } from './utils';
import type AxialSelection from './selections/AxialSelection';
import { XInput, YInput } from './SelectionConfigComponents';
import { Fragment } from 'react';
import type { SelectionHandler } from './selections/utils';

/**
 * Props for the `AxialSelectionConfig` component.
 */

interface AxialSelectionConfigProps {
  /** The axial selection to configure */
  selection: AxialSelection;
  /** The function to call to update the selections state */
  updateSelection?: SelectionHandler;
  /** Indicates whether the component is disabled (optional) */
  disabled?: boolean;
}

/**
 * Renders the configuration options for an axial selection.
 * @param {AxialSelectionConfigProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function AxialSelectionConfig(props: AxialSelectionConfigProps) {
  const { selection, updateSelection, disabled } = props;

  return selection.dimension === 0 ? (
    <Fragment key="axis x">
      <XInput
        key={`XInput${selection._vStart.x}`}
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />
      <LabelledInput<number>
        key={`XLength${selection.length}`}
        label="x length"
        input={selection.length}
        updateValue={(l: number) => {
          selection.length = l;
          if (updateSelection) {
            updateSelection(selection);
          }
        }}
        decimalPlaces={8}
        isValid={(v) => isNumber(v)}
        disabled={disabled}
      />
    </Fragment>
  ) : (
    <Fragment key="axis y">
      <YInput
        key={`YInput${selection._vStart.y}`}
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />
      <LabelledInput<number>
        key={`YLength${selection.length}`}
        label="y length"
        input={selection.length}
        updateValue={(l: number) => {
          selection.length = l;
          if (updateSelection) {
            updateSelection(selection);
          }
        }}
        decimalPlaces={8}
        isValid={(v) => isNumber(v)}
        disabled={disabled}
      />
    </Fragment>
  );
}

export type { AxialSelectionConfigProps };
export default AxialSelectionConfig;
