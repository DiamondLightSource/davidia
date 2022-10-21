// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

interface PlotMessage {
  plot_id: string;
  type: number;
  params: any;
}

interface AxesParameters {
  x_scale: string;
  y_scale: string;
}

interface LineData {
  key: string;
  color: string;
  x: Array<number>;
  y: Array<number>;
  line_on: boolean;
  points_on: boolean;
  point_size: number;
}

interface ImageData {
  key: string;
  values: number[];
  domain: [number, number];
  shape: [number, number];
  heatmap_scale: string;
}

interface LineDataMessage {
  plot_id: string;
  data: LineData;
  axes_parameters: AxesParameters;
  type: string;
}

interface MultiLineDataMessage {
  plot_id: string;
  data: Array<LineData>;
  axes_parameters: AxesParameters;
  type: string;
}

interface ImageDataMessage {
  plot_id: string;
  data: ImageData;
  axes_parameters: AxesParameters;
  type: string;
}


interface ClearPlotsMessage {
  plot_id: string;
  type: string;
}
