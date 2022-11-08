type StatusType =  "ready" | "busy";

type MsgType = "clear_data" | "new_image_data" | "new_line_data" | "new_multiline_data" | "status";

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
  type: MsgType;
}

interface LineDataMessage extends DataMessage {
  data: LineData;
}

interface MultiLineDataMessage extends DataMessage {
  data: Array<LineData>;
}

interface ImageData {
  key: string;
  values: MP_NDArray;
  domain: [number, number];
  heatmap_scale: string;
}

interface ImageDataMessage extends DataMessage {
  data: ImageData;
}

interface ClearPlotsMessage {
  plot_id: string;
  type: MsgType;
}
