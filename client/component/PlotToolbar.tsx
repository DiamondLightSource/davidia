import { GridToggler, Separator, Toolbar, ScaleType } from '@h5web/lib';

import type { ComponentType, ReactNode, SVGAttributes } from 'react';
import { BsCardHeading } from 'react-icons/bs';
import { MdAspectRatio } from 'react-icons/md';
import { TbAxisX, TbAxisY } from 'react-icons/tb';

import { AspectConfigModal } from './AspectConfigModal';
import { AxisConfigModal } from './AxisConfigModal';
import { InteractionModeToggle } from './InteractionModeToggle';
import { LabelledInput } from './LabelledInput';
import { Modal } from './Modal';
import { SelectionTypeSelector } from './SelectionTypeSelector';
import { SelectionType } from './selections';

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
  children?: ReactNode;
}

export function PlotToolbar(props: PlotToolbarProps) {
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

  const bareModals = [];
  const overflows = [];
  modals.forEach((m) => {
    if (m[0]) bareModals.push(m[0]);
    if (m[1]) overflows.push(m[1]);
  });

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
    a.forEach((m) => {
      if (m) bareModals.push(m);
    });
    bareModals.push(<Separator key="Colour mapping separator" />);
  }

  overflows.push(
    <GridToggler value={props.showGrid} onToggle={props.toggleShowGrid} />
  );
  if (
    props.selectionType !== undefined &&
    props.setSelectionType !== undefined
  ) {
    overflows.push(
      <SelectionTypeSelector
        selectionType={props.selectionType}
        setSelectionType={props.setSelectionType}
      />
    );
  }

  return (
    <Toolbar overflowChildren={overflows}>
      {props.mode && props.setMode ? (
        <InteractionModeToggle
          value={props.mode}
          onModeChange={props.setMode}
        />
      ) : null}
      <Separator key="Interaction separator" />
      {bareModals}
      {props.children}
    </Toolbar>
  );
}
