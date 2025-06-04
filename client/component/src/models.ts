import type { NdArray, TypedArray } from 'ndarray';

import type {
  SelectionHandler,
  SelectionBase,
  SelectionsEventListener,
} from './selections/utils';
import { AxisScaleType } from '@h5web/lib';

/** ndarray of a typed array */
export type NDT = NdArray<TypedArray>;

/**
 * Represent plot configuration
 */
export interface PlotConfig {
  /** The label for the x-axis */
  xLabel?: string;
  /** The label for the y-axis */
  yLabel?: string;
  /** The x-axis scale type */
  xScale?: AxisScaleType;
  /** The y-axis scale type */
  yScale?: AxisScaleType;
  /** The x-axis values */
  xValues?: NDT;
  /** The y-axis values */
  yValues?: NDT;
  /** The plot title */
  title?: string;
}

/**
 * Baton props
 */
export interface BatonProps {
  /** The universally unique identifier (uuid) of the client */
  uuid: string;
  /** The uuid of the current baton holder */
  batonUuid: string;
  /** The other uuids */
  others: string[];
  /** If client holds baton */
  hasBaton: boolean;
  /** Handles baton request */
  requestBaton: () => void;
  /** Handle passing baton to client with given uuid */
  offerBaton: (s: string) => void;
}

export const defaultBatonProps: BatonProps = {
  uuid: '',
  batonUuid: '',
  others: [],
  hasBaton: true,
  requestBaton: () => {},
  offerBaton: (_s) => {},
};

/**
 * Props for selections (and baton) in a plot component
 */
export interface PlotSelectionProps {
  /** Handles adding selection (set null to disable editing) */
  updateSelection?: SelectionHandler | null;
  /** The selections */
  selections?: SelectionBase[];
  /** The baton props */
  batonProps?: BatonProps;
  /** Selections event listener */
  selectionsListener?: SelectionsEventListener;
}

/**
 * Props for selections, baton and configuration in a plot component
 */
export interface PlotBaseProps extends PlotSelectionProps {
  /** The plot configuration */
  plotConfig: PlotConfig;
  /**
   * Children to customize the toolbar. If undefined then use default toolbar, if null, disable toolbar,
   * otherwise use given children
   */
  customToolbarChildren?: React.ReactNode;
}
