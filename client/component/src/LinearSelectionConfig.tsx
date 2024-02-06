import type LinearSelection from './selections/LinearSelection';
import { AngleInput, XInput, YInput } from './selection-components/SelectionConfigComponents';
import { Fragment } from 'react';
import LabelledInput from './LabelledInput';
import { isNumber } from './utils';
import type { SelectionBase } from './selections/utils';

/**
 * The props for the `LinearSelectionConfig` component.
 * @interface {object} LinearSelectionConfigProps
 * @member {LinearSelection} selection - The linear selection to configure.
 * @member {(s: SelectionBase | null, b?: boolean, c?: boolean) => void} updateSelection - Handle updating selection.
 * @member {boolean} [disabled] - If input is diabled.
 */
interface LinearSelectionConfigProps {
  /** The linear selection to configure */
  selection: LinearSelection;
  /** Handle updating selection */
  updateSelection: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
  /** If input is disabled (optional) */
  disabled?: boolean;
}

/**
 *
 * Renders the configuration options for a linear selection.
 * @param {LinearSelectionConfigProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function LinearSelectionConfig(props: LinearSelectionConfigProps) {
  const { selection, updateSelection, disabled } = props;

  return (
    <Fragment key="line">
      <XInput
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />

      <YInput
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />

      <AngleInput
        selection={selection}
        updateSelection={updateSelection}
        disabled={disabled}
      />

      <LabelledInput<number>
        key="length"
        label="length"
        input={selection.length}
        updateValue={(l: number) => {
          selection.length = l;
          updateSelection(selection);
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
