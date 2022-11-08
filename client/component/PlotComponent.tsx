import '@h5web/lib/dist/styles.css';
import {
  AxisParams,
  CurveType,
  DataCurve,
  GlyphType,
  HeatmapVis,
  ResetZoomButton,
  ScaleType,
  SelectToZoom,
  TooltipMesh,
  VisCanvas,
} from '@h5web/lib';

import {decode} from 'messagepack';
import ndarray from 'ndarray';

import type {MaybeBigInt64Array, MaybeBigUint64Array, NdArray, TypedArray} from 'ndarray';

import React from 'react';
import {Fragment, ReactElement} from 'react';

const cwise = require('cwise');
const nanMinMax = cwise({
  args: ['array'],
  pre: function() {
    this.min = Number.POSITIVE_INFINITY;
    this.max = Number.NEGATIVE_INFINITY;
  },
  body: function(a: number) {
    if (!Number.isNaN(a)) {
      if (a < this.min) {
        this.min = a;
      }
      if (a > this.max) {
        this.max = a;
      }
    }
  },
  post: function() {
    if (this.min > this.max) {
      throw 'No valid numbers were compared';
    }
    return [this.min, this.max];
  }
});

type NdArrayMinMax = [NdArray<TypedArray>, [number, number]];
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
  domain: [number, number];
  heatmap_scale: string;
}

interface LinePlotParameters {
  data: DLineData[];
  xDomain: [number, number];
  yDomain: [number, number];
  axesParameters: AxesParameters;
}

interface HeatPlotParameters {
  values: NdArray<TypedArray>;
  domain: [number, number];
  heatmapScale: ScaleType;
  axesParameters: AxesParameters;
}

type PlotProps = {
  plotParameters: LinePlotParameters | HeatPlotParameters;
};

function isHeatPlotParameters(obj: LinePlotParameters | HeatPlotParameters) : boolean {
  return 'values' in obj;
}

function createDataCurve(d: DLineData, i: number) : JSX.Element {
  const COLORLIST = ["rgb(0, 0, 0)", "rgb(230, 159, 0)", "rgb(86, 180, 233)", "rgb(0, 158, 115)",
                     "rgb(240, 228, 66)", "rgb(0, 114, 178)", "rgb(213, 94, 0)", "rgb(204, 121, 167)"];
  let visible = true;
  let curveType = CurveType.LineAndGlyphs;
  if (!d.point_size) {
    d.point_size = 0;
    if (d.line_on) {
      curveType = CurveType.LineOnly;
    } else {
      visible = false;
    }
  } else if (!d.line_on) {
    curveType = CurveType.GlyphsOnly;
  }

  if (!d.color) {
    d.color = COLORLIST[i%COLORLIST.length];
  }
  const x = Array.from(d.x.data);
  const y = d.y.data;
  
  return <DataCurve
    key={`data_curve_${i}`}
    abscissas={x}
    ordinates={y}
    color={d.color}
    curveType={curveType}
    glyphType={GlyphType.Circle}
    glyphSize={d.point_size}
    visible={visible}
  />;
}


class Plot extends React.Component<PlotProps> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log(error, errorInfo);
  }

  render() {
    if (isHeatPlotParameters(this.props.plotParameters)) {
      const heatPlotParams = this.props.plotParameters as HeatPlotParameters;
      return (
        <>
          <HeatmapVis
            dataArray={heatPlotParams.values}
            domain={heatPlotParams.domain}
            colorMap="Warm"
            scaleType={heatPlotParams.heatmapScale}
            layout="fill"
            showGrid
            abscissaParams={ {scaleType: heatPlotParams.axesParameters.x_scale, label: heatPlotParams.axesParameters.x_label} as AxisParams}
            ordinateParams={ {scaleType: heatPlotParams.axesParameters.y_scale, label: heatPlotParams.axesParameters.y_label} as AxisParams}
          ></HeatmapVis>
        </>
      );
    } else {
      const linePlotParams = this.props.plotParameters as LinePlotParameters;
      const tooltipText = (x: number, y: number): ReactElement<string> => {
        return <p>{x.toPrecision(8)}, {y.toPrecision(8)}</p>;
      };
      return (
        <>
          <VisCanvas
            abscissaConfig={{
              visDomain: linePlotParams.xDomain,
              showGrid: true,
              scaleType: linePlotParams.axesParameters.x_scale as ScaleType,
              label: linePlotParams.axesParameters.x_label,
            }}
            ordinateConfig={{
              visDomain: linePlotParams.yDomain,
              showGrid: true,
              scaleType: linePlotParams.axesParameters.y_scale as ScaleType,
              label: linePlotParams.axesParameters.y_label,
            }} 
            >
            {linePlotParams.data.map((d, index) => (createDataCurve(d, index)))}
            <TooltipMesh renderTooltip={tooltipText} />
            <SelectToZoom />
            <ResetZoomButton />
          </VisCanvas>
        </>
      );
    }
  }
}

type PlotComponentProps = {
  plot_id: string;
  hostname: string;
  port: string;
};

type PlotStates = {
  multilineData: DLineData[];
  lineAxesParams: AxesParameters;
  imageData?: DImageData;
  imageAxesParams: AxesParameters;
};

class PlotComponent extends React.Component<PlotComponentProps, PlotStates> {
  public static defaultProps = {hostname: '127.0.0.1', port: '8000'};
  constructor(props: PlotComponentProps) {
    super(props);
    this.state = {
      multilineData: [],
      lineAxesParams: {x_scale: ScaleType.Linear, y_scale: ScaleType.Linear},
      imageAxesParams: {x_scale: ScaleType.Linear, y_scale: ScaleType.Linear}
    };
  }
  socket: WebSocket = new WebSocket(
    `ws://${this.props.hostname}:${this.props.port}/plot/${this.props.plot_id}`

  );
  multilineXDomain: [number, number] = [0, 0];
  multilineYDomain: [number, number] = [0, 0];

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log(error, errorInfo);
  }

  waitForOpenSocket = async (socket: WebSocket) => {
    return new Promise<void>(resolve => {
      if (socket.readyState !== socket.OPEN) {
        socket.addEventListener('open', _ => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  componentDidMount() {
    this.socket.binaryType = 'arraybuffer';
    this.socket.onopen = () => {
      console.log('WebSocket Client Connected');
      const initStatus: PlotMessage = {
        plot_id: this.props.plot_id,
        type: "status",
        params: "ready",
        plot_config: {},
      };
      this.socket.send(JSON.stringify(initStatus));
    };
    this.socket.onmessage = (event: MessageEvent) => {
      const decoded_message = decode(event.data) as LineDataMessage | MultiLineDataMessage
        | ImageDataMessage | ClearPlotsMessage;
      console.log('decoded_message: ', decoded_message, typeof decoded_message);
      let report = true;
      const message_type = decoded_message.type as string;
      switch (message_type) {
        case 'MultiLineDataMessage':
          console.log('data type is multiline data');
          const multiMessage = decoded_message as MultiLineDataMessage;
          this.plot_multiline_data(multiMessage);
          break;
        case 'LineDataMessage':
          console.log('data type is new line data');
          const newLineMessage = decoded_message as LineDataMessage;
          this.plot_new_line_data(newLineMessage);
          break;
        case 'ImageDataMessage':
          console.log('data type is new image data');
          const newImageMessage = decoded_message as ImageDataMessage;
          this.plot_new_image_data(newImageMessage);
          break;
        case 'ClearPlotsMessage':
          console.log('clearing data');
          this.clear_all_line_data();
          break;
        default:
          report = false;
          console.log('data type is: ', message_type);
      }
      if (report) {
        const status: PlotMessage = {
          plot_id: this.props.plot_id,
          type: "status",
          params: "ready",
          plot_config: {},
        };
        this.socket.send(JSON.stringify(status));
      }
    };
  }

  createNdArray = (a: MP_NDArray) : NdArrayMinMax => {
    const dtype = a.dtype;
    if (dtype === '<i8' || dtype === '<u8') {
      const limit = BigInt(2) ** BigInt(64);
      var mb: [bigint, bigint] = [limit, -limit];
      const minMax = function(e : bigint) : void {
        if (e < mb[0]) {
          mb[0] = e;
        }
        if (e > mb[1]) {
          mb[1] = e;
        }
      }
      var ba: BigInt64Array | BigUint64Array;
      if (dtype === '<i8') {
        const bi = new BigInt64Array(a.data);
        bi.forEach(minMax);
        ba = bi;
      } else {
        const bu = new BigUint64Array(a.data);
        bu.forEach(minMax);
        ba = bu;
      }
      const ptp = mb[1] - mb[0];
      if (mb[0] < -limit || mb[1] > limit) {
        throw "Extrema of 64-bit integer array are too large to represent as float 64";
      }
      if (ptp > Number.MAX_SAFE_INTEGER) {
        console.warn("64-bit integer array has range too wide to preserve precision");
      }
      const f = new Float64Array(ba);
      return [ndarray(f, a.shape), [Number(mb[0]), Number(mb[1])]] as NdArrayMinMax;
    }

    let b: TypedArray;
    switch (dtype) {
      case "|i1":
         b = new Int8Array(a.data);
         break;
       case "<i2":
         b = new Int16Array(a.data);
         break;
       case "<i4":
         b = new Int32Array(a.data);
         break;
       case "|u1":
         b = new Uint8Array(a.data);
         break;
       case "<u2":
         b = new Uint16Array(a.data);
         break;
       case "<u4":
         b = new Uint32Array(a.data);
         break;
       case "<f4":
         b = new Float32Array(a.data);
         break;
       default:
       case "<f8":
         b = new Float64Array(a.data);
         break;
    }
    const nd = ndarray(b, a.shape);
    return [nd, nanMinMax(nd)]  as NdArrayMinMax;
  };

  createDLineData = (data: LineData): DLineData|null => {
    const xi = data.x as MP_NDArray;
    const x = this.createNdArray(xi);
    const yi = data.y as MP_NDArray;
    const y = this.createNdArray(yi);

    if (x[0].size == 0 || x[0].size == 0) {
      return null;
    }
    return {key:data.key, color:data.color, x:x[0], dx:x[1], y:y[0], dy:y[1],
      line_on:data.line_on, point_size:data.point_size} as DLineData;
  };

  plot_multiline_data = (message: MultiLineDataMessage) => {
    console.log(message);
    const nullableData = message.data.map(l => this.createDLineData(l));
    const multilineData:DLineData[] = [];
    nullableData.forEach(d => { if (d != null) { multilineData.push(d)}})
    this.set_line_data(multilineData, message.axes_parameters);
  };

  plot_new_line_data = (message: LineDataMessage) => {
    console.log(message);
    const newLineData = this.createDLineData(message.data);
    if (newLineData != null) {
      this.state.multilineData.push(newLineData);
    }
    this.set_line_data(this.state.multilineData, message.axes_parameters);
  };

  createDImageData = (data: ImageData): DImageData=> {
    const ii = data.values as MP_NDArray;
    const i = this.createNdArray(ii);
    return {key: data.key, heatmap_scale: data.heatmap_scale,
      domain: data.domain, values: i[0]} as DImageData;
  };

  plot_new_image_data = (message: ImageDataMessage) => {
    console.log(message);
    const newImageData = this.createDImageData(message.data);
    console.log('newImageData', newImageData)
    const newImageAxesParams = message.axes_parameters
    console.log('newImageAxesParams', newImageAxesParams)
    console.log('new image for plot "', this.props.plot_id, '"');
    this.setState({imageData: newImageData, imageAxesParams: newImageAxesParams});
    console.log('adding new image: ', newImageData);
  };

  set_line_data = (multiline_data: DLineData[], axes_params: AxesParameters) => {
    this.multilineXDomain = this.calculateMultiXDomain(multiline_data);
    this.multilineYDomain = this.calculateMultiYDomain(multiline_data);
    console.log('setting line state with domains', this.multilineXDomain, this.multilineYDomain);
    this.setState({multilineData: multiline_data, lineAxesParams: axes_params});
   };

  calculateMultiXDomain(multilineData: DLineData[]): [number, number] {
    console.log('calculating multi x domain ', multilineData);
    const mins = multilineData.map(l => l.dx[0]);
    const maxs = multilineData.map(l => l.dx[1]);
    if (mins.length == 1) {
      return [mins[0], maxs[0]];
    }
    return [Math.min(...mins), Math.max(...maxs)];
  };

  calculateMultiYDomain = (multilineData: DLineData[]): [number, number] => {
    console.log('calculating multi y domain ', multilineData);
    const mins = multilineData.map(l => l.dy[0]);
    const maxs = multilineData.map(l => l.dy[1]);
    if (mins.length == 1) {
      return [mins[0], maxs[0]];
    }
    return [Math.min(...mins), Math.max(...maxs)];
  };

  clear_all_line_data = () => {
    this.multilineXDomain = [0, 1];
    this.multilineYDomain = [0, 1];
    this.setState({
      multilineData: [],
      imageData: undefined,
      lineAxesParams: {x_scale: ScaleType.Linear, y_scale: ScaleType.Linear},
      imageAxesParams: {x_scale: ScaleType.Linear, y_scale: ScaleType.Linear}
    });
    console.log(
      'data cleared: ',
      this.state.multilineData,
      this.state.lineAxesParams,
      this.state.imageAxesParams,
      this.multilineXDomain,
      this.multilineYDomain
    );
  };

  render() {
    if (this.state.imageData !== undefined) {
      const i = this.state.imageData;
      const plotParams : HeatPlotParameters = {
        values: i.values,
        domain: i.domain,
        heatmapScale: i.heatmap_scale as ScaleType,
        axesParameters: this.state.imageAxesParams
      };
      return (
        <>
          <Plot plotParameters={plotParams} />
        </>
      );
    }
    const plotParams: LinePlotParameters = {
      data: this.state.multilineData,
      xDomain: this.multilineXDomain,
      yDomain: this.multilineYDomain,
      axesParameters: this.state.lineAxesParams
    };
    return (
      <>
        <Plot plotParameters={plotParams} />
      </>
    );
  }
}

export default PlotComponent;

