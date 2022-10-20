// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

interface PlotMessage {
  plot_id: string;
  type: number;
  params: any;
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
  id: string;
  values: number[];
  domain: [number, number];
  shape: [number, number];
}

interface LineDataMessage {
  plot_id: string;
  data: LineData;
  type: string;
}

interface MultiLineDataMessage {
  plot_id: string;
  data: Array<LineData>;
  type: string;
}

interface ImageDataMessage {
  plot_id: string;
  data: ImageData;
  type: string;
}

interface ClearPlotsMessage {
  plot_id: string;
  type: string;
}
