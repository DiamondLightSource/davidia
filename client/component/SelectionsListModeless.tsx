import { ComponentType, SVGAttributes, useState } from 'react';
import { ToggleGroup } from '@h5web/lib';
import { Modeless } from './Modeless';
import { LabelledInput } from './LabelledInput';
import { BaseSelection } from './selections';
import { SelectionIDDropdown } from './SelectionIDDropdown';
import { SelectionColourDropdown } from './SelectionColourDropdown';
import { isNumber, isValidPositiveNumber } from './utils';

interface SelectionsListModelessProps {
  title: string;
  selections: BaseSelection[];
  updateSelections: (s: SelectionBase) => void;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  label?: string;
  domain?: Domain;
  customDomain?: Domain;
}

export function SelectionsListModeless(props: SelectionsListModelessProps) {
  const [currentSelection, setCurrentSelection] =
    useState<BaseSelection | null>(null);

  function onSelectionIDChange(i: string) {
    if (i === 'Choose selection') {
      setCurrentSelection(null);
    } else {
      const selection = props.selections.find((s) => s.id == i);
      if (selection != undefined) {
        setCurrentSelection(selection);
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
      const updatedSelection = currentSelection;
      updatedSelection.lengths[0] = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateYLength(l: number) {
    if (currentSelection != null && 'lengths' in currentSelection) {
      const updatedSelection = currentSelection;
      updatedSelection.lengths[1] = l;
      props.updateSelections(currentSelection);
      console.log('selections are ', props.selections);
    }
  }

  function updateLength(l: number) {
    if (currentSelection != null && 'length' in currentSelection) {
      const updatedSelection = currentSelection;
      updatedSelection.length = l;
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

  const selections_list = (
    <SelectionIDDropdown
      selections={props.selections}
      value={currentSelection?.id ?? 'Choose selection'}
      onSelectionIDChange={onSelectionIDChange}
      disabled={currentSelection == null}
    />
  );

  modeless.push(selections_list);

  const colours_list = (
    <SelectionColourDropdown
      value={currentSelection?.colour ?? 'Choose colour'}
      onSelectionColourChange={onSelectionColourChange}
      disabled={currentSelection == null}
    />
  );

  modeless.push(colours_list);

  const name_input = (
    <LabelledInput<string>
      key="name"
      label="name"
      input={currentSelection?.name ?? ''}
      updateValue={updateName}
      disabled={currentSelection === null}
    />
  );

  modeless.push(name_input);

  const alpha_input = (
    <LabelledInput<number>
      key="alpha"
      label="alpha"
      input={currentSelection?.alpha ?? 1}
      updateValue={updateAlpha}
      isValid={(v) => isValidPositiveNumber(v, 1)}
      disabled={currentSelection === null}
    />
  );

  modeless.push(alpha_input);

  const fixed_toggle = (
    <ToggleGroup
      role="radiogroup"
      ariaLabel="fixed"
      value={
        currentSelection === null ? 'true' : String(currentSelection.fixed)
      }
      onChange={updateFixed}
    >
      <ToggleGroup.Btn label="true" value="true" />
      <ToggleGroup.Btn label="false" value="false" />
    </ToggleGroup>
  );

  modeless.push(fixed_toggle);

  const vStart_input_x = (
    <LabelledInput<number>
      key="x"
      label="x"
      input={currentSelection?.vStart.x ?? 0}
      updateValue={updateVStartx}
      disabled={currentSelection === null}
      isValid={(v) => isNumber(v)}
    />
  );

  const vStart_input_y = (
    <LabelledInput<number>
      key="y"
      label="y"
      input={currentSelection?.vStart.y ?? 0}
      updateValue={updateVStarty}
      disabled={currentSelection === null}
      isValid={(v) => isNumber(v)}
    />
  );

  if (currentSelection != null && 'angle' in currentSelection) {
    const angle = (
      <LabelledInput<number>
        key="angle"
        label="angle"
        input={currentSelection.angle as number}
        updateValue={updateAngle}
        disabled={currentSelection === null}
        isValid={(v) => isNumber(v)}
      />
    );
    modeless.push(angle);
  }

  if (currentSelection != null && 'length' in currentSelection) {
    const length = (
      <LabelledInput<number>
        key="length"
        label="length"
        input={currentSelection.length as number}
        updateValue={updateLength}
        disabled={currentSelection === null}
        isValid={(v) => isNumber(v)}
      />
    );
    modeless.push(length);
  }

  modeless.push(vStart_input_x);
  modeless.push(vStart_input_y);

  if (currentSelection != null && 'lengths' in currentSelection) {
    const xLength = (
      <LabelledInput<number>
        key="x length"
        label="x length"
        input={currentSelection.lengths[0] as number}
        updateValue={updateXLength}
        disabled={currentSelection === null}
        isValid={(v) => isNumber(v)}
      />
    );
    const yLength = (
      <LabelledInput<number>
        key="y length"
        label="y length"
        input={currentSelection.lengths[1] as number}
        updateValue={updateYLength}
        disabled={currentSelection === null}
        isValid={(v) => isNumber(v)}
      />
    );
    modeless.push(xLength);
    modeless.push(yLength);
  }

  return Modeless({
    title: props.title,
    icon: props.icon,
    children: <>{modeless}</>,
  });
}
