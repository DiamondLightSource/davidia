import afterFrame from 'afterframe';
import { useRef } from 'react';
import type { TypedArray, NdArray } from 'ndarray';

import HeatmapPlot from './HeatmapPlot';
import ImagePlot from './ImagePlot';
import LinePlot from './LinePlot';
import ScatterPlot from './ScatterPlot';
import SurfacePlot from './SurfacePlot';
import TableDisplay from './TableDisplay';
import { measureInteraction } from './utils';
import type { SelectionBase } from './selections/utils';
import {
  Aspect,
  AxisScaleType,
  ColorMap,
  ColorScaleType,
  Domain,
} from '@h5web/lib';

type TableDisplayType = 'scientific' | 'standard';

/**
 * An MP_NDArray.
 * @interface {object} MP_NDArray
 * @member {boolean} nd - If is an n-dimensional.
 * @member {string} [dtype] - The data type.
 * @member {number[]} [shape] - The shape of the data.
 * @member {ArrayBuffer} [data] - The data.
 */
interface MP_NDArray {
  // see fastapi_utils.py
  nd: boolean;
  dtype: string;
  shape: number[];
  data: ArrayBuffer;
}

/**
 * Represents axes parameters.
 * @interface {object} AxesParameters
 * @member {string} [x_label] - The label for the x-axis.
 * @member {string} [y_label] - The label for the y-axis.
 * @member {AxisScaleType} [x_scale] - The x-axis scale type.
 * @member {AxisScaleType} [y_scale] - The y-axis scale type.
 * @member {MP_NDArray} [x_values] - The x-axis values.
 * @member {MP_NDArray} [y_values] - The y-axis values.
 * @member {string} [title] - The plot title.
 */
interface AxesParameters {
  x_label?: string;
  y_label?: string;
  x_scale?: AxisScaleType;
  y_scale?: AxisScaleType;
  x_values?: MP_NDArray;
  y_values?: MP_NDArray;
  title?: string;
}

/**
 * Represents line data.
 * @interface {object} DLineData
 * @member {string} key - The key.
 * @member {string} [colour] - Line colour.
 * @member {NdArray<TypedArray>} x - x coordinates.
 * @member {[number, number]} dx - x data domain.
 * @member {NdArray<TypedArray>} y - y coordinates.
 * @member {[number, number]} dy - y data domain.
 * @member {boolean} line_on - If line is visible.
 * @member {number} [point_size] - The size of data points.
 * @member {boolean} [default_indices] - Lines uses default generated x-axis values.
 */
interface DLineData {
  key: string;
  colour?: string;
  x: NdArray<TypedArray>;
  dx: [number, number];
  y: NdArray<TypedArray>;
  dy: [number, number];
  line_on: boolean;
  point_size?: number;
  default_indices?: boolean;
}

/**
 * Baton props.
 * @interface {object} BatonProps
 * @member {string} uuid - The uuid.
 * @member {string | null} uuid - The baton uuid.
 * @member {string[]} others - The other uuids.
 * @member {boolean} hasBaton - If baton is held.
 * @member {() => void} requestBaton - Handles baton request.
 * @member {(s: string) => void} approveBaton - Approves passing baton to given uuid.
 */
interface BatonProps {
  uuid: string;
  batonUuid: string | null;
  others: string[];
  hasBaton: boolean;
  requestBaton: () => void;
  approveBaton: (s: string) => void;
}

/**
 * The props for the `PlotSelectionProps` component.
 * @interface {object} PlotSelectionProps
 * @member {(selection: SelectionBase | null, broadcast?: boolean, clear?: boolean) => void} addSelection - Handles adding selection.
 * @member {SelectionBase[]} selections - The selections.
 * @member {BatonProps} batonProps - The baton props.
 */
interface PlotSelectionProps {
  addSelection: (
    selection: SelectionBase | null,
    broadcast?: boolean,
    clear?: boolean
  ) => void;
  selections: SelectionBase[];
  batonProps: BatonProps;
}

/**
 * The props for the `LinePlot` component.
 * @interface {object} LinePlotProps
 * @extends {LinePlotProps}
 * @member {DLineData[]} data - The line data.
 * @member {Domain} xDomain - The x data domain.
 * @member {Domain} yDomain - The y data domain.
 * @member {DAxesParameters} axesParameters - The axes parameters.
 */
interface LinePlotProps extends PlotSelectionProps {
  data: DLineData[];
  xDomain: Domain;
  yDomain: Domain;
  axesParameters: DAxesParameters;
}

/**
 * The props for the `ImagePlot` component.
 * @interface {object} ImagePlotProps
 * @extends {ImagePlotProps}
 * @member {NdArray<TypedArray>} values - The image data.
 * @member {DAxesParameters} axesParameters - The axes parameters.
 * @member {Aspect} [aspect] - The image plot aspect.
 */
interface ImagePlotProps extends PlotSelectionProps {
  values: NdArray<TypedArray>;
  axesParameters: DAxesParameters;
  aspect?: Aspect;
}

/**
 * The props for the `HeatmapPlot` component.
 * @interface {object} HeatmapPlotProps
 * @extends {PlotSelectionProps}
 * @member {Domain} domain - The data domain.
 * @member {ColorScaleType} heatmapScale - The colour scale type.
 * @member {ColorMap} [colourMap] - The colour map.
 */
interface HeatmapPlotProps extends ImagePlotProps {
  domain: Domain;
  heatmapScale: ColorScaleType;
  colourMap?: ColorMap;
}

/**
 * The props for the `ScatterPlotProps` component.
 * @interface {object} ScatterPlotProps
 * @extends {PlotSelectionProps}
 * @member {NdArray<TypedArray>} xData - The x data values for the scatter plot.
 * @member {NdArray<TypedArray>} yData - The y data values for the scatter plot.
 * @member {NdArray<TypedArray>} dataArray - The data values for third axis of the scatter plot.
 * @member {Domain} domain - The domain of the third axis.
 * @member {DAxesParameters} axesParameters - The axes parameters.
 * @member {ColorMap} [colourMap] - The colour map.
 */
interface ScatterPlotProps extends PlotSelectionProps {
  xData: NdArray<TypedArray>;
  yData: NdArray<TypedArray>;
  dataArray: NdArray<TypedArray>;
  domain: Domain;
  axesParameters: DAxesParameters;
  colourMap?: ColorMap;
}

/**
 * The props for the `SurfacePlot` component.
 * @interface {object} SurfacePlotProps
 * @extends {PlotSelectionProps}
 * @member {NdArray<TypedArray>} values - The data values for the surface plot.
 * @member {Domain} domain - The domain of the surface data.
 * @member {DAxesParameters} axesParameters - The axes parameters.
 * @member {ColorScaleType} surfaceScale - The colour scale type.
 * @member {ColorMap} [colourMap] - The colour map.
 */
interface SurfacePlotProps extends PlotSelectionProps {
  values: NdArray<TypedArray>;
  domain: Domain;
  axesParameters: DAxesParameters;
  surfaceScale: ColorScaleType;
  colourMap?: ColorMap;
}

/**
 * The parameters for a  `TableDisplay`.
 * @interface {object} TableDisplayParams
 * @member {TableDisplayType} [displayType] - The table display type.
 * @member {number} [numberDigits] - The number of digits to display for each data value.
 */
interface TableDisplayParams {
  displayType?: TableDisplayType;
  numberDigits?: number;
}

/**
 * The props for the `TableDisplay` component.
 * @interface {object} TableDisplayProps
 * @extends {PlotSelectionProps}
 * @member {number} cellWidth - The cell width.
 * @member {NdArray<TypedArray>} dataArray - The data for the table display.
 * @member {TableDisplayParams} [displayParams] - The parameters for the table display.
 */
interface TableDisplayProps extends PlotSelectionProps {
  cellWidth: number;
  dataArray: NdArray<TypedArray>;
  displayParams?: TableDisplayParams;
}

type AnyPlotProps =
  | LinePlotProps
  | ImagePlotProps
  | HeatmapPlotProps
  | ScatterPlotProps
  | SurfacePlotProps
  | TableDisplayProps;

/**
 * Represents Axes parameters.
 * @interface {object} DAxesParameters
 * @member {string} [xLabel] - the x-axis label.
 * @member {string} [yLabel] - the y-axis label.
 * @member {AxisScaleType} [xScale] - the x-axis scale type.
 * @member {AxisScaleType} [yScale] - the y-axis scale type.
 * @member {NdArray<TypedArray>} [xValues] - the x-axis values.
 * @member {NdArray<TypedArray>} [yValues] - the y-axis values.
 * @member {string} [title] - the plot title.
 */
interface DAxesParameters {
  xLabel?: string;
  yLabel?: string;
  xScale?: AxisScaleType;
  yScale?: AxisScaleType;
  xValues?: NdArray<TypedArray>;
  yValues?: NdArray<TypedArray>;
  title?: string;
}

/**
 *
 * Renders a plot.
 * @param {AnyPlotProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function AnyPlot(props: AnyPlotProps) {
  const interactionTime = useRef<number>(0);
  const interaction = measureInteraction();
  afterFrame(() => {
    interactionTime.current = interaction.end();
  });

  if ('surfaceScale' in props) {
    return <SurfacePlot {...props}></SurfacePlot>;
  } else if ('heatmapScale' in props) {
    return <HeatmapPlot {...props}></HeatmapPlot>;
  } else if ('values' in props) {
    return <ImagePlot {...props}></ImagePlot>;
  } else if ('xData' in props) {
    return <ScatterPlot {...props}></ScatterPlot>;
  } else if ('cellWidth' in props) {
    return <TableDisplay {...props}></TableDisplay>;
  } else if ('data' in props && props.data.length !== 0) {
    return <LinePlot {...props}></LinePlot>;
  }
  return null;
}

export type {
  AnyPlotProps,
  AxesParameters,
  BatonProps,
  DAxesParameters,
  DLineData,
  HeatmapPlotProps,
  ImagePlotProps,
  LinePlotProps,
  // eslint-disable-next-line react-refresh/only-export-components
  MP_NDArray,
  PlotSelectionProps,
  ScatterPlotProps,
  SurfacePlotProps,
  TableDisplayParams,
  TableDisplayProps,
  TableDisplayType,
};
export default AnyPlot;
