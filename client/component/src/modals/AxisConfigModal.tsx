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

import DomainConfig from '../domain/DomainConfig';
import LabelledInput from '../small-components/LabelledInput';
import type { IIconType } from './Modal';
import Modal from './Modal';
import { createHistogramParams } from '../utils';

type EnumArray<T> = Array<T[keyof T]>;

/**
 * The props for the `AxisConfigModal` component.
 * @interface {object} AxisConfigModalProps
 * @member {string} title - The title of the modal.
 * @member {IIconType} [icon] - The icon to display in the modal.
 * @member {string} [label] - The label for the axis.
 * @member {(value: string) => void} [setLabel] - The function to call when the label is updated.
 * @member {S} [scaleType] - The type of scale to use for the axis.
 * @member {(value: S) => void} [setScaleType] - The function to call when the scale type is updated.
 * @member {EnumArray<S>} scaleOptions - The available scale options.
 * @member {ColorMap} [colourMap] - The color map for the axis.
 * @member {(value: ColorMap) => void} [setColourMap] - The function to call when the color map is updated.
 * @member {boolean} [invertColourMap] - A boolean value indicating whether to invert the color map.
 * @member {() => void} [toggleColourMapInversion] - The function to call when the color map inversion is toggled.
 * @member {Domain} [domain] - The domain for the axis.
 * @member {CustomDomain} [customDomain] - The custom domain for the axis.
 * @member {(value: CustomDomain) => void} [setCustomDomain] - The function to call when the custom domain is updated.
 * @member {TypedArray} [values] - The values for the axis.
 * @member {ReactNode} [children] - The children to render inside the modal.
 */
interface AxisConfigModalProps<S extends ScaleType> {
  /** The title of the modal */
  title: string;
  /** The icon to display in the modal (optional) */
  icon?: IIconType;
  /** The label for the axis (optional) */
  label?: string;
  /** The function to call when the label is updated (optional) */
  setLabel?: (value: string) => void;
  /** The type of scale to use for the axis (optional) */
  scaleType?: S;
  /** The function to call when the scale type is updated (optional) */
  setScaleType?: (value: S) => void;
  /** The available scale options */
  scaleOptions: EnumArray<S>;
  /** The color map for the axis (optional) */
  colourMap?: ColorMap;
  /** The function to call when the color map is updated (optional) */
  setColourMap?: (value: ColorMap) => void;
  /** A boolean value indicating whether to invert the color map (optional) */
  invertColourMap?: boolean;
  /** The function to call when the color map inversion is toggled (optional) */
  toggleColourMapInversion?: () => void;
  /** The domain for the axis (optional) */
  domain?: Domain;
  /** The custom domain for the axis (optional) */
  customDomain?: CustomDomain;
  /** The function to call when the custom domain is updated (optional) */
  setCustomDomain?: (value: CustomDomain) => void;
  /** The values for the axis (optional) */
  values?: TypedArray;
  /** The children to render inside the modal (optional) */
  children?: ReactNode;
}

/**
 * Renders the configuration options for an axis.
 * @param {AxisConfigModalProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 * @template S
 */
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
