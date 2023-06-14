import { GridToggler, Separator, Toolbar, ScaleType } from '@h5web/lib';

import type { ComponentType, ReactNode, SVGAttributes } from 'react';
import { useEffect, useState } from 'react';
import { BsCardHeading } from 'react-icons/bs';
import { MdAspectRatio, MdOutlineShapeLine } from 'react-icons/md';
import { TbAxisX, TbAxisY } from 'react-icons/tb';

import { AspectConfigModal } from './AspectConfigModal';
import { AxisConfigModal } from './AxisConfigModal';
import { ClearSelectionsBtn } from './ClearSelectionsBtn';
import { InteractionModeToggle } from './InteractionModeToggle';
import { LabelledInput } from './LabelledInput';
import { Modal } from './Modal';
import SelectionTypeDropdown from './SelectionTypeDropdown';
import {
  BaseSelection,
  disableSelection,
  enableSelection,
  SelectionType,
} from './selections';
import { SelectionConfig } from './SelectionConfig';
import { SelectionIDDropdown } from './SelectionIDDropdown';

interface TitleConfigModalProps {
  title: string;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  label?: string;
  setLabel: (value: string) => void;
}

function TitleConfigModal(props: TitleConfigModalProps) {
  return Modal({
    title: props.title,
    icon: props.icon,
    children: (
      <LabelledInput<string>
        key="title"
        label="title"
        input={props.label ?? ''}
        updateValue={props.setLabel}
      />
    ),
  });
}

export interface PlotToolbarProps {
  showGrid: boolean;
  toggleShowGrid: () => void;
  title: string;
  setTitle: (t: string) => void;
  mode?: string;
  setMode?: (m: string) => void;
  xDomain?: Domain;
  xCustomDomain?: CustomDomain;
  setXCustomDomain?: (d: CustomDomain) => void;
  xLabel: string;
  setXLabel: (l: string) => void;
  xScaleType?: ScaleType;
  setXScaleType?: (s: ScaleType) => void;
  yDomain?: Domain;
  yCustomDomain?: CustomDomain;
  setYCustomDomain?: (d: CustomDomain) => void;
  yLabel: string;
  setYLabel: (l: string) => void;
  yScaleType?: ScaleType;
  setYScaleType?: (s: ScaleType) => void;
  aspect?: Aspect;
  setAspect?: (a: Aspect) => void;
  selectionType?: SelectionType;
  setSelectionType?: (s: SelectionType) => void;
  dDomain?: Domain;
  dCustomDomain?: CustomDomain;
  setDCustomDomain?: (d: CustomDomain) => void;
  values?: TypedArray;
  dScaleType?: ScaleType;
  setDScaleType?: (s: ScaleType) => void;
  colourMap?: ColorMap;
  setColourMap?: (c: ColorMap) => void;
  invertColourMap?: boolean;
  toggleInvertColourMap?: () => void;
  selections?: SelectionBase[];
  updateSelections?: (
    s: SelectionBase | null,
    b?: boolean,
    c?: boolean
  ) => void;
  children?: ReactNode;
}

export function PlotToolbar(props: PlotToolbarProps) {
  const firstSelection =
    props.selections && props.selections.length > 0
      ? props.selections[props.selections.length - 1].id
      : null;
  const [currentSelectionID, setCurrentSelectionID] = useState<string | null>(
    firstSelection
  );
  const [showSelectionConfig, setShowSelectionConfig] = useState(false);

  useEffect(() => {
    props.selections?.map((s) => disableSelection(s));
    if (showSelectionConfig) {
      const selection = props.selections?.find(
        (s) => s.id === currentSelectionID
      );
      if (selection) {
        enableSelection(selection);
      }
    }
  }, [currentSelectionID, props.selections, showSelectionConfig]);

  useEffect(() => {
    if (
      currentSelectionID === null &&
      props.selections &&
      props.selections.length > 0
    ) {
      setCurrentSelectionID(props.selections[props.selections.length - 1].id);
    }
  }, [props.selections, currentSelectionID]);

  const modals = [
    AxisConfigModal({
      title: 'X axis',
      icon: TbAxisX,
      label: props.xLabel,
      setLabel: props.setXLabel,
      scaleType: props.xScaleType,
      setScaleType: props.setXScaleType,
      domain: props.xDomain,
      customDomain: props.xCustomDomain,
      setCustomDomain: props.setXCustomDomain,
    }),
    AxisConfigModal({
      title: 'Y axis',
      icon: TbAxisY,
      label: props.yLabel,
      setLabel: props.setYLabel,
      scaleType: props.yScaleType,
      setScaleType: props.setYScaleType,
      domain: props.yDomain,
      customDomain: props.yCustomDomain,
      setCustomDomain: props.setYCustomDomain,
    }),
  ];
  if (props.aspect !== undefined && props.setAspect !== undefined) {
    modals.push(
      AspectConfigModal({
        title: 'Aspect ratio',
        icon: MdAspectRatio,
        aspect: props.aspect,
        setAspect: props.setAspect,
      })
    );
  }
  modals.push(
    TitleConfigModal({
      title: 'Set title',
      icon: BsCardHeading,
      label: props.title,
      setLabel: props.setTitle,
    })
  );

  const selectionConfig =
    props.selections !== undefined && props.updateSelections !== undefined
      ? SelectionConfig({
          title: 'Selections',
          selections: props.selections as BaseSelection[],
          updateSelections: props.updateSelections,
          currentSelectionID: currentSelectionID,
          updateCurrentSelectionID: setCurrentSelectionID,
          icon: MdOutlineShapeLine,
          domain: props.dDomain,
          customDomain: props.dCustomDomain,
          showSelectionConfig: showSelectionConfig,
          updateShowSelectionConfig: setShowSelectionConfig,
        })
      : console.log(
          'props.selections are: ',
          props.selections,
          ' props.updateSelections is: '
        );

  const bareModals = [];
  const overflows = [];
  modals.forEach((m) => {
    if (m[0]) bareModals.push(m[0]);
    if (m[1]) overflows.push(m[1]);
  });

  if (
    props.selectionType !== undefined &&
    props.setSelectionType !== undefined
  ) {
    bareModals.push(
      <SelectionTypeDropdown
        key="Selection type"
        value={props.selectionType}
        onSelectionTypeChange={props.setSelectionType}
        disabled={props.mode !== 'selectRegion'}
      />
    );
  }

  if (props.colourMap !== undefined) {
    const a = AxisConfigModal({
      title: 'Colour mapping',
      scaleType: props.dScaleType,
      setScaleType: props.setDScaleType,
      colourMap: props.colourMap,
      setColourMap: props.setColourMap,
      invertColourMap: props.invertColourMap,
      toggleColourMapInversion: props.toggleInvertColourMap,
      domain: props.dDomain,
      customDomain: props.dCustomDomain,
      setCustomDomain: props.setDCustomDomain,
      values: props.values,
    });
    if (a[0]) bareModals.push(a[0]);
    bareModals.push(<Separator key="Colour mapping separator" />);
  }

  overflows.push(
    <GridToggler
      key="Grid toggle"
      value={props.showGrid}
      onToggle={props.toggleShowGrid}
    />
  );

  function onSelectionIDChange(i: string) {
    const selection = props.selections?.find((s) => s.id === i);
    if (selection !== undefined) {
      setCurrentSelectionID(i);
      if (props.updateSelections) {
        props.updateSelections(selection);
        console.log('updated selections: ', props.selections);
      }
    }
    setShowSelectionConfig(true);
  }

  if (props.selections) {
    overflows.push(
      <SelectionIDDropdown
        key="ID dropdown"
        selections={props.selections}
        selectionID={currentSelectionID}
        onSelectionIDChange={onSelectionIDChange}
      />
    );
  }

  if (
    props.selections &&
    props.selections.length > 0 &&
    props.updateSelections
  ) {
    overflows.push(
      <ClearSelectionsBtn
        key="Clear all selections"
        selections={props.selections as BaseSelection[]}
        updateSelections={props.updateSelections}
        currentSelectionID={currentSelectionID}
        updateCurrentSelectionID={setCurrentSelectionID}
      ></ClearSelectionsBtn>
    );
  }

  return (
    <Toolbar overflowChildren={overflows}>
      {props.mode && props.setMode ? (
        <InteractionModeToggle
          key="Interaction toggle"
          value={props.mode}
          onModeChange={props.setMode}
        />
      ) : null}
      <Separator key="Interaction separator" />
      {bareModals}
      {selectionConfig}
      {props.children}
    </Toolbar>
  );
}
