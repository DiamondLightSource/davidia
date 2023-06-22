import { ComponentType, Fragment, SVGAttributes } from 'react';
import { HexColorPicker as Picker } from 'react-colorful';
import { Modeless } from './Modeless';
import { LabelledInput } from './LabelledInput';
import BaseSelection from './selections/BaseSelection';
import { getSelectionLabel } from './selections/utils';
import { isNumber, isValidPositiveNumber } from './utils';
import styles from './SelectionConfig.module.css';
import { Btn } from '@h5web/lib';

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

  function onSelectionColourChange(c: string) {
    if (currentSelection) {
      currentSelection.colour = c;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateName(n: string) {
    if (currentSelection) {
      currentSelection.name = n;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log(
        'currentSelection after updating name are ',
        currentSelection
      );
    }
  }

  function updateAlpha(a: number) {
    if (a <= 1 && a >= 0) {
      if (currentSelection) {
        currentSelection.alpha = a;
        props.updateSelections(currentSelection);
        console.log('selections are ', props.selections);
        console.log('currentSelection is ', currentSelection);
      }
    }
  }

  function updateXLength(l: number) {
    if (currentSelection && 'lengths' in currentSelection) {
      currentSelection.lengths[0] = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection is ', currentSelection);
    }
  }

  function updateYLength(l: number) {
    if (currentSelection && 'lengths' in currentSelection) {
      currentSelection.lengths[1] = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection is ', currentSelection);
    }
  }

  function updateXDimension(l: number) {
    if (
      currentSelection &&
      'horizontalAxis' in currentSelection &&
      'dimensionLength' in currentSelection
    ) {
      currentSelection.dimensionLength[0] = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection is ', currentSelection);
    }
  }

  function updateYDimension(l: number) {
    if (
      currentSelection &&
      'verticalAxis' in currentSelection &&
      'dimensionLength' in currentSelection
    ) {
      currentSelection.dimensionLength[1] = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection is ', currentSelection);
    }
  }

  function updateLength(l: number) {
    if (currentSelection && 'length' in currentSelection) {
      currentSelection.length = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection is ', currentSelection);
    }
  }

  function updateVStartx(a: number) {
    if (currentSelection) {
      currentSelection.vStart.x = a;
      console.log('Updated start0 is ', currentSelection.start[0]);
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection is ', currentSelection);
    }
  }

  function updateVStarty(a: number) {
    if (currentSelection) {
      currentSelection.vStart.y = a;
      console.log('Updated start0 is ', currentSelection.start[0]);
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection is ', currentSelection);
    }
  }

  function updateAngle(a: number) {
    if (currentSelection && 'angle' in currentSelection) {
      const radians = a * (Math.PI / 180);
      currentSelection.angle = radians;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
      console.log('currentSelection is ', currentSelection);
    }
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
      {getSelectionLabel(
        props.selections,
        props.currentSelectionID,
        SELECTION_ICONS
      )}{' '}
    </h4>
  );

  if (currentSelection) {
    modeless.push(
      <Fragment key="colour">
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
      </Fragment>
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
    if (!('verticalAxis' in currentSelection)) {
      modeless.push(
        <LabelledInput<number>
          key="x"
          label="x"
          input={currentSelection.vStart.x.toFixed(5)}
          updateValue={updateVStartx}
          isValid={(v) => isNumber(v)}
        />
      );
    }

    if (!('horizontalAxis' in currentSelection)) {
      modeless.push(
        <LabelledInput<number>
          key="y"
          label="y"
          input={currentSelection.vStart.y.toFixed(5)}
          updateValue={updateVStarty}
          isValid={(v) => isNumber(v)}
        />
      );
    }

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

    if ('dimensionLength' in currentSelection) {
      if ('horizontalAxis' in currentSelection) {
        modeless.push(
          <LabelledInput<number>
            key="x length"
            label="x length"
            input={(currentSelection.dimensionLength[0] as number).toFixed(5)}
            updateValue={updateXDimension}
            isValid={(v) => isNumber(v)}
          />
        );
      }
      if ('verticalAxis' in currentSelection) {
        modeless.push(
          <LabelledInput<number>
            key="y length"
            label="y length"
            input={(currentSelection.dimensionLength[1] as number).toFixed(5)}
            updateValue={updateYDimension}
            isValid={(v) => isNumber(v)}
          />
        );
      }
    }

    modeless.push(
      <Btn
        label="Clear Selection"
        onClick={() => {
          if (window.confirm('Clear selection?')) {
            handleDeleteSelection();
          }
        }}
      ></Btn>
    );
  }

  return Modeless({
    title: props.title,
    showModeless: props.showSelectionConfig,
    setShowModeless: props.updateShowSelectionConfig,
    children: <>{modeless}</>,
  });
}
