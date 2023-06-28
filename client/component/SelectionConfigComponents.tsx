import { Fragment } from 'react';
import { HexColorPicker as Picker } from 'react-colorful';
import BaseSelection from './selections/BaseSelection';
import styles from './SelectionConfig.module.css';
import { Btn } from '@h5web/lib';
import OrientableSelection from './selections/OrientableSelection';
import { isNumber, isValidPositiveNumber } from './utils';
import { LabelledInput } from './LabelledInput';

interface ColourPickerProps {
  selection: BaseSelection;
  updateSelections: (s: SelectionBase | null, b?: boolean, d?: boolean) => void;
}

function ColourPicker(props: ColourPickerProps) {
  return (
    <Fragment key="colour">
      <div
        className={styles.colourLabel}
        style={{ borderLeftColor: props.selection.colour ?? '#000000' }}
      >
        Selected color is {props.selection.colour ?? '#000000'}
      </div>
      <br />
      <Picker
        key="colour picker"
        color={props.selection.colour ?? '#000000'}
        onChange={(c: string) => {
          props.selection.colour = c;
          props.updateSelections(props.selection);
        }}
      />
    </Fragment>
  );
}

interface ClearSelectionBtnProps {
  handleDeleteSelection: () => void;
}
function ClearSelectionBtn(props: ClearSelectionBtnProps) {
  return (
    <Btn
      label="Clear Selection"
      onClick={() => {
        if (window.confirm('Clear selection?')) {
          props.handleDeleteSelection();
        }
      }}
    ></Btn>
  );
}

interface AngleInputProps {
  selection: OrientableSelection;
  updateSelections: (s: BaseSelection) => void;
}
function AngleInput(props: AngleInputProps) {
  return (
    <LabelledInput<number>
      key="angle"
      label="angle"
      input={props.selection.angle.toFixed(5)}
      updateValue={(a: number) => {
        const radians = a * (Math.PI / 180);
        props.selection.angle = radians;
        props.updateSelections(props.selection);
      }}
      isValid={(v) => isNumber(v)}
    />
  );
}

interface AlphaInputProps {
  selection: BaseSelection;
  updateSelections: (s: BaseSelection) => void;
}
function AlphaInput(props: AlphaInputProps) {
  return (
    <LabelledInput<number>
      key="alpha"
      label="alpha"
      input={props.selection.alpha.toFixed(5)}
      updateValue={(a: number) => {
        if (a <= 1 && a >= 0) {
          props.selection.alpha = a;
          props.updateSelections(props.selection);
        }
      }}
      isValid={(v) => isValidPositiveNumber(v, 1)}
    />
  );
}

interface NameInputProps {
  selection: BaseSelection;
  updateSelections: (s: BaseSelection) => void;
}
function NameInput(props: NameInputProps) {
  return (
    <LabelledInput<string>
      key="name"
      label="name"
      input={props.selection.name}
      updateValue={(n: string) => {
        props.selection.name = n;
        props.updateSelections(props.selection);
      }}
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
      input={props.selection.vStart.x.toFixed(5)}
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
      input={props.selection.vStart.y.toFixed(5)}
      updateValue={(y: number) => {
        props.selection.vStart.y = y;
        props.updateSelections(props.selection);
      }}
      isValid={(v) => isNumber(v)}
    />
  );
}

export {
  AlphaInput,
  AngleInput,
  ClearSelectionBtn,
  ColourPicker,
  NameInput,
  XInput,
  YInput,
};
