import '@h5web/lib/dist/styles.css';
import { ScaleType } from '@h5web/lib';
import {decode, encode} from 'messagepack';
import ndarray from 'ndarray';
import React from 'react';
import HeatmapPlot from './HeatmapPlot'
import ImagePlot from './ImagePlot'
import LinePlot from './LinePlot'
import ScatterPlot from './ScatterPlot'
import TableDisplay from './TableDisplay';

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

type PlotProps = LinePlotProps | ImagePlotProps | HeatmapPlotProps | ScatterPlotProps | TableDisplayProps;

class Plot extends React.Component<PlotProps> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log(error, errorInfo);
  }

  render() {
    if ("heatmapScale" in this.props) {
      let heatPlotParams = this.props as HeatmapPlotProps;
      return (
        <>
          <HeatmapPlot {...heatPlotParams} ></HeatmapPlot>
        </>
      );
    } else if ("values" in this.props) {
      const imagePlotParams = this.props as ImagePlotProps;
      return (
        <>
          <ImagePlot {...imagePlotParams} ></ImagePlot>
        </>
      );
    } else if ("xData" in this.props) {
      const scatterPlotParams = this.props as ScatterPlotProps;
      return (
        <>
          <ScatterPlot {...scatterPlotParams} ></ScatterPlot>
        </>
      );
    } else if ("cellWidth" in this.props) {
      const tableDisplayParams = this.props as TableDisplayProps;
      return (
        <>
          <TableDisplay {...tableDisplayParams} ></TableDisplay>
        </>
      );
    } else {
      const linePlotParams = this.props as LinePlotProps;
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
  lineAxesParams: DAxesParameters;
  imageData?: DImageData;
  imageAxesParams: DAxesParameters;
  scatterData?: DScatterData;
  scatterAxesParams: DAxesParameters;
  tableData?: DTableData;
};

class PlotComponent extends React.Component<PlotComponentProps, PlotStates> {
  public static defaultProps = {hostname: '127.0.0.1', port: '8000'};
  constructor(props: PlotComponentProps) {
    super(props);
    this.state = {
      multilineData: [],
      lineAxesParams: {},
      imageAxesParams: {},
      scatterAxesParams: {}
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
      const decoded_message = decode(event.data) as MultiLineDataMessage | ImageDataMessage
        | ScatterDataMessage | TableDataMessage | ClearPlotsMessage;
      console.log('decoded_message: ', decoded_message, typeof decoded_message);
      let report = true;
      if ('ml_data' in decoded_message) {
        console.log('data type is multiline data');
        const multiMessage = decoded_message as MultiLineDataMessage;
        this.plot_multiline_data(multiMessage);
      } else if ('al_data' in decoded_message) {
        console.log('data type is new line data to append');
        const appendLineMessage = decoded_message as AppendLineDataMessage;
        this.append_multiline_data(appendLineMessage);
      } else if ('im_data' in decoded_message) {
        console.log('data type is new image data');
        const newImageMessage = decoded_message as ImageDataMessage;
        this.plot_new_image_data(newImageMessage);
      } else if ('sc_data' in decoded_message) {
        console.log('data type is new scatter data');
        const newScatterMessage = decoded_message as ScatterDataMessage;
        this.plot_new_scatter_data(newScatterMessage);
      } else if ('ta_data' in decoded_message) {
        console.log('data type is new table data');
        const newTableMessage = decoded_message as TableDataMessage;
        this.display_new_table_data(newTableMessage);
      } else if ('plot_id' in decoded_message) {
        console.log('clearing data');
        this.clear_all_line_data();
      } else {
        report = false;
        console.log('data type unknown ');
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

  createDScatterData = (data: ScatterData): DScatterData => {
    const ii = data.dataArray as MP_NDArray;
    const i = this.createNdArray(ii);
    const xi = data.xData as MP_NDArray;
    const x = this.createNdArray(xi);
    const yi = data.yData as MP_NDArray;
    const y = this.createNdArray(yi);

    return {key: data.key,
      xData: x[0],
      yData: y[0],
      dataArray: i[0],
      domain: data.domain
    } as DScatterData;
  };

  append_multiline_data = (message: AppendLineDataMessage) => {
    console.log(message);
    const appendLineData = this.state.multilineData;
    const nullableData = message.al_data.map(l => this.createDLineData(l));
    nullableData.forEach(d => { if (d != null) { appendLineData.push(d)}})
    this.set_line_data(appendLineData, message.axes_parameters);
  };

  plot_multiline_data = (message: MultiLineDataMessage) => {
    console.log(message);
    const axes_parameters = this.createDAxesParameters(message.axes_parameters);
    let multilineData:DLineData[] = [];
    const nullableData = message.ml_data.map(l => this.createDLineData(l));
    nullableData.forEach(d => { if (d != null) { multilineData.push(d)}})
    this.set_line_data(multilineData, axes_parameters);
  };

  createDImageData = (data: ImageData | HeatmapData): DImageData | DHeatmapData => {
    const ii = data.values as MP_NDArray;
    const i = this.createNdArray(ii);
    if (isHeatmapData(data)) {
      let hmData = data as HeatmapData;
      return {key: hmData.key, heatmap_scale: hmData.heatmap_scale,
        domain: hmData.domain, values: i[0]} as DHeatmapData;
    } else {
      return {key: data.key, values: i[0]} as DImageData;
    }
  };

  createDTableData = (data: TableData): DTableData=> {
    const ii = data.dataArray as MP_NDArray;
    const i = this.createNdArray(ii);
    return {
      key: data.key,
      dataArray: i[0],
      cellWidth: data.cellWidth,
      displayParams: data.displayParams
    } as DTableData;
  };

  createDAxesParameters = (data: AxesParameters): DAxesParameters => {
    let x = undefined;
    let y = undefined;
    if (data.x_values != undefined) {
      const xi = data.x_values as MP_NDArray;
      const xArray = this.createNdArray(xi);
      x = xArray[0].data;
    }
    if (data.y_values != undefined) {
      const yi = data.y_values as MP_NDArray;
      const yArray = this.createNdArray(yi);
      y = yArray[0].data;
    }
    return {xLabel: data.x_label, yLabel: data.y_label, xScale: data.x_scale as ScaleType, title: data.title,
      yScale: data.y_scale as ScaleType, xValues: x, yValues: y} as DAxesParameters;
  };

  plot_new_image_data = (message: ImageDataMessage) => {
    console.log(message);
    const newImageData = this.createDImageData(message.im_data);
    console.log('newImageData', newImageData)
    const newImageAxesParams = this.createDAxesParameters(message.axes_parameters);
    console.log('new image for plot "', this.props.plot_id, '"');
    this.setState({imageData: newImageData, imageAxesParams: newImageAxesParams});
    console.log('adding new image: ', newImageData);
  };

  plot_new_scatter_data = (message: ScatterDataMessage) => {
    console.log(message);
    const newScatterData = this.createDScatterData(message.sc_data);
    console.log('newScatterData', newScatterData)
    const newScatterAxesParams = this.createDAxesParameters(message.axes_parameters);
    console.log('new scatter data for plot "', this.props.plot_id, '"');
    this.setState({scatterData: newScatterData, scatterAxesParams: newScatterAxesParams});
    console.log('adding new scatter data: ', newScatterData);
  };

  display_new_table_data = (message: TableDataMessage) => {
    console.log(message);
    const newTableData = this.createDTableData(message.ta_data);
    console.log('newTableData', newTableData)
    console.log('new table data for plot "', this.props.plot_id, '"');
    this.setState({tableData: newTableData});
    console.log('adding new table data: ', newTableData);
  };

  set_line_data = (multiline_data: DLineData[], axes_params: DAxesParameters) => {
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
      scatterData: undefined,
      tableData: undefined,
      lineAxesParams: {
        xScale: undefined,
        yScale: undefined,
        xLabel: undefined,
        yLabel: undefined,
        xValues: undefined,
        yValues: undefined,
        title: undefined
      },
      imageAxesParams: {
        xScale: undefined,
        yScale: undefined,
        xLabel: undefined,
        yLabel: undefined,
        xValues: undefined,
        yValues: undefined,
        title: undefined
      },
      scatterAxesParams: {
        xScale: undefined,
        yScale: undefined,
        xLabel: undefined,
        yLabel: undefined,
        xValues: undefined,
        yValues: undefined,
        title: undefined
      }
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
        const i = this.state.imageData as DHeatmapData;
        const plotProps : HeatmapPlotProps = {
          values: i.values,
          domain: i.domain,
          heatmapScale: i.heatmap_scale as ScaleType,
          axesParameters: this.state.imageAxesParams
        };
        return (
          <>
          <Plot {...plotProps} />
          </>
        );
      } else {
        const i = this.state.imageData as DImageData;
        const plotProps : ImagePlotProps = {
          values: i.values,
          axesParameters: this.state.imageAxesParams
        };
        return (
          <>
          <Plot {...plotProps} />
          </>
        );
      }
    }

    if (this.state.scatterData !== undefined) {
      const i = this.state.scatterData as DScatterData;
      const plotProps : ScatterPlotProps = {
        xData: i.xData,
        yData: i.yData,
        dataArray: i.dataArray,
        domain: i.domain,
        axesParameters: this.state.scatterAxesParams
      };
      return (
        <>
          <Plot {...plotProps} />
        </>
      );
    }

    if (this.state.tableData !== undefined) {
      const i = this.state.tableData as DTableData;
      const plotProps : TableDisplayProps = {
        dataArray: i.dataArray,
        cellWidth: i.cellWidth,
        displayParams: i.displayParams
      };
      return (
        <>
          <Plot {...plotProps} />
        </>
      );
    }

    const plotProps: LinePlotProps = {
      data: this.state.multilineData,
      xDomain: this.multilineXDomain,
      yDomain: this.multilineYDomain,
      axesParameters: this.state.lineAxesParams
    };
    return (
      <>
        <Plot {...plotProps} />
      </>
    );
  }
}

export default PlotComponent;

