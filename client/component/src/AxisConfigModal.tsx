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
import { createHistogramParams, isValidPointSize } from './utils';
import type { BatonProps } from './AnyPlot';

type EnumArray<T> = Array<T[keyof T]>;

/**
 * Props for the `AxisConfigModal` component.
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
  /** Data for the d axis (optional) */
  dData?: TypedArray;
  /** Point size for scatter plot (optional) */
  scatterPointSize?: number;
  /** The function to call when the scatter point size is updated (optional) */
  setScatterPointSize?: (p: number) => void;
  /** The baton properties (optional)*/
  batonProps?: BatonProps;
  /** The children to render inside the modal (optional) */
  children?: ReactNode;
}

/**
 * Render the configuration options for an axis.
 * @param {AxisConfigModalProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 * @template S
 */
function AxisConfigModal<S extends ScaleType>(props: AxisConfigModalProps<S>) {
  const labelInput = props.label && props.setLabel && (
    <LabelledInput<string>
      key="label"
      label="label"
      input={props.label}
      updateValue={props.setLabel}
      enableEnterKey={false}
    />
  );

  const scaleSelector = props.scaleType && props.setScaleType && (
    <ScaleSelector<S>
      label="scale"
      value={props.scaleType}
      onScaleChange={props.setScaleType}
      options={props.scaleOptions as S[]}
    />
  );

  const colourMapSelector = props.colourMap &&
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

  const histoFunction =
    props.dData && props.domain
      ? () =>
          createHistogramParams(
            props.dData,
            props.domain,
            props.colourMap,
            props.invertColourMap
          )
      : undefined;

  const domainSelector = props.domain &&
    props.customDomain &&
    props.setCustomDomain && (
      <DomainConfig
        dataDomain={props.domain}
        customDomain={props.customDomain}
        scaleType={props.scaleType as ColorScaleType | undefined}
        onCustomDomainChange={props.setCustomDomain}
        histogramFunction={histoFunction}
      />
    );

  const pointSizeInput = props.scatterPointSize &&
    props.setScatterPointSize && (
      <LabelledInput<number>
        key="point size"
        label="point size"
        input={props.scatterPointSize ?? 10}
        updateValue={props.setScatterPointSize}
        decimalPlaces={2}
        isValid={(v) => isValidPointSize(v, false)}
        disabled={!props.batonProps?.hasBaton}
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
        {labelInput}
        {scaleSelector}
        {colourMapSelector}
        {domainSelector}
        {pointSizeInput}
        {props.children}
      </>
    ),
  });
}

export type { AxisConfigModalProps };
export default AxisConfigModal;
