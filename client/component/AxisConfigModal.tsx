import {
  ColorMap,
  ColorMapOption,
  ColorMapSelector,
  ColorScaleType,
  CustomDomain,
  Domain,
  ScaleType,
  ScaleSelector,
} from '@h5web/lib';
import { TypedArray } from 'ndarray';
import { ReactNode } from 'react';

import DomainConfig from './DomainConfig';
import { LabelledInput } from './LabelledInput';
import { IIconType, Modal } from './Modal';
import { createHistogramParams } from './utils';

interface AxisConfigModalProps<S extends ScaleType> {
  title: string;
  icon?: IIconType;
  label?: string;
  setLabel?: (value: string) => void;
  scaleType?: S;
  setScaleType?: (value: S) => void;
  scaleOptions: S[];
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

export function AxisConfigModal<S extends ScaleType>(
  props: AxisConfigModalProps<S>
) {
  const label_input = props.label && props.setLabel && (
    <LabelledInput<string>
      key="label"
      label="label"
      input={props.label}
      updateValue={props.setLabel}
      enableEnterKey={false}
    />
  );

  const scale_selector = props.scaleType && props.setScaleType && (
    <ScaleSelector<S>
      label="scale"
      value={props.scaleType}
      onScaleChange={props.setScaleType}
      options={props.scaleOptions}
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
      <DomainConfig
        dataDomain={props.domain}
        customDomain={props.customDomain}
        scaleType={props.scaleType as ColorScaleType}
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
