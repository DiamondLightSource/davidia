type MsgType =
  | 'status'
  | 'new_multiline_data'
  | 'append_line_data'
  | 'new_image_data'
  | 'new_scatter_data'
  | 'new_table_data'
  | 'new_selection_data'
  | 'append_selection_data'
  | 'clear_selection_data'
  | 'clear_data'
  | 'client_new_selection';

type StatusType = 'ready' | 'busy';

type ColorMap = import('@h5web/lib').ColorMap;
type CustomDomain = import('@h5web/lib').CustomDomain;
type Domain = import('@h5web/lib').Domain;
type Rect = import('@h5web/lib').Rect;

type NdArray<T> = import('ndarray').NdArray<T>;
type TypedArray = import('ndarray').TypedArray;
type NdArrayMinMax = [NdArray<TypedArray>, [number, number]];

interface MP_NDArray {
  // see fast_utils.py
  nd: boolean;
  dtype: string;
  shape: number[];
  data: ArrayBuffer;
}

interface PlotMessage {
  plot_id: string;
  type: MsgType;
  params: unknown;
  plot_config: unknown;
}

interface LineData {
  key: string;
  color?: string;
  x: MP_NDArray;
  y: MP_NDArray;
  line_on: boolean;
  point_size?: number;
}

interface ImageData {
  key: string;
  values: MP_NDArray;
  aspect?: Aspect;
}

interface HeatmapData extends ImageData {
  domain: Domain;
  heatmap_scale: string;
  colorMap: ColorMap;
}

interface ScatterData {
  key: string;
  xData: MP_NDArray;
  yData: MP_NDArray;
  dataArray: MP_NDArray;
  domain: Domain;
  colorMap?: ColorMap;
}

interface TableData {
  key: string;
  dataArray: MP_NDArray;
  cellWidth: number;
  displayParams?: TableDisplayParams;
}

interface DataMessage {
  axes_parameters: AxesParameters;
}

interface MultiLineDataMessage extends DataMessage {
  ml_data: LineData[];
}

interface AppendLineDataMessage extends DataMessage {
  al_data: LineData[];
}

interface ImageDataMessage extends DataMessage {
  im_data: ImageData;
}

interface ScatterDataMessage extends DataMessage {
  sc_data: ScatterData;
}

interface TableDataMessage extends DataMessage {
  ta_data: TableData;
}

interface SelectionBase {
  name: string;
  color?: string;
  alpha: number;
  fixed: boolean;
  start: [number, number];
}

interface SelectionsMessage extends DataMessage {
  set_selections: SelectionBase[];
}

interface AppendSelectionsMessage extends DataMessage {
  append_selections: SelectionBase[];
}

interface ClientSelectionMessage extends DataMessage {
  selection: SelectionBase;
}

interface PlotSelectionProps {
  addSelection: (selection: SelectionBase) => void;
  selections: SelectionBase[];
}

interface LinePlotProps extends PlotSelectionProps {
  data: DLineData[];
  xDomain: Domain;
  yDomain: Domain;
  axesParameters: DAxesParameters;
}

interface ImagePlotProps extends PlotSelectionProps {
  values: NdArray<TypedArray>;
  axesParameters: DAxesParameters;
  aspect?: Aspect;
}

interface HeatmapPlotProps extends ImagePlotProps {
  domain: Domain;
  heatmapScale: ScaleType;
  colorMap?: ColorMap;
}

interface ScatterPlotProps extends PlotSelectionProps {
  xData: NdArray<TypedArray>;
  yData: NdArray<TypedArray>;
  dataArray: NdArray<TypedArray>;
  domain: Domain;
  axesParameters: DAxesParameters;
  colorMap?: ColorMap;
}

interface TableDisplayProps extends PlotSelectionProps {
  cellWidth: number;
  dataArray: NdArray<TypedArray>;
  displayParams?: TableDisplayParams;
}

interface DLineData {
  key: string;
  color?: string;
  x: NdArray<TypedArray>;
  dx: [number, number];
  y: NdArray<TypedArray>;
  dy: [number, number];
  line_on: boolean;
  point_size?: number;
  default_indices?: boolean = false;
}

interface DImageData {
  key: string;
  values: NdArray<TypedArray>;
  aspect?: Aspect;
}

interface DHeatmapData extends DImageData {
  domain: [number, number];
  heatmap_scale: string;
  colorMap?: ColorMap;
}

interface DScatterData {
  key: string;
  xData: NdArray<TypedArray>;
  yData: NdArray<TypedArray>;
  dataArray: NdArray<TypedArray>;
  domain: [number, number];
  colorMap?: ColorMap;
}

interface DTableData {
  key: string;
  dataArray: NdArray<TypedArray>;
  cellWidth: number;
  displayParams?: TableDisplayParams;
}

interface DAxesParameters {
  xLabel?: string;
  yLabel?: string;
  xScale?: ScaleType;
  yScale?: ScaleType;
  xValues?: NdArray<TypedArray>;
  yValues?: NdArray<TypedArray>;
  title?: string;
}

interface ClearPlotsMessage {
  plot_id: string;
}
