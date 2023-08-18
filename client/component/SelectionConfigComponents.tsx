import BaseSelection from './selections/BaseSelection';
import OrientableSelection from './selections/OrientableSelection';
import { isNumber } from './utils';
import { LabelledInput } from './LabelledInput';

interface AngleInputProps {
  selection: OrientableSelection;
  updateSelection: (s: BaseSelection) => void;
  disabled?: boolean;
}

function AngleInput(props: AngleInputProps) {
  const { selection, updateSelection, disabled } = props;

  return (
    <LabelledInput<number>
      key="angle"
      label="angle"
      input={selection.angle}
      decimalPlaces={5}
      updateValue={(a: number) => {
        const radians = a * (Math.PI / 180);
        selection.angle = radians;
        updateSelection(selection);
      }}
      isValid={(v) => isNumber(v)}
      disabled={disabled}
    />
  );
}

interface XInputProps {
  selection: BaseSelection;
  updateSelection: (s: BaseSelection) => void;
  disabled?: boolean;
}

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

interface YInputProps {
  selection: BaseSelection;
  updateSelection: (s: BaseSelection) => void;
  disabled?: boolean;
}

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

interface PointInputProps {
  i: number;
  point: [number, number];
  updatePoint: (p: [number, number]) => void;
  disabled?: boolean;
}

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
