import Modeless from './Modeless';
import type BaseSelection from './selections/BaseSelection';
import { getSelectionLabel } from './selections/utils';
import AxialSelection from './selections/AxialSelection';
import RectangularSelection from './selections/RectangularSelection';
import LinearSelection from './selections/LinearSelection';
import AxialSelectionConfig from './AxialSelectionConfig';
import LinearSelectionConfig from './LinearSelectionConfig';
import RectangularSelectionConfig from './RectangularSelectionConfig';
import { Fragment } from 'react';
import { HexColorPicker as Picker } from 'react-colorful';
import styles from './SelectionConfig.module.css';
import { Btn, type CustomDomain, type Domain } from '@h5web/lib';
import { isValidPositiveNumber } from './utils';
import LabelledInput from './LabelledInput';
import PolygonalSelection from './selections/PolygonalSelection';
import PolygonalSelectionConfig from './PolygonalSelectionConfig';
import type { IIconType } from './Modal';
import type { SelectionHandler, SelectionBase } from './selections/utils';

// eslint-disable-next-line react-refresh/only-export-components
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

/**
 * Props for the `SelectionConfig` component.
 */
interface SelectionConfigProps {
  /** The current selections */
  selections: BaseSelection[];
  /** Handles updating selection */
  updateSelection?: SelectionHandler;
  /** The ID of the current selection (optional) */
  currentSelectionID: string | null;
  /** Handles updating current selection ID */
  updateCurrentSelectionID: (s: string | null) => void;
  /** If the selection config is shown */
  showSelectionConfig: boolean;
  /** Handles updating showSelectionConfig */
  updateShowSelectionConfig: (s: boolean) => void;
  /** If has control of the baton */
  hasBaton: boolean;
  /** The icon (optional) */
  icon?: IIconType;
  /** The label (optional) */
  label?: string;
  /** The data domain (optional) */
  domain?: Domain;
  /** The custom data domain (optional) */
  customDomain?: CustomDomain;
}

/**
 * Render the configuration options for a selection.
 * @param {SelectionConfigProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function SelectionConfig(props: SelectionConfigProps) {
  const {
    currentSelectionID,
    updateCurrentSelectionID,
    selections,
    updateSelection,
    hasBaton,
  } = props;
  let currentSelection: BaseSelection | null = null;
  if (selections.length > 0) {
    currentSelection =
      selections.find((s) => s.id === currentSelectionID) ?? selections[0];
  }

  /**
   * Handle deletion of a selection.
   */
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
        if (updateSelection) {
          updateSelection(selection, true, true);
        }
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
              if (updateSelection) {
                updateSelection(cSelection);
              }
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
          if (updateSelection) {
            updateSelection(cSelection);
          }
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
            if (updateSelection) {
              updateSelection(cSelection);
            }
          }
        }}
        decimalPlaces={2}
        isValid={(v) => isValidPositiveNumber(v, 1, true)}
        disabled={!hasBaton}
      />
    );
    if (AxialSelection.isShape(cSelection as SelectionBase)) {
      modeless.push(
        AxialSelectionConfig({
          selection: cSelection as AxialSelection,
          updateSelection,
          disabled: !hasBaton,
        })
      );
    } else if (LinearSelection.isShape(cSelection as SelectionBase)) {
      modeless.push(
        LinearSelectionConfig({
          selection: cSelection as LinearSelection,
          updateSelection,
          disabled: !hasBaton,
        })
      );
    } else if (RectangularSelection.isShape(cSelection as SelectionBase)) {
      modeless.push(
        RectangularSelectionConfig({
          selection: cSelection as RectangularSelection,
          updateSelection,
          disabled: !hasBaton,
        })
      );
    } else if (PolygonalSelection.isShape(cSelection as SelectionBase)) {
      modeless.push(
        PolygonalSelectionConfig({
          selection: cSelection as PolygonalSelection,
          updateSelection,
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
    title: 'Selections',
    showModeless: props.showSelectionConfig,
    setShowModeless: props.updateShowSelectionConfig,
    children: modeless,
  });
}

export default SelectionConfig;
export type { SelectionConfigProps };
