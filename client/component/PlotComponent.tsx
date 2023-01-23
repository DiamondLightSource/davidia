import '@h5web/lib/dist/styles.css';
import { ScaleType } from '@h5web/lib';
import { decode, encode } from 'messagepack';
import React from 'react';
import HeatmapPlot from './HeatmapPlot';
import ImagePlot from './ImagePlot';
import LinePlot from './LinePlot';
import ScatterPlot from './ScatterPlot';
import TableDisplay from './TableDisplay';
import {
  addIndices,
  appendDLineData,
  calculateMultiXDomain,
  calculateMultiYDomain,
  createDAxesParameters,
  createDLineData,
  createDImageData,
  createDTableData,
  createDScatterData,
  isHeatmapData,
} from './utils';

import type { TypedArray, NdArray } from 'ndarray';

type PlotProps =
  | LinePlotProps
  | ImagePlotProps
  | HeatmapPlotProps
  | ScatterPlotProps
  | TableDisplayProps;

class Plot extends React.Component<PlotProps> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log(error, errorInfo);
  }

  render() {
    if ('heatmapScale' in this.props) {
      const heatPlotParams = this.props as HeatmapPlotProps;
      return (
        <>
          <HeatmapPlot {...heatPlotParams}></HeatmapPlot>
        </>
      );
    } else if ('values' in this.props) {
      const imagePlotParams = this.props as ImagePlotProps;
      return (
        <>
          <ImagePlot {...imagePlotParams}></ImagePlot>
        </>
      );
    } else if ('xData' in this.props) {
      const scatterPlotParams = this.props as ScatterPlotProps;
      return (
        <>
          <ScatterPlot {...scatterPlotParams}></ScatterPlot>
        </>
      );
    } else if ('cellWidth' in this.props) {
      const tableDisplayParams = this.props as TableDisplayProps;
      return (
        <>
          <TableDisplay {...tableDisplayParams}></TableDisplay>
        </>
      );
    } else {
      const linePlotParams = this.props as LinePlotProps;
      return (
        <>
          <LinePlot {...linePlotParams}></LinePlot>
        </>
      );
    }
  }
}

interface PlotComponentProps {
  plot_id: string;
  hostname: string;
  port: string;
}

interface PlotStates {
  multilineData: DLineData[];
  lineAxesParams: DAxesParameters;
  imageData?: DImageData;
  imageAxesParams: DAxesParameters;
  scatterData?: DScatterData;
  scatterAxesParams: DAxesParameters;
  tableData?: DTableData;
}

class PlotComponent extends React.Component<PlotComponentProps, PlotStates> {
  public static defaultProps = { hostname: '127.0.0.1', port: '8000' };
  constructor(props: PlotComponentProps) {
    super(props);
    this.state = {
      multilineData: [],
      lineAxesParams: {},
      imageAxesParams: {},
      scatterAxesParams: {},
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
    return new Promise<void>((resolve) => {
      if (socket.readyState !== socket.OPEN) {
        socket.addEventListener('open', (_event) => {
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
        type: 'status',
        params: 'ready',
        plot_config: {},
      };
      this.socket.send(encode(initStatus));
    };
    this.socket.onmessage = (event: MessageEvent) => {
      // eslint-disable-next-line
      const decoded_message = decode(event.data) as
        | MultiLineDataMessage
        | ImageDataMessage
        | ScatterDataMessage
        | TableDataMessage
        | ClearPlotsMessage;
      console.log('decoded_message: ', decoded_message, typeof decoded_message);
      let report = true;
      if ('ml_data' in decoded_message) {
        console.log('data type is multiline data');
        this.plot_multiline_data(decoded_message);
      } else if ('al_data' in decoded_message) {
        console.log('data type is new line data to append');
        const appendLineMessage = decoded_message as AppendLineDataMessage;
        this.append_multiline_data(appendLineMessage);
      } else if ('im_data' in decoded_message) {
        console.log('data type is new image data');
        this.plot_new_image_data(decoded_message);
      } else if ('sc_data' in decoded_message) {
        console.log('data type is new scatter data');
        this.plot_new_scatter_data(decoded_message);
      } else if ('ta_data' in decoded_message) {
        console.log('data type is new table data');
        this.display_new_table_data(decoded_message);
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
          type: 'status',
          params: 'ready',
          plot_config: {},
        };
        this.socket.send(encode(status));
      }
    };
  }

  append_multiline_data = (message: AppendLineDataMessage) => {
    console.log(message);
    const currentLineData = this.state.multilineData;
    const newPointsData = message.al_data.map((l) => createDLineData(l));
    const l = Math.max(currentLineData.length, newPointsData.length);
    const newLineData: DLineData[] = [];
    for (let i = 0; i < l; i++) {
      newLineData.push(appendDLineData(currentLineData[i], newPointsData[i]));
    }
    this.set_line_data(newLineData, this.state.lineAxesParams);
  };

  plot_multiline_data = (message: MultiLineDataMessage) => {
    console.log(message);
    const axes_parameters = createDAxesParameters(message.axes_parameters);
    const multilineData: DLineData[] = [];
    const nullableData = message.ml_data.map((l) => createDLineData(l));
    nullableData.forEach((d) => {
      if (d != null) {
        multilineData.push(d);
      }
    });
    this.set_line_data(multilineData, axes_parameters);
  };

  plot_new_image_data = (message: ImageDataMessage) => {
    console.log(message);
    const newImageData = createDImageData(message.im_data);
    console.log('newImageData', newImageData);
    const newImageAxesParams = createDAxesParameters(message.axes_parameters);
    console.log('new image for plot "', this.props.plot_id, '"');
    this.setState({
      imageData: newImageData,
      imageAxesParams: newImageAxesParams,
    });
    console.log('adding new image: ', newImageData);
  };

  plot_new_scatter_data = (message: ScatterDataMessage) => {
    console.log(message);
    const newScatterData = createDScatterData(message.sc_data);
    console.log('newScatterData', newScatterData);
    const newScatterAxesParams = createDAxesParameters(message.axes_parameters);
    console.log('new scatter data for plot "', this.props.plot_id, '"');
    this.setState({
      scatterData: newScatterData,
      scatterAxesParams: newScatterAxesParams,
    });
    console.log('adding new scatter data: ', newScatterData);
  };

  display_new_table_data = (message: TableDataMessage) => {
    console.log(message);
    const newTableData = createDTableData(message.ta_data);
    console.log('newTableData', newTableData);
    console.log('new table data for plot "', this.props.plot_id, '"');
    this.setState({ tableData: newTableData });
    console.log('adding new table data: ', newTableData);
  };

  set_line_data = (
    multiline_data: DLineData[],
    axes_params: DAxesParameters
  ) => {
    const indexed_data = multiline_data.map((l) => addIndices(l));
    this.multilineXDomain = calculateMultiXDomain(indexed_data);
    this.multilineYDomain = calculateMultiYDomain(indexed_data);
    console.log(
      'setting line state with domains',
      this.multilineXDomain,
      this.multilineYDomain
    );
    this.setState({ multilineData: indexed_data, lineAxesParams: axes_params });
  };

  clear_all_line_data = () => {
    this.multilineXDomain = [0, 0];
    this.multilineYDomain = [0, 0];
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
        title: undefined,
      },
      imageAxesParams: {
        xScale: undefined,
        yScale: undefined,
        xLabel: undefined,
        yLabel: undefined,
        xValues: undefined,
        yValues: undefined,
        title: undefined,
      },
      scatterAxesParams: {
        xScale: undefined,
        yScale: undefined,
        xLabel: undefined,
        yLabel: undefined,
        xValues: undefined,
        yValues: undefined,
        title: undefined,
      },
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
        const plotProps: HeatmapPlotProps = {
          colorMap: i.colorMap,
          domain: i.domain,
          heatmapScale: i.heatmap_scale as ScaleType,
          values: i.values as NdArray<TypedArray>,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          aspect: i.aspect,
          axesParameters: this.state.imageAxesParams,
        };
        return (
          <>
            <Plot {...plotProps} />
          </>
        );
      } else {
        const i = this.state.imageData;
        const plotProps: ImagePlotProps = {
          values: i.values as NdArray<TypedArray>,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          aspect: i.aspect,
          axesParameters: this.state.imageAxesParams,
        };
        return (
          <>
            <Plot {...plotProps} />
          </>
        );
      }
    }

    if (this.state.scatterData !== undefined) {
      const i = this.state.scatterData;
      const plotProps: ScatterPlotProps = {
        xData: i.xData as NdArray<TypedArray>,
        yData: i.yData as NdArray<TypedArray>,
        dataArray: i.dataArray as NdArray<TypedArray>,
        domain: i.domain,
        axesParameters: this.state.scatterAxesParams,
        colorMap: i.colorMap,
      };
      return (
        <>
          <Plot {...plotProps} />
        </>
      );
    }

    if (this.state.tableData !== undefined) {
      const i = this.state.tableData;
      const plotProps: TableDisplayProps = {
        dataArray: i.dataArray as NdArray<TypedArray>,
        cellWidth: i.cellWidth,
        displayParams: i.displayParams,
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
      axesParameters: this.state.lineAxesParams,
    };
    return (
      <>
        <Plot {...plotProps} />
      </>
    );
  }
}

export default PlotComponent;
