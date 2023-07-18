import {
  Aspect,
  AXIS_SCALE_TYPES,
  AxisScaleType,
  Btn,
  COLOR_SCALE_TYPES,
  ColorMap,
  ColorScaleType,
  CustomDomain,
  Domain,
  GridToggler,
  Separator,
  Toolbar,
} from '@h5web/lib';
import { TypedArray } from 'ndarray';
import type { ComponentType, ReactNode, SVGAttributes } from 'react';
import { Fragment, useEffect, useState } from 'react';
import { BsCardHeading } from 'react-icons/bs';
import { MdAspectRatio, MdOutlineShapeLine } from 'react-icons/md';
import { TbAxisX, TbAxisY } from 'react-icons/tb';

import { AspectConfigModal } from './AspectConfigModal';
import { AxisConfigModal } from './AxisConfigModal';
import BaseSelection from './selections/BaseSelection';
import { BatonConfigModal } from './BatonConfigModal';
import { ClearSelectionsBtn } from './ClearSelectionsBtn';
import { InteractionModeToggle } from './InteractionModeToggle';
import { LabelledInput } from './LabelledInput';
import { Modal } from './Modal';
import SelectionTypeDropdown from './SelectionTypeDropdown';
import {
  disableSelection,
  enableSelection,
  SelectionType,
} from './selections/utils';
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
  xScaleType?: AxisScaleType;
  setXScaleType?: (s: AxisScaleType) => void;
  yDomain?: Domain;
  yCustomDomain?: CustomDomain;
  setYCustomDomain?: (d: CustomDomain) => void;
  yLabel: string;
  setYLabel: (l: string) => void;
  batonProps: BatonProps;
  yScaleType?: AxisScaleType;
  setYScaleType?: (s: AxisScaleType) => void;
  aspect?: Aspect;
  setAspect?: (a: Aspect) => void;
  selectionType?: SelectionType;
  setSelectionType?: (s: SelectionType) => void;
  dDomain?: Domain;
  dCustomDomain?: CustomDomain;
  setDCustomDomain?: (d: CustomDomain) => void;
  values?: TypedArray;
  dScaleType?: ColorScaleType;
  setDScaleType?: (s: ColorScaleType) => void;
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
    AxisConfigModal<AxisScaleType>({
      title: 'X axis',
      icon: TbAxisX,
      label: props.xLabel,
      setLabel: props.setXLabel,
      scaleType: props.xScaleType,
      scaleOptions: AXIS_SCALE_TYPES,
      setScaleType: props.setXScaleType,
      domain: props.xDomain,
      customDomain: props.xCustomDomain,
      setCustomDomain: props.setXCustomDomain,
    }),
    AxisConfigModal<AxisScaleType>({
      title: 'Y axis',
      icon: TbAxisY,
      label: props.yLabel,
      setLabel: props.setYLabel,
      scaleType: props.yScaleType,
      scaleOptions: AXIS_SCALE_TYPES,
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
          hasBaton: props.batonProps.hasBaton,
        })
      : console.log(
          'props.selections are: ',
          props.selections,
          ' props.updateSelections is: ',
          props.updateSelections
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
    const a = AxisConfigModal<ColorScaleType>({
      title: 'Colour mapping',
      scaleType: props.dScaleType,
      setScaleType: props.setDScaleType,
      scaleOptions: COLOR_SCALE_TYPES,
      colourMap: props.colourMap,
      setColourMap: props.setColourMap,
      invertColourMap: props.invertColourMap,
      toggleColourMapInversion: props.toggleInvertColourMap,
      domain: props.dDomain,
      customDomain: props.dCustomDomain,
      setCustomDomain: props.setDCustomDomain,
      values: props.values,
    });
    a.forEach((m) => {
      if (m) bareModals.push(m);
    });
    bareModals.push(<Separator key="Colour mapping separator" />);
  }

  overflows.push(
    <GridToggler
      key="Grid toggle"
      value={props.showGrid}
      onToggle={props.toggleShowGrid}
    />
  );
  const b = BatonConfigModal(props.batonProps);
  if (b[0]) bareModals.push(b[0]);
  if (b[1]) overflows.push(b[1]);

  if (!props.batonProps.hasBaton) {
    overflows.push(
      <Btn
        label="Request baton"
        onClick={() => props.batonProps.requestBaton()}
      ></Btn>
    );
  }

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
        disabled={!props.batonProps.hasBaton}
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
          hasBaton={props.batonProps.hasBaton}
        />
      ) : null}
      <Separator key="Interaction separator" />
      {bareModals}
      {<Fragment key="Selection config">{selectionConfig}</Fragment>}
      {props.children}
    </Toolbar>
  );
}
