type StatusType =  "ready" | "busy";

type MsgType = "clear_data" | "new_image_data" | "new_line_data" | "new_multiline_data" | "status";

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

interface DataMessage {
  data: any;
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
  values: number[];
  domain: [number, number];
  shape: [number, number];
  heatmap_scale: string;
}

interface ImageDataMessage extends DataMessage {
  data: ImageData;
}


interface ClearPlotsMessage {
  plot_id: string;
  type: MsgType;
}
