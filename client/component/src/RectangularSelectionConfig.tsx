import LabelledInput from './LabelledInput';
import { isNumber } from './utils';
import type RectangularSelection from './selections/RectangularSelection';
import { AngleInput, XInput, YInput } from './SelectionConfigComponents';
import { Fragment } from 'react';
import type { SelectionHandler } from './selections/utils';

/**
 * Props for the `RectangularSelectionConfig` component.
 */
interface RectangularSelectionConfigProps {
  /** The rectangular selection to configure */
  selection: RectangularSelection;
  /** Handles update of selection */
  updateSelection?: SelectionHandler;
  /** If disabled */
  disabled?: boolean;
}

/**
 * Render the configuration options for a rectangular selection.
 * @param {RectangularSelectionConfigProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function RectangularSelectionConfig(props: RectangularSelectionConfigProps) {
  const { selection, updateSelection, disabled } = props;

  return (
    <Fragment key="rectangle">
      <XInput
        key={`XInput${selection._vStart.x}`}
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />

      <YInput
        key={`YInput${selection._vStart.y}`}
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />

      <AngleInput
        key={`Angle${selection.angle}`}
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />

      <LabelledInput<number>
        key={`XLength${selection.lengths[0]}`}
        label="x length"
        input={selection.lengths[0]}
        updateValue={(l: number) => {
          selection.lengths[0] = l;
          if (updateSelection) {
            updateSelection(selection);
          }
        }}
        decimalPlaces={8}
        isValid={(v) => isNumber(v)}
        disabled={disabled}
      />

      <LabelledInput<number>
        key={`YLength${selection.lengths[1]}`}
        label="y length"
        input={selection.lengths[1]}
        updateValue={(l: number) => {
          selection.lengths[1] = l;
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

export type { RectangularSelectionConfigProps };
export default RectangularSelectionConfig;
