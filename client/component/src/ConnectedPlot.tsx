import afterFrame from 'afterframe';
import { decode, encode } from 'messagepack';
import { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AnyPlot from './AnyPlot';
import {
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
  measureInteraction,
} from './utils';
import { recreateSelection, type SelectionBase } from './selections/utils';
import type {
  AnyPlotProps,
  AxesParameters,
  BatonProps,
  DAxesParameters,
  DLineData,
  HeatmapPlotProps,
  SurfacePlotProps,
} from './AnyPlot';
import type { LineData } from './LinePlot';
import type { ImageData } from './ImagePlot';
import type { ScatterData } from './ScatterPlot';
import type { SurfaceData } from './SurfacePlot';
import type { TableData } from './TableDisplay';
import type { DHeatmapData } from './utils';

enum SendReceive {
  NOT_READY,
  INITIALIZED,
  READY,
}

type MsgType =
  | 'status'
  | 'new_multiline_data'
  | 'append_line_data'
  | 'new_image_data'
  | 'new_scatter_data'
  | 'new_surface_data'
  | 'new_table_data'
  | 'new_selection_data'
  | 'append_selection_data'
  | 'baton_request'
  | 'baton_approval'
  | 'clear_selection_data'
  | 'clear_data'
  | 'client_new_selection'
  | 'client_update_selection';

type DecodedMessage =
  | MultiLineDataMessage
  | AppendLineDataMessage
  | ImageDataMessage
  | ScatterDataMessage
  | SurfaceDataMessage
  | TableDataMessage
  | UpdateSelectionsMessage
  | SelectionsMessage
  | ClearSelectionsMessage
  | ClearPlotsMessage
  | BatonMessage
  | BatonApprovalRequestMessage;

type StatusType = 'ready' | 'busy';

const defaultAxesParameters = {
  xScale: undefined,
  yScale: undefined,
  xLabel: undefined,
  yLabel: undefined,
  xValues: undefined,
  yValues: undefined,
  title: undefined,
} as DAxesParameters;

interface PlotMessage {
  plot_id: string;
  type: MsgType;
  params: unknown;
  plot_config: unknown;
}

interface BatonMessage {
  baton: string;
  uuids: string[];
}

interface BatonApprovalRequestMessage {
  requester: string;
}

interface SelectionsMessage {
  set_selections: SelectionBase[];
}

interface UpdateSelectionsMessage {
  update_selections: SelectionBase[];
}

interface ClearSelectionsMessage {
  selection_ids: string[];
}

interface ClientSelectionMessage {
  selection: SelectionBase;
}

interface BatonRequestMessage {
  uuid: string;
}

interface ClearPlotsMessage {
  plot_id: string;
}

interface DataMessage {
  axes_parameters: AxesParameters;
}

interface MultiLineDataMessage extends DataMessage {
  ml_data: LineData[];
}

interface AppendLineDataMessage extends DataMessage {
  al_data: LineData[];
}

interface ImageDataMessage extends DataMessage {
  im_data: ImageData;
}

interface ScatterDataMessage extends DataMessage {
  sc_data: ScatterData;
}

interface SurfaceDataMessage extends DataMessage {
  su_data: SurfaceData;
}

interface TableDataMessage extends DataMessage {
  ta_data: TableData;
}

interface ConnectedPlotProps {
  plot_id: string;
  hostname: string;
  port: string;
  uuid: string;
}

function ConnectedPlot(props: ConnectedPlotProps) {
  const [plotProps, setPlotProps] = useState<AnyPlotProps | null>();
  const [lineData, setLineData] = useState<DLineData[]>([]);
  const [lineAxes, setLineAxes] = useState<DAxesParameters>(
    defaultAxesParameters
  );
  const [sendReceive, setSendReceive] = useState<SendReceive>(
    SendReceive.NOT_READY
  );
  const [selections, setSelections] = useState<SelectionBase[]>([]);
  const interactionTime = useRef<number>(0);

  const plotID = props.plot_id;
  const uuid = props.uuid;

  const plotServerURL = `ws://${props.hostname}:${props.port}/plot/${uuid}/${plotID}`;
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

  const send_client_message = useCallback(
    (type: MsgType, message: unknown) => {
      console.log(`${plotID}: sending ${String(message)}`);
      const status: PlotMessage = {
        plot_id: plotID,
        type,
        params: message,
        plot_config: {},
      };
      sendMessage(encode(status));
    },
    [plotID, sendMessage]
  );

  const send_status_message = useCallback(
    (message: string) => {
      send_client_message('status', message);
    },
    [send_client_message]
  );

  const send_baton_request_message = () => {
    send_client_message('baton_request', uuid);
  };

  const approve_baton_request = (uuid: string) => {
    send_client_message('baton_approval', uuid);
  };

  const [batonProps, setBatonProps] = useState<BatonProps>({
    plotID,
    uuid: uuid,
    batonUuid: null,
    others: [],
    hasBaton: false,
    requestBaton: send_baton_request_message,
    approveBaton: approve_baton_request,
  } as BatonProps);

  useEffect(() => {
    if (sendReceive === SendReceive.READY) {
      send_status_message('ready');
    }
  }, [sendReceive, send_status_message]);

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
  }, [plotID, sendReceive, getWebSocket]);

  useEffect(() => {
    return () => {
      send_status_message('closing');
      didUnmount.current = true;
    };
  }, [send_status_message]);

  useEffect(() => {
    return () => {
      toast(batonProps.hasBaton ? 'Baton lost' : 'Baton gained', {
        toastId: String(batonProps.hasBaton),
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    };
  }, [batonProps.hasBaton]);

  const receive_baton_approval_request = (
    message: BatonApprovalRequestMessage
  ) => {
    const Approve = () => {
      const handleClick = () => {
        approve_baton_request(message.requester);
      };
      return (
        <div>
          <h3>
            Baton requested from {message.requester} <br />
            <button onClick={handleClick}>Approve</button>
          </h3>
        </div>
      );
    };

    toast(<Approve />, {
      toastId: message.requester,
      position: 'bottom-center',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  };

  const isNewSelection = useRef(false);

  const updateSelections = (
    selection: SelectionBase | null,
    broadcast = true,
    clear = false
  ) => {
    let id: string | null = null;
    if (!selection) {
      if (clear) {
        setSelections([]);
      }
    } else {
      id = selection.id;
      if (clear) {
        setSelections((prevSelections) =>
          prevSelections.filter((s) => s.id !== id)
        );
      } else {
        setSelections((prevSelections) => {
          const old = prevSelections.findIndex((s) => s.id === id);
          isNewSelection.current = old === -1;
          if (isNewSelection.current) {
            return [...prevSelections, selection];
          }
          const all = [...prevSelections];
          console.debug('Replacing', all[old], 'with', selection);
          all[old] = selection;
          return all;
        });
      }
    }

    if (broadcast) {
      if (clear) {
        send_client_message('clear_selection_data', {
          selection_ids: id ? [id] : [],
        } as ClearSelectionsMessage);
      } else {
        send_client_message(
          isNewSelection.current
            ? 'client_new_selection'
            : 'client_update_selection',
          {
            axes_parameters: defaultAxesParameters,
            selection,
          } as ClientSelectionMessage
        );
      }
    }
  };

  const set_line_data = (
    multiline_data: DLineData[],
    line_axes_params?: DAxesParameters
  ) => {
    const xDomain = calculateMultiXDomain(multiline_data);
    const yDomain = calculateMultiYDomain(multiline_data);
    console.log(`${plotID}: setting line state with domains`, xDomain, yDomain);
    const axes_params = line_axes_params ?? lineAxes;
    setLineData(multiline_data);
    setLineAxes(axes_params);
    setPlotProps({
      data: multiline_data,
      xDomain,
      yDomain,
      axesParameters: axes_params,
      addSelection: updateSelections,
      selections,
      batonProps,
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
        addSelection: updateSelections,
        selections,
        batonProps,
      } as HeatmapPlotProps);
    } else {
      setPlotProps({
        values: imageData.values,
        aspect: imageData.aspect,
        axesParameters: imageAxesParams,
        addSelection: updateSelections,
        selections,
        batonProps,
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
      addSelection: updateSelections,
      selections,
      batonProps,
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
      addSelection: updateSelections,
      selections,
      batonProps,
    } as SurfacePlotProps);
  };

  const display_new_table_data = (message: TableDataMessage) => {
    const tableData = createDTableData(message.ta_data);
    console.log(`${plotID}: new table data`, tableData);
    setPlotProps({
      cellWidth: tableData.cellWidth,
      dataArray: tableData.dataArray,
      displayParams: tableData.displayParams,
      addSelection: updateSelections,
      selections: [],
      batonProps,
    });
  };

  const update_selections = (message: UpdateSelectionsMessage) => {
    const updated_selections = message.update_selections
      .map((s) => recreateSelection(s))
      .filter((s) => s !== null) as SelectionBase[];
    console.log(`${plotID}: update selections`, updated_selections);
    setSelections((prevSelections) => {
      const ns = [...prevSelections];
      for (const s of updated_selections) {
        const id = s.id;
        const old = ns.findIndex((n) => n.id === id);
        if (old === -1) {
          ns.push(s);
        } else {
          ns[old] = s;
        }
      }
      return ns;
    });
  };

  const clear_selections = (message: ClearSelectionsMessage) => {
    const ids = message.selection_ids;
    console.log(`${plotID}: clear selections`, ids);
    if (ids.length === 0) {
      setSelections(() => []);
    } else {
      setSelections((prevSelections) => {
        const ns = [];
        for (const s of prevSelections) {
          if (!ids.includes(s.id)) {
            ns.push(s);
          }
        }
        return ns;
      });
    }
  };

  const set_selections = (message: SelectionsMessage) => {
    const new_selections = message.set_selections
      .map((s) => recreateSelection(s))
      .filter((s) => s !== null) as SelectionBase[];
    console.log(`${plotID}: new selections`, new_selections);
    setSelections(new_selections);
  };

  const update_baton = (message: BatonMessage) => {
    console.log(plotID, ': updating baton with msg: ', message, 'for', uuid);
    const baton = message.baton;
    setBatonProps({
      ...batonProps,
      batonUuid: baton,
      others: message.uuids.filter((u) => u !== uuid),
      hasBaton: baton === uuid,
    });
  };

  const showSelections = useRef<boolean>(false);
  const updateBaton = useRef<boolean>(false);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }
    if (sendReceive !== SendReceive.READY) {
      console.log(`${plotID}: still not ready`);
    }

    // eslint-disable-next-line
    const decoded_message = decode(lastMessage.data) as DecodedMessage;
    console.log(
      `${plotID}: decoded_message`,
      decoded_message,
      typeof decoded_message
    );

    const interaction = measureInteraction();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    afterFrame(() => {
      interactionTime.current = interaction.end();
    });

    let report = true;
    showSelections.current = true;
    updateBaton.current = false;
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
    } else if ('update_selections' in decoded_message) {
      update_selections(decoded_message);
    } else if ('selection_ids' in decoded_message) {
      clear_selections(decoded_message);
    } else if ('set_selections' in decoded_message) {
      set_selections(decoded_message);
    } else if ('baton' in decoded_message) {
      update_baton(decoded_message);
      updateBaton.current = true;
    } else if ('requester' in decoded_message) {
      receive_baton_approval_request(decoded_message);
    } else if ('plot_id' in decoded_message) {
      clear_all_data();
    } else {
      report = false;
      console.log(`${plotID}: new message type unknown`);
    }
    if (report && !didUnmount.current) {
      send_status_message(`ready ${interactionTime.current}`);
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
  let currentProps = plotProps;
  if (updateBaton.current) {
    currentProps = { ...currentProps, batonProps };
  }
  if (showSelections.current) {
    currentProps = { ...currentProps, selections };
  }
  console.log(`${plotID}: plotprops`, plotProps, typeof plotProps);
  console.log(`${plotID}: selections`, selections.length);

  return <AnyPlot {...currentProps} />;
}

ConnectedPlot.defaultProps = {
  plot_id: 'plot_0',
  hostname: '127.0.0.1',
  port: '8000',
} as ConnectedPlotProps;

export default ConnectedPlot;
export type {
  AppendLineDataMessage,
  BatonApprovalRequestMessage,
  BatonMessage,
  BatonRequestMessage,
  ClearPlotsMessage,
  ClearSelectionsMessage,
  ClientSelectionMessage,
  ConnectedPlotProps,
  DataMessage,
  DecodedMessage,
  ImageDataMessage,
  MsgType,
  MultiLineDataMessage,
  PlotMessage,
  ScatterDataMessage,
  SelectionsMessage,
  StatusType,
  SurfaceDataMessage,
  TableDataMessage,
  UpdateSelectionsMessage,
};