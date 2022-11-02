// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

interface PlotMessage {
  plot_id: string;
  type: string;
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
  x: Array<number>;
  y: Array<number>;
  line_on: boolean;
  point_size?: number;
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

interface ImageData {
  key: string;
  values: number[];
  domain: [number, number];
  shape: [number, number];
  heatmap_scale: string;
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
