import {
  ColorMap,
  ColorMapOption,
  ColorMapSelector,
  ScaleSelector,
} from '@h5web/lib';
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
  colourMap?: ColorMap;
  setColourMap?: (value: ColorMap) => void;
  invertColourMap?: boolean;
  toggleColourMapInversion?: () => void;
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
      useEnter={false}
    />
  );

  const scale_selector = props.scaleType && props.setScaleType && (
    <ScaleSelector
      label="scale"
      value={props.scaleType}
      onScaleChange={props.setScaleType}
    />
  );

  const colour_map_selector = props.colourMap &&
    props.setColourMap &&
    props.invertColourMap !== undefined &&
    props.toggleColourMapInversion !== undefined && (
      <ColorMapSelector
        value={props.colourMap}
        onValueChange={props.setColourMap}
        invert={props.invertColourMap}
        onInversionChange={props.toggleColourMapInversion}
      />
    );

  const histo_function =
    props.values && props.domain
      ? () =>
          createHistogramParams(
            props.values,
            props.domain,
            props.colourMap,
            props.invertColourMap
          )
      : undefined;

  const domain_selector = props.domain &&
    props.customDomain &&
    props.scaleType &&
    props.setCustomDomain && (
      <DomainControls
        dataDomain={props.domain}
        customDomain={props.customDomain}
        scaleType={props.scaleType}
        onCustomDomainChange={props.setCustomDomain}
        histogramFunction={histo_function}
      />
    );

  return Modal({
    title: props.title,
    icon: props.icon,
    button: props.colourMap ? (
      <ColorMapOption option={props.colourMap} />
    ) : null,
    children: (
      <>
        {label_input}
        {scale_selector}
        {colour_map_selector}
        {domain_selector}
        {props.children}
      </>
    ),
  });
}
