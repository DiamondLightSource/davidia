import { ComponentType, SVGAttributes } from 'react';
import { Modeless } from './Modeless';
import BaseSelection from './selections/BaseSelection';
import { getSelectionLabel } from './selections/utils';
import AxisSelection from './selections/AxisSelection';
import RectangularSelection from './selections/RectangularSelection';
import LinearSelection from './selections/LinearSelection';
import { AxisSelectionConfig } from './AxisSelectionConfig';
import { LinearSelectionConfig } from './LinearSelectionConfig';
import { RectangularSelectionConfig } from './RectangularSelectionConfig';
import { Fragment } from 'react';
import { HexColorPicker as Picker } from 'react-colorful';
import styles from './SelectionConfig.module.css';
import { Btn, CustomDomain, Domain } from '@h5web/lib';
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
  horizontalAxis: '\u2194',
  verticalAxis: '\u2195',
  unknown: ' ',
};

interface SelectionConfigProps {
  title: string;
  selections: BaseSelection[];
  updateSelections: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
  currentSelectionID: string | null;
  updateCurrentSelectionID: (s: string | null) => void;
  showSelectionConfig: boolean;
  updateShowSelectionConfig: (s: boolean) => void;
  hasBaton: boolean;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  label?: string;
  domain?: Domain;
  customDomain?: CustomDomain;
}

function SelectionConfig(props: SelectionConfigProps) {
  const {
    currentSelectionID,
    updateCurrentSelectionID,
    selections,
    updateSelections,
    hasBaton,
  } = props;
  let currentSelection: BaseSelection | null = null;
  if (selections.length > 0) {
    currentSelection =
      selections.find((s) => s.id === currentSelectionID) ?? selections[0];
  }

  function handleDeleteSelection() {
    if (currentSelectionID) {
      const selection = selections.find((s) => s.id === currentSelectionID);
      if (selection) {
        let lastSelection: BaseSelection | undefined;
        if (!Object.hasOwn(selections, 'findLast')) {
          // workaround missing method
          const oSelections = selections.filter(
            (s) => s.id !== currentSelectionID
          );
          const last = oSelections.length - 1;
          if (last >= 0) {
            lastSelection = oSelections[last];
          }
        } else {
          lastSelection = selections.findLast(
            (s) => s.id !== currentSelectionID
          );
        }
        updateSelections(selection, true, true);
        if (lastSelection) {
          updateCurrentSelectionID(lastSelection.id);
        }
      }
    }
  }

  const modeless = [];
  modeless.push(
    <h4 key="Selection">
      {getSelectionLabel(currentSelection, SELECTION_ICONS)}
    </h4>
  );
  if (currentSelection !== null) {
    const cSelection: BaseSelection = currentSelection;
    const colour = (cSelection.colour ??
      ('defaultColour' in cSelection
        ? cSelection.defaultColour
        : '#000000')) as string;

    modeless.push(
      <Fragment key="colour">
        <div
          key="colour text"
          className={styles.colourLabel}
          style={{ borderLeftColor: colour }}
        >
          {colour}
        </div>
        <br key="colour spacer" />
        {hasBaton && (
          <Picker
            key="colour picker"
            color={colour}
            onChange={(c: string) => {
              cSelection.colour = c;
              updateSelections(cSelection);
            }}
          />
        )}
      </Fragment>
    );
    modeless.push(
      <LabelledInput<string>
        key="name"
        label="name"
        input={cSelection.name}
        updateValue={(n: string) => {
          cSelection.name = n;
          updateSelections(cSelection);
        }}
        disabled={!hasBaton}
      />
    );
    modeless.push(
      <LabelledInput<number>
        key="alpha"
        label="alpha"
        input={cSelection.alpha}
        updateValue={(a: number) => {
          if (a <= 1 && a >= 0) {
            cSelection.alpha = a;
            updateSelections(cSelection);
          }
        }}
        decimalPlaces={2}
        isValid={(v) => isValidPositiveNumber(v, 1, true)}
        disabled={!hasBaton}
      />
    );
    if (AxisSelection.isShape(cSelection as SelectionBase)) {
      modeless.push(
        AxisSelectionConfig({
          selection: cSelection as AxisSelection,
          updateSelections,
          disabled: !hasBaton,
        })
      );
    } else if (LinearSelection.isShape(cSelection as SelectionBase)) {
      modeless.push(
        LinearSelectionConfig({
          selection: cSelection as LinearSelection,
          updateSelections,
          disabled: !hasBaton,
        })
      );
    } else if (RectangularSelection.isShape(cSelection as SelectionBase)) {
      modeless.push(
        RectangularSelectionConfig({
          selection: cSelection as RectangularSelection,
          updateSelections,
          disabled: !hasBaton,
        })
      );
    }
    modeless.push(
      <Btn
        key="clear selection"
        label="Clear Selection"
        disabled={!hasBaton}
        onClick={() => {
          if (window.confirm('Clear selection?')) {
            handleDeleteSelection();
          }
        }}
      />
    );
  }

  return Modeless({
    title: props.title,
    showModeless: props.showSelectionConfig,
    setShowModeless: props.updateShowSelectionConfig,
    children: modeless,
  });
}

export { SelectionConfig };
