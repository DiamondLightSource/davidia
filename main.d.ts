enum StatusType {
  Ready = "ready",
  Busy = "busy",
}

enum MsgType {
  ClearData = "clear_data",
  NewImageData = "new_image_data",
  NewLineData = "new_line_data",
  NewMultilineData = "new_multiline_data",
  Status = "status",
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
  x: Array<number>;
  y: Array<number>;
  line_on: boolean;
  point_size?: number;
}

interface LineDataMessage {
  data: LineData;
  axes_parameters: AxesParameters;
  type: string;
}

interface MultiLineDataMessage {
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
  data: ImageData;
  axes_parameters: AxesParameters;
  type: string;
}


interface ClearPlotsMessage {
  plot_id: string;
  type: string;
}
