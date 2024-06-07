import LabelledInput from './LabelledInput';
import { isNumber } from './utils';
import type AxialSelection from './selections/AxialSelection';
import { XInput, YInput } from './SelectionConfigComponents';
import { Fragment } from 'react';
import type { AddSelectionHandler } from './selections/utils';

/**
 * Props for the `AxialSelectionConfig` component.
 */

interface AxialSelectionConfigProps {
  /** The axial selection to configure */
  selection: AxialSelection;
  /** The function to call to update the selections state */
  updateSelection?: AddSelectionHandler;
  /** Indicates whether the component is disabled (optional) */
  disabled?: boolean;
}

/**
 * Renders the configuration options for an axial selection.
 * @param {AxialSelectionConfigProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function AxialSelectionConfig(props: AxialSelectionConfigProps) {
  const { selection, updateSelection, disabled } = props;

  return selection.dimension === 0 ? (
    <Fragment key="axis x">
      <XInput selection={selection} updateSelection={updateSelection} />
      <LabelledInput<number>
        key="x length"
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
      <YInput selection={selection} updateSelection={updateSelection} />
      <LabelledInput<number>
        key="y length"
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
