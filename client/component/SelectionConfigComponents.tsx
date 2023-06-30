import BaseSelection from './selections/BaseSelection';
import OrientableSelection from './selections/OrientableSelection';
import { isNumber } from './utils';
import { LabelledInput } from './LabelledInput';

interface AngleInputProps {
  selection: OrientableSelection;
  updateSelections: (s: BaseSelection) => void;
}

function AngleInput(props: AngleInputProps) {
  const { selection, updateSelections } = props;

  return (
    <LabelledInput<number>
      key="angle"
      label="angle"
      input={selection.angle}
      decimalPlaces={5}
      updateValue={(a: number) => {
        const radians = a * (Math.PI / 180);
        selection.angle = radians;
        updateSelections(selection);
      }}
      isValid={(v) => isNumber(v)}
    />
  );
}

interface XInputProps {
  selection: BaseSelection;
  updateSelections: (s: BaseSelection) => void;
}

function XInput(props: XInputProps) {
  const { selection, updateSelections } = props;

  return (
    <LabelledInput<number>
      key="x"
      label="x"
      input={selection.vStart.x}
      decimalPlaces={8}
      updateValue={(x: number) => {
        selection.start[0] = x;
        selection.vStart.x = x;
        updateSelections(selection);
      }}
      isValid={(v) => isNumber(v)}
    />
  );
}

interface YInputProps {
  selection: BaseSelection;
  updateSelections: (s: BaseSelection) => void;
}

function YInput(props: YInputProps) {
  const { selection, updateSelections } = props;

  return (
    <LabelledInput<number>
      key="y"
      label="y"
      input={selection.vStart.y}
      decimalPlaces={8}
      updateValue={(y: number) => {
        selection.start[1] = y;
        selection.vStart.y = y;
        updateSelections(selection);
      }}
      isValid={(v) => isNumber(v)}
    />
  );
}

export { AngleInput, XInput, YInput };
