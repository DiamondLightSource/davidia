import '@h5web/lib/dist/styles.css';
import { RgbVis, ScaleType } from '@h5web/lib';
import {decode, encode} from 'messagepack';
import ndarray from 'ndarray';
import React from 'react';
import HeatPlot from './HeatPlot'
import LinePlot from './LinePlot'

import type {TypedArray} from 'ndarray';


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

function isHeatmapData(obj : HeatmapData | ImageData | DImageData) : boolean {
	return ('domain' in obj && 'heatmap_scale' in obj);
}

type PlotProps = {
  plotType: 'line' | 'image' | 'heat'
  plotParameters: LinePlotParameters | ImagePlotParameters | HeatPlotParameters;
};

class Plot extends React.Component<PlotProps> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log(error, errorInfo);
  }

  render() {
    if (this.props.plotType == 'heat') {
      let heatPlotParams = this.props.plotParameters as HeatPlotParameters;
      return (
        <>
        <HeatPlot {...heatPlotParams} ></HeatPlot>
        </>
      );

      } else if (this.props.plotType == 'image') {
        const imagePlotParams = this.props.plotParameters as ImagePlotParameters;
        return (
          <>
            <RgbVis dataArray={imagePlotParams.values} ></RgbVis>
          </>
        );

    } else {
      const linePlotParams = this.props.plotParameters as LinePlotParameters;
      return (
        <>
          <LinePlot {...linePlotParams} ></LinePlot>
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
      this.socket.send(encode(initStatus));
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
        this.socket.send(encode(status));
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

  createDImageData = (data: ImageData | HeatmapData): DImageData=> {
    const ii = data.values as MP_NDArray;
    const i = this.createNdArray(ii);
    if (isHeatmapData(data)) {
      let hmData = data as HeatmapData;
      return {key: hmData.key, heatmap_scale: hmData.heatmap_scale,
        domain: hmData.domain, values: i[0]} as DImageData;
    }
    else {
      return {key: data.key, values: i[0]} as DImageData;
    }
  };

  plot_new_image_data = (message: ImageDataMessage) => {
    console.log(message);
    const newImageData = this.createDImageData(message.data);
    console.log('newImageData', newImageData)
    const newImageAxesParams = message.axes_parameters
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
      if (isHeatmapData(this.state.imageData)) {
      const i = this.state.imageData as HeatmapData;
      const plotParams : HeatPlotParameters = {
        values: i.values,
        domain: i.domain,
        heatmapScale: i.heatmap_scale as ScaleType,
        axesParameters: this.state.imageAxesParams
      };
      return (
        <>
          <Plot plotType='heat' plotParameters={plotParams} />
        </>
      );
    } else {
      const i = this.state.imageData as ImageData;
      const plotParams : ImagePlotParameters = {
        values: i.values,
        axesParameters: this.state.imageAxesParams
      };
      return (
        <>
          <Plot plotType='image' plotParameters={plotParams} />
        </>
      );
    }
    }
    const plotParams: LinePlotParameters = {
      data: this.state.multilineData,
      xDomain: this.multilineXDomain,
      yDomain: this.multilineYDomain,
      axesParameters: this.state.lineAxesParams
    };
    return (
      <>
        <Plot plotType='line' plotParameters={plotParams} />
      </>
    );
  }
}

export default PlotComponent;

