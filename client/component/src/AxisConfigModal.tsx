import type {
  ColorMap,
  ColorScaleType,
  CustomDomain,
  Domain,
  HistogramParams,
} from '@h5web/lib';
import {
  ColorMapGradient,
  ColorMapSelector,
  ScaleSelector,
  ScaleType,
} from '@h5web/lib';
import type { PropsWithChildren } from 'react';

import DomainConfig from './DomainConfig';
import LabelledInput from './LabelledInput';
import type { IIconType } from './Modal';
import Modal from './Modal';
import { isValidPointSize } from './utils';

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
  /** Histogram params getter */
  histogramGetter?: () => HistogramParams;
  /** The function to call when the custom domain is updated (optional) */
  setCustomDomain?: (value: CustomDomain) => void;
  /** Point size for scatter plot (optional) */
  scatterPointSize?: number;
  /** The function to call when the scatter point size is updated (optional) */
  setScatterPointSize?: (p: number) => void;
  /** If has control of the baton */
  hasBaton?: boolean;
  /** If true, hide toggle */
  hideToggle?: boolean;
}

/**
 * Render the configuration options for an axis.
 * @param {AxisConfigModalProps<S>} props - The component props.
 * @returns {JSX.Element} The rendered component.
 * @template S
 */
function AxisConfigModal<S extends ScaleType>(
  props: PropsWithChildren<AxisConfigModalProps<S>>
) {
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

  const domainSelector = props.domain &&
    props.histogramGetter &&
    props.customDomain &&
    props.setCustomDomain && (
      <DomainConfig
        dataDomain={props.domain}
        customDomain={props.customDomain}
        scaleType={props.scaleType as ColorScaleType | undefined}
        onCustomDomainChange={props.setCustomDomain}
        histogramGetter={props.histogramGetter}
      />
    );

  const pointSizeInput = props.scatterPointSize !== undefined &&
    props.setScatterPointSize && (
      <LabelledInput<number>
        key="point size"
        label="point size"
        input={props.scatterPointSize}
        updateValue={props.setScatterPointSize}
        decimalPlaces={2}
        isValid={(v) => isValidPointSize(v, false)}
        disabled={!props?.hasBaton}
      />
    );

  return Modal({
    title: props.title,
    icon: props.icon,
    button: props.colourMap ? (
      <ColorMapGradient colorMap={props.colourMap} />
    ) : null,
    hideToggle: props.hideToggle,
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
