import { ComponentType, SVGAttributes } from 'react';
import { HexColorPicker as Picker } from 'react-colorful';
import { ToggleGroup } from '@h5web/lib';
import { Modeless } from './Modeless';
import { LabelledInput } from './LabelledInput';
import { BaseSelection } from './selections';
import { SelectionIDDropdown } from './SelectionIDDropdown';
import { isNumber, isValidPositiveNumber } from './utils';

interface SelectionsListModelessProps {
  title: string;
  selections: BaseSelection[];
  updateSelections: (s: SelectionBase) => void;
  currentSelectionID: string | null;
  updateCurrentSelectionID: (s: string | null) => void;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  label?: string;
  domain?: Domain;
  customDomain?: Domain;
}

export function SelectionsListModeless(props: SelectionsListModelessProps) {
  const currentSelection =
    props.selections.find((s) => s.id == props.currentSelectionID) ??
    props.selections[0];

  function onSelectionIDChange(i: string) {
    console.log(
      'before update currentSelectionID is ',
      props.currentSelectionID
    );
    if (i === '') {
      props.updateCurrentSelectionID(null);
      console.log(
        'updated null updateCurrentSelectionID: ',
        props.currentSelectionID
      );
    } else {
      const selection = props.selections.find((s) => s.id == i);
      if (selection != undefined) {
        props.updateCurrentSelectionID(i);
        console.log(
          'updated i updateCurrentSelectionID: ',
          props.currentSelectionID,
          'i is ',
          i
        );
      }
    }
  }

  function onSelectionColourChange(c: string) {
    if (props.currentSelectionID != null) {
      const currentSelection = props.selections.find(
        (s) => s.id == props.currentSelectionID
      );
      if (currentSelection) {
        currentSelection.colour = c;
        props.updateSelections(currentSelection);
        console.log('selections are ', props.selections);
      }
    }
  }

  function updateName(n: string) {
    if (props.currentSelectionID != null) {
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
  }

  function updateAlpha(a: number) {
    if (props.currentSelectionID != null && a <= 1 && a >= 0) {
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
    if (props.currentSelectionID != null) {
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
  }

  function updateVStarty(a: number) {
    if (props.currentSelectionID != null) {
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
  }

  function updateFixed(f: string) {
    if (props.currentSelectionID != null) {
      const currentSelection = props.selections.find(
        (s) => s.id == props.currentSelectionID
      );
      if (currentSelection != null) {
        if (f === 'true') {
          currentSelection.fixed = true;
        } else {
          currentSelection.fixed = false;
        }
        props.updateSelections(currentSelection);
        console.log('selections are ', props.selections);
      }
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
    <SelectionIDDropdown
      selections={props.selections}
      value={props.currentSelectionID ?? ''}
      onSelectionIDChange={onSelectionIDChange}
      disabled={props.currentSelectionID == null}
    />
  );

  if (currentSelection != null) {
    modeless.push(
      <Picker
        color={currentSelection.colour ?? '#000000'}
        onChange={onSelectionColourChange}
      />
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
        input={currentSelection.alpha}
        updateValue={updateAlpha}
        isValid={(v) => isValidPositiveNumber(v, 1)}
      />
    );
    modeless.push(
      <ToggleGroup
        role="radiogroup"
        ariaLabel="fixed"
        value={String(currentSelection.fixed)}
        onChange={updateFixed}
      >
        <ToggleGroup.Btn label="true" value="true" />
        <ToggleGroup.Btn label="false" value="false" />
      </ToggleGroup>
    );
    modeless.push(
      <LabelledInput<number>
        key="x"
        label="x"
        input={currentSelection.vStart.x}
        updateValue={updateVStartx}
        isValid={(v) => isNumber(v)}
      />
    );
    modeless.push(
      <LabelledInput<number>
        key="y"
        label="y"
        input={currentSelection.vStart.y}
        updateValue={updateVStarty}
        isValid={(v) => isNumber(v)}
      />
    );

    if ('angle' in currentSelection) {
      modeless.push(
        <LabelledInput<number>
          key="angle"
          label="angle"
          input={currentSelection.angle as number}
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
          input={currentSelection.length as number}
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
          input={currentSelection.lengths[0] as number}
          updateValue={updateXLength}
          isValid={(v) => isNumber(v)}
        />
      );
      modeless.push(
        <LabelledInput<number>
          key="y length"
          label="y length"
          input={currentSelection.lengths[1] as number}
          updateValue={updateYLength}
          isValid={(v) => isNumber(v)}
        />
      );
    }
  }

  return Modeless({
    title: props.title,
    icon: props.icon,
    children: <>{modeless}</>,
  });
}
