import { ComponentType, SVGAttributes } from 'react';
import { Modeless } from './Modeless';
import BaseSelection from './selections/BaseSelection';
import { getSelectionLabel } from './selections/utils';
import HorizontalAxisSelection from './selections/HorizontalAxisSelection';
import VerticalAxisSelection from './selections/VerticalAxisSelection';
import RectangularSelection from './selections/RectangularSelection';
import LinearSelection from './selections/LinearSelection';
import { HorizontalAxisSelectionConfig } from './HorizontalAxisSelectionConfig';
import { LinearSelectionConfig } from './LinearSelectionConfig';
import { RectangularSelectionConfig } from './RectangularSelectionConfig';
import { VerticalAxisSelectionConfig } from './VerticalAxisSelectionConfig';
import { Fragment } from 'react';
import { HexColorPicker as Picker } from 'react-colorful';
import styles from './SelectionConfig.module.css';
import { Btn } from '@h5web/lib';
import { isValidPositiveNumber } from './utils';
import { LabelledInput } from './LabelledInput';

export const SELECTION_ICONS = {
  line: '\u2014',
  rectangle: '\u25ad',
  polyline: '\u299a',
  polygon: '\u2b21',
  circle: '\u25cb',
  ellipse: '\u2b2d',
  sector: '\u25d4',
  horizontalAxis: '\u21a6',
  verticalAxis: '\u21a5',
  unknown: ' ',
};

interface AlphaInputProps {
  selection: BaseSelection;
  updateSelections: (s: BaseSelection) => void;
}
function AlphaInput(props: AlphaInputProps) {
  return (
    <LabelledInput<number>
      key="alpha"
      label="alpha"
      input={props.selection.alpha}
      updateValue={(a: number) => {
        if (a <= 1 && a >= 0) {
          props.selection.alpha = a;
          props.updateSelections(props.selection);
        }
      }}
      decimalPlaces={2}
      isValid={(v) => isValidPositiveNumber(v, 1, true)}
    />
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
        {props.selection.colour ?? '#000000'}
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

interface SelectionConfigProps {
  title: string;
  selections: BaseSelection[];
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
  currentSelectionID: string | null;
  updateCurrentSelectionID: (s: string | null) => void;
  showSelectionConfig: boolean;
  updateShowSelectionConfig: (s: boolean) => void;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  label?: string;
  domain?: Domain;
  customDomain?: Domain;
}

function SelectionConfig(props: SelectionConfigProps) {
  let currentSelection: BaseSelection | null = null;
  if (props.selections.length > 0) {
    currentSelection =
      props.selections.find((s) => s.id === props.currentSelectionID) ??
      props.selections[0];
  }

  function handleDeleteSelection() {
    if (props.currentSelectionID) {
      const selection = props.selections.find(
        (s) => s.id === props.currentSelectionID
      );
      if (selection) {
        const lastSelection = props.selections.findLast(
          (s) => s.id !== props.currentSelectionID
        );
        props.updateSelections(selection, true, true);
        if (lastSelection) {
          props.updateCurrentSelectionID(lastSelection.id);
        }
      }
    }
  }

  const modeless = [];
  modeless.push(
    <h4 key="Selection">
      {' '}
      {getSelectionLabel(currentSelection, SELECTION_ICONS)}{' '}
    </h4>
  );
  if (currentSelection) {
    modeless.push(
      <ColourPicker
        selection={currentSelection}
        updateSelections={props.updateSelections}
      />
    );
    modeless.push(
      <NameInput
        selection={currentSelection}
        updateSelections={props.updateSelections}
      />
    );
    modeless.push(
      <AlphaInput
        selection={currentSelection}
        updateSelections={props.updateSelections}
      />
    );
    if (LinearSelection.isShape(currentSelection as SelectionBase)) {
      modeless.push(
        LinearSelectionConfig({
          selection: currentSelection as LinearSelection,
          updateSelections: props.updateSelections,
        })
      );
    } else if (
      RectangularSelection.isShape(currentSelection as SelectionBase)
    ) {
      modeless.push(
        RectangularSelectionConfig({
          selection: currentSelection as RectangularSelection,
          updateSelections: props.updateSelections,
        })
      );
    } else if (
      HorizontalAxisSelection.isShape(currentSelection as SelectionBase)
    ) {
      modeless.push(
        HorizontalAxisSelectionConfig({
          selection: currentSelection as HorizontalAxisSelection,
          updateSelections: props.updateSelections,
        })
      );
    } else if (
      VerticalAxisSelection.isShape(currentSelection as SelectionBase)
    ) {
      modeless.push(
        VerticalAxisSelectionConfig({
          selection: currentSelection as VerticalAxisSelection,
          updateSelections: props.updateSelections,
        })
      );
    }
    modeless.push(
      <ClearSelectionBtn handleDeleteSelection={handleDeleteSelection} />
    );
  }
  return Modeless({
    title: props.title,
    showModeless: props.showSelectionConfig,
    setShowModeless: props.updateShowSelectionConfig,
    children: modeless,
  });
}

export { AlphaInput, ColourPicker, NameInput, SelectionConfig };
