type MsgType =
  | 'status'
  | 'new_multiline_data'
  | 'append_line_data'
  | 'new_image_data'
  | 'new_scatter_data'
  | 'new_surface_data'
  | 'new_table_data'
  | 'new_selection_data'
  | 'append_selection_data'
  | 'clear_selection_data'
  | 'clear_data'
  | 'client_new_selection'
  | 'client_update_selection';

type StatusType = 'ready' | 'busy';

type InteractionModeType = 'panAndWheelZoom' | 'selectToZoom' | 'selectRegion';

type ColorMap = import('@h5web/lib').ColorMap;
type CustomDomain = import('@h5web/lib').CustomDomain;
type Domain = import('@h5web/lib').Domain;
type Rect = import('@h5web/lib').Rect;

type NdArray<T> = import('ndarray').NdArray<T>;
type TypedArray = import('ndarray').TypedArray;

interface MP_NDArray {
  // see fastapi_utils.py
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
  colour?: string;
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
  colourMap: ColorMap;
}

interface ScatterData {
  key: string;
  xData: MP_NDArray;
  yData: MP_NDArray;
  dataArray: MP_NDArray;
  domain: Domain;
  colourMap?: ColorMap;
}

interface SurfaceData {
  key: string;
  values: MP_NDArray;
  domain: Domain;
  surface_scale: string;
  colourMap: ColorMap;
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

interface SurfaceDataMessage extends DataMessage {
  su_data: SurfaceData;
}

interface TableDataMessage extends DataMessage {
  ta_data: TableData;
}

type _HandleChangeFunction = (
  i: number,
  position: [number | undefined, number | undefined]
) => SelectionBase;

interface SelectionBase {
  readonly id: string;
  name: string;
  colour?: string;
  alpha: number;
  fixed: boolean;
  start: [number, number];
  asDashed?: boolean;
  getPoints?: () => Vector3[];
  onHandleChange: _HandleChangeFunction;
  toString: () => string = () => '';
}

interface SelectionsMessage {
  set_selections: SelectionBase[];
}

interface UpdateSelectionsMessage {
  update_selections: SelectionBase[];
}

interface ClearSelectionsMessage {
  selection_ids: str[];
}

interface ClientSelectionMessage {
  selection: SelectionBase;
}

interface PlotSelectionProps {
  addSelection: (selection: SelectionBase, broadcast?: boolean) => void;
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
  colourMap?: ColorMap;
}

interface ScatterPlotProps extends PlotSelectionProps {
  xData: NdArray<TypedArray>;
  yData: NdArray<TypedArray>;
  dataArray: NdArray<TypedArray>;
  domain: Domain;
  axesParameters: DAxesParameters;
  colourMap?: ColorMap;
}

interface SurfacePlotProps extends PlotSelectionProps {
  values: NdArray<TypedArray>;
  domain: Domain;
  axesParameters: DAxesParameters;
  surfaceScale: ScaleType;
  colourMap?: ColorMap;
}

interface TableDisplayProps extends PlotSelectionProps {
  cellWidth: number;
  dataArray: NdArray<TypedArray>;
  displayParams?: TableDisplayParams;
}

interface DLineData {
  key: string;
  colour?: string;
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
  colourMap?: ColorMap;
}

interface DScatterData {
  key: string;
  xData: NdArray<TypedArray>;
  yData: NdArray<TypedArray>;
  dataArray: NdArray<TypedArray>;
  domain: [number, number];
  colourMap?: ColorMap;
}

interface DSurfaceData {
  key: string;
  values: NdArray<TypedArray>;
  domain: [number, number];
  surface_scale: string;
  colourMap?: ColorMap;
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
