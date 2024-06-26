import type { NdArray, TypedArray } from 'ndarray';

import type { AddSelectionHandler, SelectionBase } from './selections/utils';
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
  batonUuid: string | null;
  /** The other uuids */
  others: string[];
  /** If client holds baton */
  hasBaton: boolean;
  /** Handles baton request */
  requestBaton: () => void;
  /** Approves passing baton to client with given uuid */
  approveBaton: (s: string) => void;
}

/**
 * Props for selections (and baton) in a plot component
 */
export interface PlotSelectionProps {
  /** Handles adding selection (set null to disable editing) */
  addSelection?: AddSelectionHandler;
  /** The selections */
  selections?: SelectionBase[];
  /** The baton props */
  batonProps?: BatonProps;
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
