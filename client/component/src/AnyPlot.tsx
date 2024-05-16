import afterFrame from 'afterframe';
import { useRef } from 'react';

import type { NdArray, TypedArray } from 'ndarray';

import HeatmapPlot from './HeatmapPlot';
import type { HeatmapPlotProps } from './HeatmapPlot';
import ImagePlot from './ImagePlot';
import type { ImagePlotProps } from './ImagePlot';
import LinePlot from './LinePlot';
import type { LinePlotProps } from './LinePlot';
import ScatterPlot from './ScatterPlot';
import type { ScatterPlotProps } from './ScatterPlot';
import SurfacePlot from './SurfacePlot';
import type { SurfacePlotProps } from './SurfacePlot';
import TableDisplay from './TableDisplay';
import type { TableDisplayProps } from './TableDisplay';
import { measureInteraction } from './utils';
import type { SelectionBase } from './selections/utils';
import { AxisScaleType } from '@h5web/lib';

/** ndarray of a typed array */
type NDT = NdArray<TypedArray>;

/**
 * Represent plot configuration
 */
interface PlotConfig {
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
interface BatonProps {
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
interface PlotSelectionProps {
  /** Handles adding selection */
  addSelection?: (
    selection: SelectionBase | null,
    /** if true, update server with selection */
    broadcast?: boolean,
    /** if true, remove selection */
    clear?: boolean
  ) => void;
  /** The selections */
  selections: SelectionBase[];
  /** The baton props */
  batonProps?: BatonProps;
}

/**
 * Props for selections, baton and configuration in a plot component
 */
interface PlotBaseProps extends PlotSelectionProps {
  /** The plot configuration */
  plotConfig: PlotConfig;
}

type AnyPlotProps =
  | LinePlotProps
  | ImagePlotProps
  | HeatmapPlotProps
  | ScatterPlotProps
  | SurfacePlotProps
  | TableDisplayProps;

/**
 * A plot that accepts any plot props
 * @param {AnyPlotProps} props - component props
 * @returns {React.JSX.Element} The rendered component.
 */
function AnyPlot(props: AnyPlotProps) {
  const interactionTime = useRef<number>(0);
  const interaction = measureInteraction();
  afterFrame(() => {
    interactionTime.current = interaction.end();
  });

  if (!props.batonProps) {
    props = {
      ...props,
      batonProps: {
        uuid: '',
        batonUuid: '',
        others: [],
        hasBaton: true,
        requestBaton: () => {},
        approveBaton: (_s) => {},
      },
    };
  }

  if ('surfaceScale' in props) {
    return <SurfacePlot {...props}></SurfacePlot>;
  } else if ('heatmapScale' in props) {
    return <HeatmapPlot {...props}></HeatmapPlot>;
  } else if ('values' in props) {
    return <ImagePlot {...props}></ImagePlot>;
  } else if ('pointValues' in props) {
    return <ScatterPlot {...props}></ScatterPlot>;
  } else if ('cellWidth' in props) {
    return <TableDisplay {...props}></TableDisplay>;
  } else if ('lineData' in props && props.lineData.length !== 0) {
    return <LinePlot {...props}></LinePlot>;
  }
  return null;
}

export type {
  AnyPlotProps,
  PlotConfig,
  BatonProps,
  HeatmapPlotProps,
  LinePlotProps,
  NDT, // eslint-disable-line react-refresh/only-export-components
  PlotSelectionProps,
  PlotBaseProps,
  ScatterPlotProps,
  SurfacePlotProps,
};
export default AnyPlot;
