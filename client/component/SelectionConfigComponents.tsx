import BaseSelection from './selections/BaseSelection';
import OrientableSelection from './selections/OrientableSelection';
import { isNumber } from './utils';
import { LabelledInput } from './LabelledInput';

interface AngleInputProps {
  selection: OrientableSelection;
  updateSelections: (s: BaseSelection) => void;
}
function AngleInput(props: AngleInputProps) {
  return (
    <LabelledInput<number>
      key="angle"
      label="angle"
      input={props.selection.angle}
      decimalPlaces={5}
      updateValue={(a: number) => {
        const radians = a * (Math.PI / 180);
        props.selection.angle = radians;
        props.updateSelections(props.selection);
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
  return (
    <LabelledInput<number>
      key="x"
      label="x"
      input={props.selection.vStart.x}
      decimalPlaces={5}
      updateValue={(x: number) => {
        props.selection.vStart.x = x;
        props.updateSelections(props.selection);
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
  return (
    <LabelledInput<number>
      key="y"
      label="y"
      input={props.selection.vStart.y}
      decimalPlaces={5}
      updateValue={(y: number) => {
        props.selection.vStart.y = y;
        props.updateSelections(props.selection);
      }}
      isValid={(v) => isNumber(v)}
    />
  );
}

export { AngleInput, XInput, YInput };
