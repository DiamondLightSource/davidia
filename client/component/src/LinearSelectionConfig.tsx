import type LinearSelection from './selections/LinearSelection';
import { AngleInput, XInput, YInput } from './SelectionConfigComponents';
import { Fragment } from 'react';
import LabelledInput from './LabelledInput';
import { isNumber } from './utils';
import type { SelectionHandler } from './selections/utils';

/**
 * Props for the `LinearSelectionConfig` component.
 */
interface LinearSelectionConfigProps {
  /** The linear selection to configure */
  selection: LinearSelection;
  /** Handle updating selection */
  updateSelection?: SelectionHandler;
  /** If input is disabled (optional) */
  disabled?: boolean;
}

/**
 * Render the configuration options for a linear selection.
 * @param {LinearSelectionConfigProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function LinearSelectionConfig(props: LinearSelectionConfigProps) {
  const { selection, updateSelection, disabled } = props;

  return (
    <Fragment key="line">
      <XInput
        key={`XInput${selection.vStart.x}`}
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />

      <YInput
        key={`YInput${selection.vStart.y}`}
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
        key={`Length${selection.length}`}
        label="length"
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

export default LinearSelectionConfig;
export type { LinearSelectionConfigProps };
