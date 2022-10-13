// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

interface PlotMessage {
  plot_id: string;
  type: number;
  params: any;
}

interface LineData {
  id: string;
  colour: string;
  x: Array<number>;
  y: Array<number>;
  curve_type: import('@h5web/lib').CurveType;
}

interface LineDataMessage {
  type: string;
  plot_id: string;
  data: LineData;
}

interface MultiLineDataMessage {
  type: string;
  plot_id: string;
  data: Array<LineData>;
}

interface ClearPlotsMessage {
  type: string;
  plot_id: string;
}
