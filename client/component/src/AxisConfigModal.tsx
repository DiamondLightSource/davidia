import type {
  ColorMap,
  ColorScaleType,
  CustomDomain,
  Domain,
} from '@h5web/lib';
import {
  ColorMapOption,
  ColorMapSelector,
  ScaleSelector,
  ScaleType,
} from '@h5web/lib';
import type { TypedArray } from 'ndarray';
import type { ReactNode } from 'react';

import DomainConfig from './DomainConfig';
import LabelledInput from './LabelledInput';
import type { IIconType } from './Modal';
import Modal from './Modal';
import { createHistogramParams } from './utils';

type EnumArray<T> = Array<T[keyof T]>;

interface AxisConfigModalProps<S extends ScaleType> {
  title: string;
  icon?: IIconType;
  label?: string;
  setLabel?: (value: string) => void;
  scaleType?: S;
  setScaleType?: (value: S) => void;
  scaleOptions: EnumArray<S>;
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

function AxisConfigModal<S extends ScaleType>(props: AxisConfigModalProps<S>) {
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
      options={props.scaleOptions as S[]}
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

export type { AxisConfigModalProps };
export default AxisConfigModal;
