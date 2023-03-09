import { ColorMapOption, ColorMapSelector, ScaleSelector } from '@h5web/lib';
import { ComponentType, ReactNode, SVGAttributes } from 'react';

import DomainControls from './DomainControls';
import { LabelledInput } from './LabelledInput';
import { Modal } from './Modal';
import { createHistogramParams } from './utils';

interface AxisConfigModalProps {
  title: string;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  label?: string;
  setLabel?: (value: string) => void;
  scaleType?: ScaleType;
  setScaleType?: (value: ScaleType) => void;
  colorMap?: ColorMap;
  setColorMap?: (value: ColorMap) => void;
  invertColorMap?: boolean;
  toggleColorMapInversion?: () => void;
  domain?: Domain;
  customDomain?: CustomDomain;
  setCustomDomain?: (value: CustomDomain) => void;
  values?: TypedArray;
  children?: ReactNode;
}

export function AxisConfigModal(props: AxisConfigModalProps) {
  const label_input = props.label && props.setLabel && (
    <LabelledInput<string>
      key="label"
      label="label"
      input={props.label}
      updateValue={props.setLabel}
    />
  );

  const scale_selector = props.scaleType && props.setScaleType && (
    <ScaleSelector
      label="scale"
      value={props.scaleType}
      onScaleChange={props.setScaleType}
    />
  );

  const color_map_selector = props.colorMap &&
    props.setColorMap &&
    props.invertColorMap !== undefined &&
    props.toggleColorMapInversion !== undefined && (
      <ColorMapSelector
        value={props.colorMap}
        onValueChange={props.setColorMap}
        invert={props.invertColorMap}
        onInversionChange={props.toggleColorMapInversion}
      />
    );

  const domain_selector = props.domain &&
    props.customDomain &&
    props.scaleType &&
    props.setCustomDomain && (
      <DomainControls
        dataDomain={props.domain}
        customDomain={props.customDomain}
        scaleType={props.scaleType}
        onCustomDomainChange={props.setCustomDomain}
        histogram={createHistogramParams(
          props.values,
          props.colorMap,
          props.invertColorMap
        )}
      />
    );

  return Modal({
    title: props.title,
    icon: props.icon,
    button: props.colorMap ? <ColorMapOption option={props.colorMap} /> : null,
    children: (
      <>
        {label_input}
        {scale_selector}
        {color_map_selector}
        {domain_selector}
        {props.children}
      </>
    ),
  });
}
