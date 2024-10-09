import type OrientableSelection from './selections/OrientableSelection';
import { isNumber } from './utils';
import LabelledInput from './LabelledInput';
import { SelectionBase, SelectionHandler } from './selections/utils';

/**
 * Props for the `AngleInput` component.
 */
interface AngleInputProps {
  /** The selection for which the angle value is being configured */
  selection: OrientableSelection;
  /** Function to handle updating angle of selection */
  updateSelection?: SelectionHandler;
  /** If input component is disabled (optional) */
  disabled?: boolean;
}

/**
 * Render a labelled input for angle.
 * @param {AngleInputProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function AngleInput(props: AngleInputProps) {
  const { selection, updateSelection, disabled } = props;

  return (
    <LabelledInput<number>
      key="angle"
      label="angle"
      input={(selection.angle * 180) / Math.PI}
      decimalPlaces={5}
      updateValue={(a: number) => {
        const radians = a * (Math.PI / 180);
        selection.setAngle(radians);
        if (updateSelection) {
          updateSelection(selection);
        }
      }}
      isValid={(v) => isNumber(v)}
      disabled={disabled}
    />
  );
}

/**
 * Props for `XInput` and `YInput` components.
 */
interface StartInputProps {
  /** The selection for which the start value is being configured */
  selection: SelectionBase;
  /** Function to handle updating start of selection */
  updateSelection?: SelectionHandler;
  /** If input component is disabled (optional) */
  disabled?: boolean;
}

/**
 * Render a labelled inout for x.
 * @param {StartInputProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function XInput(props: StartInputProps) {
  const { selection, updateSelection, disabled } = props;

  return (
    <LabelledInput<number>
      key="x"
      label="x"
      input={selection.start[0]}
      decimalPlaces={8}
      updateValue={(x: number) => {
        selection.setStart(0, x);
        if (updateSelection) {
          updateSelection(selection);
        }
      }}
      isValid={(v) => isNumber(v)}
      disabled={disabled}
    />
  );
}

/**
 * Render a labelled input for y.
 * @param {StartInputProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function YInput(props: StartInputProps) {
  const { selection, updateSelection, disabled } = props;

  return (
    <LabelledInput<number>
      key="y"
      label="y"
      input={selection.start[1]}
      decimalPlaces={8}
      updateValue={(y: number) => {
        selection.setStart(1, y);
        if (updateSelection) {
          updateSelection(selection);
        }
      }}
      isValid={(v) => isNumber(v)}
      disabled={disabled}
    />
  );
}

/**
 * Props for the `PointInput` component.
 */
interface PointInputProps {
  /** The point number */
  i: number;
  /** The coordinates of the point */
  point: [number, number];
  /** Function to handle updating of point */
  updatePoint: (p: [number, number]) => void;
  /** If input component is disabled (optional) */
  disabled?: boolean;
}

/**
 * Render a labelled input for point x.
 * @param {PointInputProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function PointXInput(props: PointInputProps) {
  const { i, point, updatePoint, disabled } = props;
  const label = `x${i}`;

  return (
    <LabelledInput<number>
      key={label}
      label={label}
      input={point[0]}
      decimalPlaces={8}
      updateValue={(x: number) => {
        point[0] = x;
        updatePoint(point);
      }}
      isValid={(v) => isNumber(v)}
      disabled={disabled}
    />
  );
}

/**
 * Render a labelled input for point y.
 * @param {PointInputProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function PointYInput(props: PointInputProps) {
  const { i, point, updatePoint, disabled } = props;
  const label = `y${i}`;

  return (
    <LabelledInput<number>
      key={label}
      label={label}
      input={point[1]}
      decimalPlaces={8}
      updateValue={(y: number) => {
        point[1] = y;
        updatePoint(point);
      }}
      isValid={(v) => isNumber(v)}
      disabled={disabled}
    />
  );
}

export { AngleInput, XInput, YInput, PointXInput, PointYInput };
