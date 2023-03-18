import { Toolbar } from '@h5web/lib';
import { useEffect, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { decode, encode } from 'messagepack';

import HeatmapPlot from './HeatmapPlot';
import ImagePlot from './ImagePlot';
import LinePlot from './LinePlot';
import ScatterPlot from './ScatterPlot';
import SurfacePlot from './SurfacePlot';
import TableDisplay from './TableDisplay';
import {
  addIndices,
  appendDLineData,
  calculateMultiXDomain,
  calculateMultiYDomain,
  createDAxesParameters,
  createDLineData,
  createDImageData,
  createDScatterData,
  createDSurfaceData,
  createDTableData,
  isHeatmapData,
} from './utils';
import { recreateSelection } from './selections';

type AnyPlotProps =
  | LinePlotProps
  | ImagePlotProps
  | HeatmapPlotProps
  | ScatterPlotProps
  | SurfacePlotProps
  | TableDisplayProps;

function Plot(props: AnyPlotProps) {
  if ('surfaceScale' in props) {
    return (
      <>
        <SurfacePlot {...props}></SurfacePlot>
      </>
    );
  } else if ('heatmapScale' in props) {
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
  } else if ('data' in props && props.data.length != 0) {
    return (
      <>
        <LinePlot {...props}></LinePlot>
      </>
    );
  }
  return null;
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

enum SendReceive {
  NOT_READY,
  INITIALIZED,
  READY,
}

export default function PlotComponent(props: PlotComponentProps) {
  const [plotProps, setPlotProps] = useState<AnyPlotProps | null>();
  const [lineData, setLineData] = useState<DLineData[]>([]);
  const [lineAxes, setLineAxes] = useState<DAxesParameters>(
    defaultAxesParameters
  );
  const [sendReceive, setSendReceive] = useState<SendReceive>(
    SendReceive.NOT_READY
  );
  const [selections, setSelections] = useState<SelectionBase[]>([]);

  const plotID = props.plot_id;

  const send_client_message = (type: MsgType, message: unknown) => {
    if (readyState === ReadyState.OPEN) {
      console.log(`${plotID}: sending ${String(message)}`);
      const status: PlotMessage = {
        plot_id: plotID,
        type,
        params: message,
        plot_config: {},
      };
      sendMessage(encode(status));
    }
  };

  const send_status_message = (message: string) => {
    send_client_message('status', message);
  };

  const plotServerURL = `ws://${props.hostname}:${props.port}/plot/${plotID}`;
  const didUnmount = useRef<boolean>(false);
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    plotServerURL,
    {
      onOpen: () => {
        console.log(`${plotID}: WebSocket connected`);
        setSendReceive(SendReceive.INITIALIZED);
      },
      onClose: () => {
        console.log(`${plotID}: WebSocket disconnected`);
        setSendReceive(SendReceive.NOT_READY);
      },
      shouldReconnect: () => {
        return !didUnmount.current;
      },
      reconnectAttempts: 5,
      reconnectInterval: 10000,
    }
  );

  useEffect(() => {
    if (sendReceive === SendReceive.READY) {
      send_status_message('ready');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState, sendReceive]);

  const clear_all_data = () => {
    clear_line_data();
    console.log(`${plotID}: data cleared`, lineData, lineAxes);
  };

  const clear_line_data = () => {
    setLineData([]);
    setLineAxes(defaultAxesParameters);
    setPlotProps(null);
    setSelections([]);
  };

  useEffect(() => {
    if (sendReceive === SendReceive.INITIALIZED) {
      const socket = getWebSocket() as WebSocket | null;
      if (socket && socket.binaryType !== 'arraybuffer') {
        socket.binaryType = 'arraybuffer';
        setSendReceive(SendReceive.READY);
        console.log(`${plotID}: WebSocket set binaryType`);
      }
    }
  }, [plotID, readyState, sendReceive, getWebSocket]);

  useEffect(() => {
    return () => {
      send_status_message('closing');
      didUnmount.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNewSelection = (selection: SelectionBase) => {
    setSelections((prevSelection) => [...prevSelection, selection]);
    send_client_message('client_new_selection', {
      selection,
    } as ClientSelectionMessage);
  };

  const set_line_data = (
    multiline_data: DLineData[],
    line_axes_params?: DAxesParameters
  ) => {
    const indexed_data = multiline_data.map((l) => addIndices(l));
    const xDomain = calculateMultiXDomain(indexed_data);
    const yDomain = calculateMultiYDomain(indexed_data);
    console.log(`${plotID}: setting line state with domains`, xDomain, yDomain);
    const axes_params = line_axes_params ?? lineAxes;
    setLineData(indexed_data);
    setLineAxes(axes_params);
    setPlotProps({
      data: indexed_data,
      xDomain: xDomain,
      yDomain: yDomain,
      axesParameters: axes_params,
      addSelection: addNewSelection,
      selections,
    });
  };

  const append_multiline_data = (message: AppendLineDataMessage) => {
    const newPointsData = message.al_data.map((l) => createDLineData(l));
    console.log(`${plotID}: appending line data`, newPointsData);
    const l = Math.max(lineData.length, newPointsData.length);
    const newLineData: DLineData[] = [];
    for (let i = 0; i < l; i++) {
      newLineData.push(appendDLineData(lineData[i], newPointsData[i]));
    }
    set_line_data(newLineData);
  };

  const plot_multiline_data = (message: MultiLineDataMessage) => {
    const axes_parameters = createDAxesParameters(message.axes_parameters);
    const multilineData = message.ml_data
      .map((l) => createDLineData(l))
      .filter((d) => d !== null) as DLineData[];
    console.log(`${plotID}: new line data`, multilineData);
    set_line_data(multilineData, axes_parameters);
  };

  const plot_new_image_data = (message: ImageDataMessage) => {
    const imageData = createDImageData(message.im_data);
    console.log(`${plotID}: new image data`, imageData);
    const imageAxesParams = createDAxesParameters(message.axes_parameters);
    if (isHeatmapData(imageData)) {
      const heatmapData = imageData as DHeatmapData;
      setPlotProps({
        values: heatmapData.values,
        aspect: heatmapData.aspect,
        domain: heatmapData.domain,
        heatmapScale: heatmapData.heatmap_scale,
        colourMap: heatmapData.colourMap,
        axesParameters: imageAxesParams,
        addSelection: addNewSelection,
        selections,
      } as HeatmapPlotProps);
    } else {
      setPlotProps({
        values: imageData.values,
        aspect: imageData.aspect,
        axesParameters: imageAxesParams,
        addSelection: addNewSelection,
        selections,
      });
    }
  };

  const plot_new_scatter_data = (message: ScatterDataMessage) => {
    const scatterData = createDScatterData(message.sc_data);
    console.log(`${plotID}: new scatter data`, scatterData);
    const scatterAxesParams = createDAxesParameters(message.axes_parameters);
    setPlotProps({
      xData: scatterData.xData,
      yData: scatterData.yData,
      dataArray: scatterData.dataArray,
      domain: scatterData.domain,
      colourMap: scatterData.colourMap,
      axesParameters: scatterAxesParams,
      addSelection: addNewSelection,
      selections,
    });
  };

  const plot_new_surface_data = (message: SurfaceDataMessage) => {
    const surfaceData = createDSurfaceData(message.su_data);
    console.log(`${plotID}: new surface data`, surfaceData);
    const surfaceAxesParams = createDAxesParameters(message.axes_parameters);
    setPlotProps({
      values: surfaceData.values,
      domain: surfaceData.domain,
      colourMap: surfaceData.colourMap,
      surfaceScale: surfaceData.surface_scale,
      axesParameters: surfaceAxesParams,
      addSelection: addNewSelection,
      selections,
    } as SurfacePlotProps);
  };

  const display_new_table_data = (message: TableDataMessage) => {
    const tableData = createDTableData(message.ta_data);
    console.log(`${plotID}: new table data`, tableData);
    setPlotProps({
      cellWidth: tableData.cellWidth,
      dataArray: tableData.dataArray,
      displayParams: tableData.displayParams,
      addSelection: addNewSelection,
      selections: [],
    });
  };

  const append_selections = (message: AppendSelectionsMessage) => {
    const more_selections = message.append_selections
      .map((s) => recreateSelection(s))
      .filter((s) => s !== null) as SelectionBase[];
    console.log(`${plotID}: append selections`, more_selections);
    setSelections([...selections, ...more_selections]);
  };

  const set_selections = (message: SelectionsMessage) => {
    const new_selections = message.set_selections
      .map((s) => recreateSelection(s))
      .filter((s) => s !== null) as SelectionBase[];
    console.log(`${plotID}: new selections`, new_selections);
    setSelections(new_selections);
  };

  const showSelections = useRef<boolean>(false);
  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    if (sendReceive !== SendReceive.READY) {
      console.log(`${plotID}: still not ready`);
    }

    // eslint-disable-next-line
    const decoded_message = decode(lastMessage.data) as
      | MultiLineDataMessage
      | AppendLineDataMessage
      | ImageDataMessage
      | ScatterDataMessage
      | SurfaceDataMessage
      | TableDataMessage
      | AppendSelectionsMessage
      | SelectionsMessage
      | ClearPlotsMessage;
    console.log(
      `${plotID}: decoded_message`,
      decoded_message,
      typeof decoded_message
    );

    let report = true;
    showSelections.current = true;
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
    } else if ('su_data' in decoded_message) {
      showSelections.current = false;
      console.log('data type is new surface data');
      plot_new_surface_data(decoded_message);
    } else if ('ta_data' in decoded_message) {
      showSelections.current = false;
      console.log('data type is new table data');
      display_new_table_data(decoded_message);
    } else if ('append_selections' in decoded_message) {
      append_selections(decoded_message);
    } else if ('set_selections' in decoded_message) {
      set_selections(decoded_message);
    } else if ('plot_id' in decoded_message) {
      clear_all_data();
    } else {
      report = false;
      console.log(`${plotID}: new image data type unknown`);
    }
    if (report && !didUnmount.current) {
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

  console.log(`${plotID}: selections`, selections.length);
  const currentProps = showSelections.current
    ? { ...plotProps, selections }
    : plotProps;
  return (
    <>
      <Toolbar> </Toolbar>
      <Plot {...currentProps} />
    </>
  );
}

PlotComponent.defaultProps = {
  plot_id: 'plot_0',
  hostname: '127.0.0.1',
  port: '8000',
} as PlotComponentProps;
