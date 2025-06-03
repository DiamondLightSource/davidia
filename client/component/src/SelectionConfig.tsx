import Modeless from './Modeless';
import { getSelectionLabel } from './selections/utils';
import AxialSelection from './selections/AxialSelection';
import RectangularSelection from './selections/RectangularSelection';
import LinearSelection from './selections/LinearSelection';
import AxialSelectionConfig from './AxialSelectionConfig';
import LinearSelectionConfig from './LinearSelectionConfig';
import RectangularSelectionConfig from './RectangularSelectionConfig';
import { Fragment, useCallback, useState, useEffect } from 'react';
import { HexColorPicker as Picker } from 'react-colorful';
import styles from './SelectionConfig.module.css';
import { Btn, type CustomDomain, type Domain } from '@h5web/lib';
import { isValidPositiveNumber } from './utils';
import LabelledInput from './LabelledInput';
import PolygonalSelection from './selections/PolygonalSelection';
import PolygonalSelectionConfig from './PolygonalSelectionConfig';
import type { IIconType } from './Modal';
import type { SelectionHandler, SelectionBase } from './selections/utils';
import { JSX } from 'react/jsx-runtime';

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
  selections: SelectionBase[];
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

  const [currentSelection, setCurrentSelection] =
    useState<SelectionBase | null>(null);

  useEffect(() => {
    if (selections.length > 0) {
      const select =
        selections.find((s) => s.id === currentSelectionID) ?? selections[0];
      setCurrentSelection(select);
    }
  }, [currentSelectionID, selections]);

  /**
   * Handle deletion of a selection.
   */
  const handleDeleteSelection = useCallback(() => {
    if (currentSelectionID) {
      const selection = selections.find((s) => s.id === currentSelectionID);
      if (selection) {
        let lastSelection: SelectionBase | undefined;
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
          updateSelection(selection, false, true);
        }
        if (lastSelection) {
          updateCurrentSelectionID(lastSelection.id);
        }
      }
    }
  }, [
    currentSelectionID,
    selections,
    updateCurrentSelectionID,
    updateSelection,
  ]);

  const modeless: JSX.Element[] = [];
  modeless.push(
    <h4 key={`ID${currentSelectionID}`}>
      {getSelectionLabel(currentSelection, SELECTION_ICONS)}
    </h4>
  );
  if (currentSelection !== null) {
    const cSelection: SelectionBase = currentSelection;

    modeless.push(
      <Fragment key="colour">
        <div
          key={`Colour${currentSelection.colour}`}
          className={styles.colourLabel}
          style={{ borderLeftColor: currentSelection.colour }}
        >
          {currentSelection.colour}
        </div>
        <br key="colour spacer" />
        {hasBaton && (
          <Picker
            key={`Picker${currentSelection.colour}`}
            color={currentSelection.colour}
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
    const disabled = !hasBaton;
    modeless.push(
      <LabelledInput<string>
        key={`Name${currentSelection.name}`}
        label="name"
        input={currentSelection.name}
        updateValue={(n: string) => {
          cSelection.name = n;
          if (updateSelection) {
            updateSelection(cSelection);
          }
        }}
        disabled={disabled}
      />
    );
    modeless.push(
      <LabelledInput<number>
        key={`Alpha${currentSelection.alpha}`}
        label="alpha"
        input={currentSelection.alpha}
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
        disabled={disabled}
      />
    );
    if (AxialSelection.isShape(cSelection)) {
      modeless.push(
        AxialSelectionConfig({
          selection: cSelection,
          updateSelection,
          disabled,
        })
      );
    } else if (LinearSelection.isShape(cSelection)) {
      modeless.push(
        LinearSelectionConfig({
          selection: cSelection,
          updateSelection,
          disabled,
        })
      );
    } else if (RectangularSelection.isShape(cSelection)) {
      modeless.push(
        RectangularSelectionConfig({
          selection: cSelection,
          updateSelection,
          disabled,
        })
      );
    } else if (PolygonalSelection.isShape(cSelection)) {
      modeless.push(
        PolygonalSelectionConfig({
          selection: cSelection,
          updateSelection,
          disabled,
        })
      );
    }

    modeless.push(
      <Btn
        key="clear selection"
        label="Clear Selection"
        disabled={disabled}
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
