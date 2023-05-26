import { ComponentType, SVGAttributes } from 'react';
import { HexColorPicker as Picker } from 'react-colorful';
import { Modeless } from './Modeless';
import { LabelledInput } from './LabelledInput';
import { getSelectionLabel, BaseSelection } from './selections';
import { isNumber, isValidPositiveNumber } from './utils';
import styles from './SelectionConfig.module.css';

export const SELECTION_ICONS = {
  line: '\u2014',
  rectangle: '\u25ad',
  polyline: '\u299a',
  polygon: '\u2b21',
  circle: '\u25cb',
  ellipse: '\u2b2d',
  sector: '\u25d4',
  unknown: ' ',
};

interface SelectionsListModelessProps {
  title: string;
  selections: BaseSelection[];
  updateSelections: (s: SelectionBase) => void;
  currentSelectionID: string | null;
  updateCurrentSelectionID: (s: string | null) => void;
  showSelectionConfig: boolean;
  updateShowSelectionConfig: (s: boolean) => void;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  label?: string;
  domain?: Domain;
  customDomain?: Domain;
}

export function SelectionConfig(props: SelectionsListModelessProps) {
  let currentSelection: BaseSelection | null = null;
  if (props.selections.length > 0) {
    currentSelection =
      props.selections.find((s) => s.id == props.currentSelectionID) ??
      props.selections[0];
  }

  function onSelectionColourChange(c: string) {
    const currentSelection = props.selections.find(
      (s) => s.id == props.currentSelectionID
    );
    if (currentSelection) {
      currentSelection.colour = c;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateName(n: string) {
    const currentSelection = props.selections.find(
      (s) => s.id == props.currentSelectionID
    );
    if (currentSelection) {
      currentSelection.name = n;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection are L74', currentSelection);
    }
  }

  function updateAlpha(a: number) {
    if (a <= 1 && a >= 0) {
      const currentSelection = props.selections.find(
        (s) => s.id == props.currentSelectionID
      );
      if (currentSelection) {
        currentSelection.alpha = a;
        props.updateSelections(currentSelection);
        console.log('selections are ', props.selections);
        console.log('currentSelection are L88', currentSelection);
      }
    }
  }

  function updateXLength(l: number) {
    const currentSelection = props.selections.find(
      (s) => s.id == props.currentSelectionID
    );
    if (currentSelection && 'lengths' in currentSelection) {
      currentSelection.lengths[0] = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection are L102', currentSelection);
    }
  }

  function updateYLength(l: number) {
    const currentSelection = props.selections.find(
      (s) => s.id == props.currentSelectionID
    );
    if (currentSelection && 'lengths' in currentSelection) {
      currentSelection.lengths[1] = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection are L115', currentSelection);
    }
  }

  function updateLength(l: number) {
    const currentSelection = props.selections.find(
      (s) => s.id == props.currentSelectionID
    );
    if (currentSelection && 'length' in currentSelection) {
      currentSelection.length = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection are L127', currentSelection);
    }
  }

  function updateVStartx(a: number) {
    const currentSelection = props.selections.find(
      (s) => s.id == props.currentSelectionID
    );
    if (currentSelection) {
      currentSelection.vStart.x = a;
      console.log('Updated start0 is ', currentSelection.start[0]);
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateVStarty(a: number) {
    const currentSelection = props.selections.find(
      (s) => s.id == props.currentSelectionID
    );
    if (currentSelection) {
      currentSelection.vStart.y = a;
      console.log('Updated start0 is ', currentSelection.start[0]);
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateAngle(a: number) {
    const currentSelection = props.selections.find(
      (s) => s.id == props.currentSelectionID
    );
    if (currentSelection && 'angle' in currentSelection) {
      const radians = a * (Math.PI / 180);
      currentSelection.angle = radians;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  const modeless = [];

  modeless.push(
    <h4>
      {' '}
      {getSelectionLabel(
        props.selections,
        props.currentSelectionID,
        SELECTION_ICONS
      )}{' '}
    </h4>
  );

  if (currentSelection) {
    modeless.push(
      <>
        <div
          className={styles.colourLabel}
          style={{ borderLeftColor: currentSelection.colour ?? '#000000' }}
        >
          Selected color is {currentSelection.colour ?? '#000000'}
        </div>
        <br />
        <Picker
          key="colour picker"
          color={currentSelection.colour ?? '#000000'}
          onChange={onSelectionColourChange}
        />
      </>
    );
    modeless.push(
      <LabelledInput<string>
        key="name"
        label="name"
        input={currentSelection.name}
        updateValue={updateName}
      />
    );
    modeless.push(
      <LabelledInput<number>
        key="alpha"
        label="alpha"
        input={currentSelection.alpha.toFixed(5)}
        updateValue={updateAlpha}
        isValid={(v) => isValidPositiveNumber(v, 1)}
      />
    );
    modeless.push(
      <LabelledInput<number>
        key="x"
        label="x"
        input={currentSelection.vStart.x.toFixed(5)}
        updateValue={updateVStartx}
        isValid={(v) => isNumber(v)}
      />
    );
    modeless.push(
      <LabelledInput<number>
        key="y"
        label="y"
        input={currentSelection.vStart.y.toFixed(5)}
        updateValue={updateVStarty}
        isValid={(v) => isNumber(v)}
      />
    );

    if ('angle' in currentSelection) {
      modeless.push(
        <LabelledInput<number>
          key="angle"
          label="angle"
          input={(currentSelection.angle as number).toFixed(5)}
          updateValue={updateAngle}
          isValid={(v) => isNumber(v)}
        />
      );
    }

    if ('length' in currentSelection) {
      modeless.push(
        <LabelledInput<number>
          key="length"
          label="length"
          input={(currentSelection.length as number).toFixed(5)}
          updateValue={updateLength}
          isValid={(v) => isNumber(v)}
        />
      );
    }

    if ('lengths' in currentSelection) {
      modeless.push(
        <LabelledInput<number>
          key="x length"
          label="x length"
          input={(currentSelection.lengths[0] as number).toFixed(5)}
          updateValue={updateXLength}
          isValid={(v) => isNumber(v)}
        />
      );
      modeless.push(
        <LabelledInput<number>
          key="y length"
          label="y length"
          input={(currentSelection.lengths[1] as number).toFixed(5)}
          updateValue={updateYLength}
          isValid={(v) => isNumber(v)}
        />
      );
    }
  }

  return Modeless({
    title: props.title,
    showModeless: props.showSelectionConfig,
    setShowModeless: props.updateShowSelectionConfig,
    children: <>{modeless}</>,
  });
}
