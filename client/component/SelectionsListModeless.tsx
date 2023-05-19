import { ComponentType, SVGAttributes, useEffect, useState } from 'react';
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
  const [currentSelection, updateCurrentSelection] =
    useState<SelectionBase | null>(null);

  useEffect(() => {
    console.log('calling useEffect: ', currentSelection);
    console.log('props.currentSelectionID: ', props.currentSelectionID);
    const i = currentSelection?.id;
    const selection = props.selections.find((s) => s.id == i);
    if (selection != undefined) {
      updateCurrentSelection(selection);
    }
    console.log('useEffect called: ', currentSelection);
    console.log('props.currentSelectionID: ', props.currentSelectionID);
  }, [props, currentSelection]);

  function onSelectionIDChange(i: string) {
    console.log(
      'before update currentSelectionID is ',
      props.currentSelectionID
    );
    if (i === '') {
      updateCurrentSelection(null);
      props.updateCurrentSelectionID(null);
      console.log(
        'updated null updateCurrentSelectionID: ',
        props.currentSelectionID
      );
    } else {
      const selection = props.selections.find((s) => s.id == i);
      if (selection != undefined) {
        updateCurrentSelection(selection);
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
    if (currentSelection != null && c != 'Choose colour') {
      const updatedSelection = currentSelection;
      updatedSelection.colour = c;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateName(n: string) {
    if (currentSelection != null) {
      const updatedSelection = currentSelection;
      updatedSelection.name = n;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateAlpha(a: number) {
    if (currentSelection != null && a <= 1 && a >= 0) {
      const updatedSelection = currentSelection;
      updatedSelection.alpha = a;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateXLength(l: number) {
    if (currentSelection != null && 'lengths' in currentSelection) {
      currentSelection.lengths[0] = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateYLength(l: number) {
    if (currentSelection != null && 'lengths' in currentSelection) {
      currentSelection.lengths[1] = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateLength(l: number) {
    if (currentSelection != null && 'length' in currentSelection) {
      currentSelection.length = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateVStartx(a: number) {
    console.log('calling updateVStartx');
    if (currentSelection != null) {
      const updatedSelection = currentSelection;
      updatedSelection.vStart.x = a;
      console.log('Updated start0 is ', updatedSelection.start[0]);
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateVStarty(a: number) {
    if (currentSelection != null) {
      const updatedSelection = currentSelection;
      updatedSelection.vStart.y = a;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateFixed(f: string) {
    if (currentSelection != null) {
      const updatedSelection = currentSelection;
      if (f === 'true') {
        updatedSelection.fixed = true;
      } else {
        updatedSelection.fixed = false;
      }
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateAngle(a: number) {
    if (currentSelection != null && 'angle' in currentSelection) {
      const updatedSelection = currentSelection;
      const radians = a * (Math.PI / 180);
      updatedSelection.angle = radians;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  const modeless = [];

  modeless.push(
    <SelectionIDDropdown
      selections={props.selections}
      value={currentSelection?.id ?? ''}
      onSelectionIDChange={onSelectionIDChange}
      disabled={currentSelection == null}
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
