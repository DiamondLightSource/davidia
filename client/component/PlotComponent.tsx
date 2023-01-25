import '@h5web/lib/dist/styles.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { decode, encode } from 'messagepack';
import { useEffect, useRef, useState } from 'react';
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

type AnyPlotProps =
  | LinePlotProps
  | ImagePlotProps
  | HeatmapPlotProps
  | ScatterPlotProps
  | TableDisplayProps;

function Plot(props: AnyPlotProps) {
  if ('heatmapScale' in props) {
    return (
      <>
        <HeatmapPlot {...props}></HeatmapPlot>
      </>
    );
  } else if ('values' in props) {
    return (
      <>
        <ImagePlot {...props}></ImagePlot>
      </>
    );
  } else if ('xData' in props) {
    return (
      <>
        <ScatterPlot {...props}></ScatterPlot>
      </>
    );
  } else if ('cellWidth' in props) {
    return (
      <>
        <TableDisplay {...props}></TableDisplay>
      </>
    );
  } else {
    return (
      <>
        <LinePlot {...props}></LinePlot>
      </>
    );
  }
}

interface PlotComponentProps {
  plot_id: string;
  hostname: string;
  port: string;
}

const defaultAxesParameters = {
  xScale: undefined,
  yScale: undefined,
  xLabel: undefined,
  yLabel: undefined,
  xValues: undefined,
  yValues: undefined,
  title: undefined,
} as DAxesParameters;

export default function PlotComponent(props: PlotComponentProps) {
  const [plotProps, setPlotProps] = useState<AnyPlotProps | null>();
  const [lineData, setLineData] = useState<DLineData[]>([]);
  const [lineAxes, setLineAxes] = useState<DAxesParameters>(
    defaultAxesParameters
  );
  const sendReady = useRef<boolean>(false);

  const send_status_message = (message: string) => {
    if (readyState === ReadyState.OPEN) {
      console.log(`Sending ${message}`);
      const status: PlotMessage = {
        plot_id: props.plot_id,
        type: 'status',
        params: message,
        plot_config: {},
      };
      sendMessage(encode(status));
    }
  };

  const plotID = props.plot_id;
  const plotServerURL = `ws://${props.hostname}:${props.port}/plot/${plotID}`;
  const didUnmount = useRef<boolean>(false);
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    plotServerURL,
    {
      onOpen: () => {
        console.log('WebSocket connected');
        sendReady.current = true;
      },
      onClose: () => {
        console.log('WebSocket disconnected');
      },
      shouldReconnect: () => {
        return !didUnmount.current;
      },
      reconnectAttempts: 5,
      reconnectInterval: 10000,
    }
  );

  useEffect(() => {
    if (sendReady.current) {
      sendReady.current = false;
      send_status_message('ready');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState]);

  const clear_all_data = () => {
    clear_line_data();
    console.log('data cleared:', lineData, lineAxes);
  };

  const clear_line_data = () => {
    setLineData([]);
    setLineAxes(defaultAxesParameters);
    setPlotProps(null);
  };

  useEffect(() => {
    const socket = getWebSocket() as WebSocket;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (socket && socket.binaryType !== 'arraybuffer') {
      socket.binaryType = 'arraybuffer';
      console.log('WebSocket set binaryType');
    }
  }, [readyState, getWebSocket]);

  useEffect(() => {
    return () => {
      send_status_message('closing');
      didUnmount.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set_line_data = (
    multiline_data: DLineData[],
    line_axes_params?: DAxesParameters
  ) => {
    const indexed_data = multiline_data.map((l) => addIndices(l));
    const xDomain = calculateMultiXDomain(indexed_data);
    const yDomain = calculateMultiYDomain(indexed_data);
    console.log('setting line state with domains', xDomain, yDomain);
    const axes_params = line_axes_params ?? lineAxes;
    setLineData(indexed_data);
    setLineAxes(axes_params);
    setPlotProps({
      data: indexed_data,
      xDomain: xDomain,
      yDomain: yDomain,
      axesParameters: axes_params,
    });
  };

  const append_multiline_data = (message: AppendLineDataMessage) => {
    console.log(message);
    const newPointsData = message.al_data.map((l) => createDLineData(l));
    const l = Math.max(lineData.length, newPointsData.length);
    const newLineData: DLineData[] = [];
    for (let i = 0; i < l; i++) {
      newLineData.push(appendDLineData(lineData[i], newPointsData[i]));
    }
    set_line_data(newLineData);
  };

  const plot_multiline_data = (message: MultiLineDataMessage) => {
    console.log(message);
    const axes_parameters = createDAxesParameters(message.axes_parameters);
    const multilineData: DLineData[] = [];
    const nullableData = message.ml_data.map((l) => createDLineData(l));
    nullableData.forEach((d) => {
      if (d != null) {
        multilineData.push(d);
      }
    });
    set_line_data(multilineData, axes_parameters);
  };

  const plot_new_image_data = (message: ImageDataMessage) => {
    console.log(message);
    const imageData = createDImageData(message.im_data);
    console.log('newImageData', imageData);
    const imageAxesParams = createDAxesParameters(message.axes_parameters);
    console.log(`new image for plot "${plotID}"`);
    console.log('adding new image:', imageData);
    if (isHeatmapData(imageData)) {
      const heatmapData = imageData as DHeatmapData;
      setPlotProps({
        values: heatmapData.values,
        domain: heatmapData.domain,
        heatmapScale: heatmapData.heatmap_scale,
        axesParameters: imageAxesParams,
      } as HeatmapPlotProps);
    } else {
      setPlotProps({
        values: imageData.values,
        axesParameters: imageAxesParams,
      });
    }
  };

  const plot_new_scatter_data = (message: ScatterDataMessage) => {
    console.log(message);
    const scatterData = createDScatterData(message.sc_data);
    console.log('newScatterData', scatterData);
    const scatterAxesParams = createDAxesParameters(message.axes_parameters);
    console.log(`new scatter data for plot "${plotID}"`);
    setPlotProps({
      xData: scatterData.xData,
      yData: scatterData.yData,
      dataArray: scatterData.dataArray,
      domain: scatterData.domain,
      axesParameters: scatterAxesParams,
    });
  };

  const display_new_table_data = (message: TableDataMessage) => {
    console.log(message);
    const tableData = createDTableData(message.ta_data);
    console.log('newTableData', tableData);
    console.log(`new table data for plot "${plotID}"`);
    setPlotProps({
      cellWidth: tableData.cellWidth,
      dataArray: tableData.dataArray,
      displayParams: tableData.displayParams,
    });
  };

  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    // eslint-disable-next-line
    const decoded_message = decode(lastMessage.data) as
      | MultiLineDataMessage
      | AppendLineDataMessage
      | ImageDataMessage
      | ScatterDataMessage
      | TableDataMessage
      | ClearPlotsMessage;
    console.log('decoded_message:', decoded_message, typeof decoded_message);
    let report = true;

    if ('ml_data' in decoded_message) {
      console.log('data type is multiline data');
      plot_multiline_data(decoded_message);
    } else if ('al_data' in decoded_message) {
      console.log('data type is new line data to append');
      append_multiline_data(decoded_message);
    } else if ('im_data' in decoded_message) {
      console.log('data type is new image data');
      plot_new_image_data(decoded_message);
    } else if ('sc_data' in decoded_message) {
      console.log('data type is new scatter data');
      plot_new_scatter_data(decoded_message);
    } else if ('ta_data' in decoded_message) {
      console.log('data type is new table data');
      display_new_table_data(decoded_message);
    } else if ('plot_id' in decoded_message) {
      console.log('clearing data');
      clear_all_data();
    } else {
      report = false;
      console.log('data type unknown ');
    }
    if (report) {
      send_status_message('ready');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage, plotID]);

  if (!readyState || readyState === ReadyState.UNINSTANTIATED) {
    return <h2>Waiting for plot server connection</h2>;
  }

  if (readyState === ReadyState.CLOSING) {
    return <h2>Closing plot server connection</h2>;
  }

  if (readyState === ReadyState.CLOSED) {
    return <h2>Plot server connection closed</h2>;
  }

  if (!plotProps) {
    return <h2>Awaiting command from plot server</h2>;
  }
  return <Plot {...plotProps} />;
}

PlotComponent.defaultProps = {
  plot_id: 'plot_0',
  hostname: '127.0.0.1',
  port: '8000',
} as PlotComponentProps;
