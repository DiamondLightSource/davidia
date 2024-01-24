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
 * @member {boolean} nd - If it is an n-dimensional array.
 * @member {string} [dtype] - The data type.
 * @member {number[]} [shape] - The shape of the data.
 * @member {ArrayBuffer} [data] - The data.
 */
interface MP_NDArray {
  // see fastapi_utils.py
  /** If it is an n-dimensional array */
  nd: boolean;
  /** The data type */
  dtype: string;
  /** The shape of the data */
  shape: number[];
  /** The data */
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
  /** The label for the x-axis */
  x_label?: string;
  /** The label for the y-axis */
  y_label?: string;
  /** The x-axis scale type */
  x_scale?: AxisScaleType;
  /** The y-axis scale type */
  y_scale?: AxisScaleType;
  /** The x-axis values */
  x_values?: MP_NDArray;
  /** The y-axis values */
  y_values?: MP_NDArray;
  /** The plot title */
  title?: string;
}

/**
 * Represents line data.
 * @interface {object} DLineData
 * @member {string} key - The object key.
 * @member {string} [colour] - The line colour.
 * @member {NdArray<TypedArray>} x - x coordinates.
 * @member {[number, number]} dx - x data domain.
 * @member {NdArray<TypedArray>} y - y coordinates.
 * @member {[number, number]} dy - y data domain.
 * @member {boolean} line_on - If line is visible.
 * @member {number} [point_size] - The size of data points.
 * @member {boolean} [default_indices] - Line uses default generated x-axis values.
 */
interface DLineData {
  /** The object key */
  key: string;
  /** The line colour (optional) */
  colour?: string;
  /** x coordinates */
  x: NdArray<TypedArray>;
  /** x data domain */
  dx: [number, number];
  /** y coordinates */
  y: NdArray<TypedArray>;
  /** y data domain */
  dy: [number, number];
  /** If line is visible */
  line_on: boolean;
  /** The size of the data points (optional) */
  point_size?: number;
  /** Line uses default generated x-axis values (optional) */
  default_indices?: boolean;
}

/**
 * Baton props.
 * @interface {object} BatonProps
 * @member {string} uuid - The universally unique identifier (uuid) of the client.
 * @member {string | null} uuid - The uuid of the current baton holder.
 * @member {string[]} others - The other uuids.
 * @member {boolean} hasBaton - If client holds baton.
 * @member {() => void} requestBaton - Handles baton request.
 * @member {(s: string) => void} approveBaton - Approves passing baton to client with given uuid.
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
 * The props for the `PlotSelectionProps` component.
 * @interface {object} PlotSelectionProps
 * @member {(selection: SelectionBase | null, broadcast?: boolean, clear?: boolean) => void} addSelection - Handles adding selection.
 * @member {SelectionBase[]} selections - The selections.
 * @member {BatonProps} [batonProps] - The baton props.
 */
interface PlotSelectionProps {
  /** Handles adding selection */
  addSelection?: (
    selection: SelectionBase | null,
    broadcast?: boolean,
    clear?: boolean
  ) => void;
  /** The selections */
  selections: SelectionBase[];
  /** The baton props */
  batonProps?: BatonProps;
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
  /** The line data */
  data: DLineData[];
  /** The x data domain */
  xDomain: Domain;
  /** The y data domain */
  yDomain: Domain;
  /** The axes parameters */
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
  /** The image data */
  values: NdArray<TypedArray>;
  /** The axes parameters */
  axesParameters: DAxesParameters;
  /** The image plot aspect (optional) */
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
  /** The data domain */
  domain: Domain;
  /** The colour scale type */
  heatmapScale: ColorScaleType;
  /** The colour map (optional) */
  colourMap?: ColorMap;
}

/**
 * The props for the `ScatterPlotProps` component.
 * @interface {object} ScatterPlotProps
 * @extends {PlotSelectionProps}
 * @member {NdArray<TypedArray>} xData - The x data values for the scatter plot.
 * @member {NdArray<TypedArray>} yData - The y data values for the scatter plot.
 * @member {NdArray<TypedArray>} dataArray - The z data values for the scatter plot.
 * @member {Domain} domain - The domain of the z axis.
 * @member {DAxesParameters} axesParameters - The axes parameters.
 * @member {ColorMap} [colourMap] - The colour map.
 */
interface ScatterPlotProps extends PlotSelectionProps {
  /** The x data values for the scatter plot */
  xData: NdArray<TypedArray>;
  /** The y data values for the scatter plot */
  yData: NdArray<TypedArray>;
  /** The z data values for the scatter plot */
  dataArray: NdArray<TypedArray>;
  /** The domain of the z axis */
  domain: Domain;
  /** The axes parameters */
  axesParameters: DAxesParameters;
  /** The colour map (optional) */
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
  /** The data values for the surface plot */
  values: NdArray<TypedArray>;
  /** The domain of the surface data */
  domain: Domain;
  /** The axes parameters */
  axesParameters: DAxesParameters;
  /** The colour scale type */
  surfaceScale: ColorScaleType;
  /** The colour map (optional) */
  colourMap?: ColorMap;
}

/**
 * The parameters for a  `TableDisplay`.
 * @interface {object} TableDisplayParams
 * @member {TableDisplayType} [displayType] - The table display type.
 * @member {number} [numberDigits] - The number of digits to display for each data value.
 */
interface TableDisplayParams {
  /** The table display type (optional) */
  displayType?: TableDisplayType;
  /** The number of digits to display for each data value (optional) */
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
  /** The cell width */
  cellWidth: number;
  /** The data for the table display */
  dataArray: NdArray<TypedArray>;
  /** The parameters for the table display (optional) */
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
  /** The x-axis label (optional) */
  xLabel?: string;
  /** The y-axis label (optional) */
  yLabel?: string;
  /** The x-axis scale type (optional) */
  xScale?: AxisScaleType;
  /** The y-axis scale type (optional) */
  yScale?: AxisScaleType;
  /** The x-axis values (optional) */
  xValues?: NdArray<TypedArray>;
  /** The y-axis values (optional) */
  yValues?: NdArray<TypedArray>;
  /** The plot title (optional) */
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
