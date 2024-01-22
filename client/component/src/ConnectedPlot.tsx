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

/**
 * A plot message.
 * @interface {object} PlotMessage
 * @member {string} plot_id - The plot ID.
 * @member {MsgType} type - The message type.
 * @member {unknown} params - The message parameters.
 * @member {unknown} plot_config - The plot configuration.
 */
interface PlotMessage {
  /** The plot ID */
  plot_id: string;
  /** The message type */
  type: MsgType;
  /** The message parameters */
  params: unknown;
  /** The plot configureation */
  plot_config: unknown;
}

/**
 * A baton message.
 * @interface {object} BatonMessage
 * @member {string} baton - The uuid of the current baton holder.
 * @member {string[]} uuids - The uuids of all clients.
 */
interface BatonMessage {
  /** The uuid of the current baton holder */
  baton: string;
  /** The uuids of all the clients */
  uuids: string[];
}

/**
 * A baton approval request message.
 * @interface {object} BatonApprovalRequestMessage
 * @member {string} requester - The uuid of the client requesting the baton.
 */
interface BatonApprovalRequestMessage {
  /** The uuid of the client requesting the baton */
  requester: string;
}

/**
 * A selections message.
 * @interface {object} SelectionsMessage
 * @member {SelectionBase[]} set_selections - The selections.
 */
interface SelectionsMessage {
  /** The selections */
  set_selections: SelectionBase[];
}

/**
 * An update selections message.
 * @interface {object} UpdateSelectionsMessage
 * @member {SelectionBase[]} update_selections - The selections to update.
 */
interface UpdateSelectionsMessage {
  /** The selections to update */
  update_selections: SelectionBase[];
}

/**
 * A clear selections message.
 * @interface {object} ClearSelectionsMessage
 * @member {string[]} selection_ids - The selection IDs.
 */
interface ClearSelectionsMessage {
  /** The selection IDs */
  selection_ids: string[];
}

/**
 * A client selection message.
 * @interface {object} ClientSelectionMessage
 * @member {SelectionBase} selection - The selection.
 */
interface ClientSelectionMessage {
  /** The selection */
  selection: SelectionBase;
}

/**
 * A baton request message.
 * @interface {object} BatonRequestMessage
 * @member {string} uuid - The universally unique identifier.
 */
interface BatonRequestMessage {
  /** The universally unique identifier */
  uuid: string;
}

/**
 * A clear plots message.
 * @interface {object} ClearPlotsMessage
 * @member {string} plot_id - The plot ID.
 */
interface ClearPlotsMessage {
  /** The plot ID */
  plot_id: string;
}

/**
 * A data message.
 * @interface {object} DataMessage
 * @member {AxesParameters} axes_parameters - The axes parameters.
 */
interface DataMessage {
  /** The axes parameters */
  axes_parameters: AxesParameters;
}

/**
 * A multiline data message.
 * @interface {object} MultiLineDataMessage
 * @extends {DataMessage}
 * @member {LineData[]} ml_data - The multiline data.
 */
interface MultiLineDataMessage extends DataMessage {
  /** The multiline data */
  ml_data: LineData[];
}

/**
 * An append line data message.
 * @interface {object} AppendLineDataMessage
 * @extends {DataMessage}
 * @member {LineData[]} al_data - The line data to append.
 */
interface AppendLineDataMessage extends DataMessage {
  /** The line data to append */
  al_data: LineData[];
}

/**
 * An image data message.
 * @interface {object} ImageDataMessage
 * @extends {DataMessage}
 * @member {ImageData} im_data - The image data.
 */
interface ImageDataMessage extends DataMessage {
  /** The image data */
  im_data: ImageData;
}

/**
 * A scatter data message.
 * @interface {object} ScatterDataMessage
 * @extends {DataMessage}
 * @member {ScatterData} sc_data - The scatter data.
 */
interface ScatterDataMessage extends DataMessage {
  /** The scatter data */
  sc_data: ScatterData;
}

/**
 * A surface data message.
 * @interface {object} SurfaceDataMessage
 * @extends {DataMessage}
 * @member {SurfaceData} su_data - The surface data.
 */
interface SurfaceDataMessage extends DataMessage {
  /** The surface data */
  su_data: SurfaceData;
}

/**
 * A table data message.
 * @interface {object} TableDataMessage
 * @extends {DataMessage}
 * @member {TableData} ta_data - The table data.
 */
interface TableDataMessage extends DataMessage {
  /** The table data */
  ta_data: TableData;
}

/**
 * The props for the `ConnectedPlot` component.
 * @interface {object} ConnectedPlotProps
 * @member {string} plot_id - The plot ID.
 * @member {string} hostname - The hostname.
 * @member {string} port - The port.
 * @member {string} uuid - The uuid.
 */
interface ConnectedPlotProps {
  /** The plot ID */
  plot_id: string;
  /** The hostname */
  hostname: string;
  /** The port */
  port: string;
  /** The universally unique identifier */
  uuid: string;
}

/**
 *
 * Renders a connected plot.
 * @param {ConnectedPlotProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function ConnectedPlot(props: ConnectedPlotProps) {
  const [plotProps, setPlotProps] = useState<AnyPlotProps | null>();
  const [lineData, setLineData] = useState<DLineData[]>([]);
  const [lineAxes, setLineAxes] = useState<DAxesParameters>(
    defaultAxesParameters
  );
  const [selections, setSelections] = useState<SelectionBase[]>([]);
  const interactionTime = useRef<number>(0);

  const plotID = props.plot_id;
  const uuid = props.uuid;

  const plotServerURL = `ws://${props.hostname}:${props.port}/plot/${uuid}/${plotID}`;
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    plotServerURL,
    {
      onOpen: () => {
        console.log(`${plotID}: WebSocket connected`);
      },
      onClose: () => {
        console.log(`${plotID}: WebSocket disconnected`);
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
    if (readyState === ReadyState.OPEN) {
      const socket = getWebSocket() as WebSocket | null;
      if (socket && socket.binaryType !== 'arraybuffer') {
        socket.binaryType = 'arraybuffer';
        console.log(`${plotID}: WebSocket set binaryType`);
      }
      send_status_message('ready');
    }
  }, [getWebSocket, plotID, readyState, send_status_message]);

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
    if (readyState !== ReadyState.OPEN) {
      console.log(`${plotID}: still not open`);
    }

    // eslint-disable-next-line
    const decoded_message = decode(lastMessage.data) as DecodedMessage;
    console.log(
      `${plotID}: decoded_message`,
      decoded_message,
      typeof decoded_message
    );

    const interaction = measureInteraction();
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
    if (report) {
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
