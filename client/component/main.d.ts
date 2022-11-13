type StatusType =  "ready" | "busy";

type MsgType = "clear_data" | "new_image_data" | "new_line_data" | "new_multiline_data" | "status";

type NdArrayMinMax = [NdArray<TypedArray>, [number, number]];

interface MP_NDArray { // from https://github.com/lebedov/msgpack-numpy
  nd: boolean;
  dtype: string;
  shape: Array<number>;
  data: ArrayBuffer;
}

interface PlotMessage {
  plot_id: string;
  type: MsgType;
  params: any;
  plot_config: any;
}

interface AxesParameters {
  x_label?: string;
  y_label?: string;
  x_scale: string;
  y_scale: string;
}

interface LineData {
  key: string;
  color?: string;
  x: MP_NDArray;
  y: MP_NDArray;
  line_on: boolean;
  point_size?: number;
}

interface DataMessage {
  axes_parameters: AxesParameters;
}

interface MultiLineDataMessage extends DataMessage {
  ml_data: Array<LineData>;
}

interface ImageData {
  key: string;
  values: MP_NDArray;
}

interface HeatmapData extends ImageData {
  domain: [number, number];
  heatmap_scale: string;
}

interface ImageDataMessage extends DataMessage {
  im_data: ImageData;
}

interface ImagePlotParameters {
  values: NdArray<TypedArray>;
  domain?: [number, number];
  heatmapScale?: ScaleType;
  axesParameters: AxesParameters;
}

interface HeatPlotParameters extends ImagePlotParameters {
  domain: [number, number];
  heatmapScale: ScaleType;
}

interface LinePlotParameters {
  data: DLineData[];
  xDomain: [number, number];
  yDomain: [number, number];
  axesParameters: AxesParameters;
}

interface DLineData {
  color?: string;
  x: NdArray<TypedArray>;
  dx: [number, number];
  y: NdArray<TypedArray>;
  dy: [number, number];
  line_on: boolean;
  point_size?: number;
}

interface DImageData {
  key: string;
  values: NdArray<TypedArray>;
  domain?: [number, number];
  heatmap_scale?: string;
}

interface ClearPlotsMessage {
  plot_id: string;
}
