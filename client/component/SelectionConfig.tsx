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
import { ClearSelectionBtn } from './SelectionConfigComponents';

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

export function SelectionConfig(props: SelectionConfigProps) {
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

  if (
    currentSelection &&
    LinearSelection.isShape(currentSelection as SelectionBase)
  ) {
    modeless.push(
      LinearSelectionConfig({
        selection: currentSelection as LinearSelection,
        updateSelections: props.updateSelections,
      })
    );
  } else if (
    currentSelection &&
    RectangularSelection.isShape(currentSelection as SelectionBase)
  ) {
    modeless.push(
      RectangularSelectionConfig({
        selection: currentSelection as RectangularSelection,
        updateSelections: props.updateSelections,
      })
    );
  } else if (
    currentSelection &&
    HorizontalAxisSelection.isShape(currentSelection as SelectionBase)
  ) {
    modeless.push(
      HorizontalAxisSelectionConfig({
        selection: currentSelection as HorizontalAxisSelection,
        updateSelections: props.updateSelections,
      })
    );
  } else if (
    currentSelection &&
    VerticalAxisSelection.isShape(currentSelection as SelectionBase)
  ) {
    modeless.push(
      VerticalAxisSelectionConfig({
        selection: currentSelection as VerticalAxisSelection,
        updateSelections: props.updateSelections,
      })
    );
  } else {
    modeless.push(
      <h4 key="Selection">
        {' '}
        {getSelectionLabel(currentSelection, SELECTION_ICONS)}{' '}
      </h4>
    );
  }
  if (currentSelection) {
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
