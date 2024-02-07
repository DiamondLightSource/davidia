import type BaseSelection from './BaseSelection';
import type OrientableSelection from '../specific-selections/OrientableSelection';
import { isNumber } from '../utils';
import LabelledInput from '../small-components/LabelledInput';

/**
 *
 * The props for the `AngleInput` component.
 * @interface AngleInputProps
 * @member {OrientableSelection} selection - The selection for which the angle is being configured.
 * @member {(s: OrientableSelection) => void} updateSelection - Function to handle updating angle of selection.
 * @member {boolean} [disabled] - If input component is disabled.
 */
interface AngleInputProps {
  selection: OrientableSelection;
  updateSelection: (s: OrientableSelection) => void;
  disabled?: boolean;
}

/**
 *
 * Renders a labelled input for angle.
 * @param {AngleInputProps} props - The component props.
 * @returns {JSX.Element<T>} The rendered component.
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
        updateSelection(selection);
      }}
      isValid={(v) => isNumber(v)}
      disabled={disabled}
    />
  );
}

/*
 *
 * The props for the `XInput` component.
 * @interface XInputProps
 * @member {BaseSelection} selection - The selection for which the x values is being configured.
 * @member {(s: BaseSelection) => void} updateSelection - Function to handle updating x of selection.
 * @member {boolean} [disabled] - If input component is disabled.
 */
interface XInputProps {
  selection: BaseSelection;
  updateSelection: (s: BaseSelection) => void;
  disabled?: boolean;
}

/**
 *
 * Renders a labelled inout for x.
 * @param {XInputProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function XInput(props: XInputProps) {
  const { selection, updateSelection, disabled } = props;

  return (
    <LabelledInput<number>
      key="x"
      label="x"
      input={selection.vStart.x}
      decimalPlaces={8}
      updateValue={(x: number) => {
        selection.start[0] = x;
        selection.vStart.x = x;
        updateSelection(selection);
      }}
      isValid={(v) => isNumber(v)}
      disabled={disabled}
    />
  );
}

/**
 *
 * The props for the `YInput` component.
 * @interface YInputProps
 * @member {BaseSelection} selection - The selection for which the y values are being configured.
 * @member {(s: BaseSelection) => void} updateSelection - Function to handle updating y of selection.
 * @member {boolean} [disabled] - If input component is disabled.
 */
interface YInputProps {
  /** The selection for which the y values are being configured */
  selection: BaseSelection;
  /** Function to handle updating y of selection */
  updateSelection: (s: BaseSelection) => void;
  /** If input component is disabled (optional) */
  disabled?: boolean;
}

/**
 *
 * Renders a labelled input for y.
 * @param {YInputProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function YInput(props: YInputProps) {
  const { selection, updateSelection, disabled } = props;

  return (
    <LabelledInput<number>
      key="y"
      label="y"
      input={selection.vStart.y}
      decimalPlaces={8}
      updateValue={(y: number) => {
        selection.start[1] = y;
        selection.vStart.y = y;
        updateSelection(selection);
      }}
      isValid={(v) => isNumber(v)}
      disabled={disabled}
    />
  );
}

/**
 *
 * The props for the `PointInput` component.
 * @interface PointInputProps
 * @member {number} i - The point number.
 * @member {[number, number]} point - The coordinates of the point.
 * @member {(p: [number, number]) => void} updatePoint - Function to handle updating of point.
 * @member {boolean} [disabled] - If input component is disabled.
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
 *
 * Renders a labelled input for point x.
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
 *
 * Renders a labelled input for point y.
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
