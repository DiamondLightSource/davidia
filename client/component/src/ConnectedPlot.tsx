import afterFrame from 'afterframe';
import { decode, encode } from 'messagepack';
import { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import type { BatonProps, PlotConfig } from './models';
import AnyPlot from './AnyPlot';
import {
  appendLineData,
  calculateMultiXDomain,
  calculateMultiYDomain,
  createPlotConfig,
  createLineData,
  createImageData,
  createScatterData,
  createSurfaceData,
  createTableData,
  isHeatmapData,
  measureInteraction,
} from './utils';
import type {
  CLineData,
  CImageData,
  CTableData,
  CScatterData,
  CSurfaceData,
  CPlotConfig,
} from './utils';
import {
  cloneSelection,
  useSelections,
  type SelectionBase,
} from './selections/utils';
import type { AnyPlotProps } from './AnyPlot';
import type { LineData, LineParams } from './LinePlot';
import type { HeatmapData } from './HeatmapPlot';
import type { ScatterData } from './ScatterPlot';

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
  | 'client_update_selection'
  | 'client_update_line_parameters'
  | 'client_update_scatter_parameters';

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
  | BatonApprovalRequestMessage
  | ClientLineParametersMessage
  | ClientScatterParametersMessage;

const defaultPlotConfig = {
  xScale: undefined,
  yScale: undefined,
  xLabel: undefined,
  yLabel: undefined,
  xValues: undefined,
  yValues: undefined,
  title: undefined,
} as PlotConfig;

/**
 * A plot message
 */
interface PlotMessage {
  /** The plot ID */
  plotId: string;
  /** The message type */
  type: MsgType;
  /** The message parameters */
  params: unknown;
  /** The plot configureation */
  plotConfig: PlotConfig;
}

/**
 * A baton message
 */
interface BatonMessage {
  /** The uuid of the current baton holder */
  baton: string;
  /** The uuids of all the clients */
  uuids: string[];
}

/**
 * A baton approval request message
 */
interface BatonApprovalRequestMessage {
  /** The uuid of the client requesting the baton */
  requester: string;
}

/**
 * A selections message
 */
interface SelectionsMessage {
  /** The selections */
  setSelections: SelectionBase[];
}

/**
 * An update selections message
 */
interface UpdateSelectionsMessage {
  /** The selections to update */
  updateSelections: SelectionBase[];
}

/**
 * A clear selections message
 */
interface ClearSelectionsMessage {
  /** The selection IDs */
  selectionIds: string[];
}

/**
 * A client selection message
 */
interface ClientSelectionMessage {
  /** The selection */
  selection: SelectionBase;
}

/**
 * A client line parameters message
 */
interface ClientLineParametersMessage {
  /** The key */
  key: string;
  /** The line parameters */
  lineParams: LineParams;
}

/**
 * A client scatter parameters message
 */
interface ClientScatterParametersMessage {
  /** The data point size */
  pointSize: number;
}

/**
 * A baton request message
 */
// interface BatonRequestMessage {
//   /** The universally unique identifier */
//   uuid: string;
// }

/**
 * A clear plots message
 */
interface ClearPlotsMessage {
  /** The plot ID */
  plotId: string;
}

/**
 * A data message
 * @member {CPlotConfig} plotConfig - plot configuration
 */
interface DataMessage {
  plotConfig: CPlotConfig;
}

/**
 * A multiline data message
 */
interface MultiLineDataMessage extends DataMessage {
  /** The multiline data */
  mlData: CLineData[];
}

/**
 * An append line data message
 */
interface AppendLineDataMessage extends DataMessage {
  /** The line data to append */
  alData: CLineData[];
}

/**
 * An image data message
 */
interface ImageDataMessage extends DataMessage {
  /** The image data */
  imData: CImageData;
}

/**
 * A scatter data message
 */
interface ScatterDataMessage extends DataMessage {
  /** The scatter data */
  scData: CScatterData;
}

/**
 * A surface data message
 */
interface SurfaceDataMessage extends DataMessage {
  /** The surface data */
  suData: CSurfaceData;
}

/**
 * A table data message
 */
interface TableDataMessage extends DataMessage {
  /** The table data */
  taData: CTableData;
}

/**
 * Props for the `ConnectedPlot` component
 */
interface ConnectedPlotProps {
  /** The plot ID */
  plotId: string;
  /** The hostname */
  hostname: string;
  /** The port */
  port: string;
  /** The universally unique identifier */
  uuid: string;
}

/**
 *
 * Renders a connected plot
 * @param {ConnectedPlotProps} props - component props
 * @returns {React.JSX.Element} The rendered component
 */
function ConnectedPlot(props: ConnectedPlotProps) {
  const [plotProps, setPlotProps] = useState<AnyPlotProps | null>();
  const [lineData, setLineData] = useState<LineData[]>([]);
  const [linePlotConfig, setLinePlotConfig] =
    useState<PlotConfig>(defaultPlotConfig);
  const [scatterData, setScatterData] = useState<ScatterData>();
  const { selections, setSelections, isNewSelection, addSelection } =
    useSelections();
  const interactionTime = useRef<number>(0);

  const plotID = props.plotId;
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

  const sendClientMessage = useCallback(
    (type: MsgType, message: unknown) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`${plotID}: sending ${message}`);
      const status: PlotMessage = {
        plotId: plotID,
        type,
        params: message,
        plotConfig: {},
      };
      sendMessage(encode(status));
    },
    [plotID, sendMessage]
  );

  const sendStatusMessage = useCallback(
    (message: string) => {
      sendClientMessage('status', message);
    },
    [sendClientMessage]
  );

  const sendBatonRequestMessage = () => {
    sendClientMessage('baton_request', uuid);
  };

  const approveBatonRequest = (uuid: string) => {
    sendClientMessage('baton_approval', uuid);
  };

  const [batonProps, setBatonProps] = useState<BatonProps>({
    plotId: plotID,
    uuid: uuid,
    batonUuid: null,
    others: [],
    hasBaton: false,
    requestBaton: sendBatonRequestMessage,
    approveBaton: approveBatonRequest,
  } as BatonProps);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      const socket = getWebSocket() as WebSocket | null;
      if (socket && socket.binaryType !== 'arraybuffer') {
        socket.binaryType = 'arraybuffer';
        console.log(`${plotID}: WebSocket set binaryType`);
      }
      sendStatusMessage('ready');
    }
  }, [getWebSocket, plotID, readyState, sendStatusMessage]);

  const clearAllData = () => {
    clearLineData();
    console.log(`${plotID}: data cleared`, Object.keys(linePlotConfig));
  };

  const clearLineData = () => {
    setLineData([]);
    setLinePlotConfig(defaultPlotConfig);
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

  const receiveBatonApprovalRequest = (
    message: BatonApprovalRequestMessage
  ) => {
    const Approve = () => {
      const handleClick = () => {
        approveBatonRequest(message.requester);
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

  const updateSelection = (
    selection: SelectionBase | null,
    broadcast = true,
    clear = false
  ) => {
    const id = addSelection(selection, clear);
    if (broadcast) {
      if (clear) {
        sendClientMessage('clear_selection_data', {
          selectionIds: id ? [id] : [],
        } as ClearSelectionsMessage);
      } else {
        sendClientMessage(
          isNewSelection.current
            ? 'client_new_selection'
            : 'client_update_selection',
          {
            plotConfig: defaultPlotConfig,
            selection,
          } as ClientSelectionMessage
        );
      }
    }
    return id;
  };

  const updateLineParams = (
    key: string,
    params: LineParams,
    broadcast = true
  ) => {
    setLineData((prevLineData) => {
      console.log('Finding old line with key', key);
      const old = prevLineData.findIndex((s) => s.key === key);
      if (old === -1) {
        console.log('Line with key', key, 'cannot be found');
        return prevLineData;
      } else {
        const all = [...prevLineData];
        console.debug('Replacing old line params with', params);
        all[old] = { ...all[old], ...params };
        return all;
      }
    });

    if (broadcast) {
      sendClientMessage('client_update_line_parameters', {
        key: key,
        lineParams: params,
      } as ClientLineParametersMessage);
    }
  };

  const updateScatterParams = (newSize: number, broadcast = true) => {
    if (scatterData != undefined) {
      setScatterData({ ...scatterData, pointSize: newSize });
    }

    if (broadcast) {
      sendClientMessage('client_update_scatter_parameters', {
        pointSize: newSize,
      } as ClientScatterParametersMessage);
    }
  };

  const updateLineData = (
    multilineData: LineData[],
    newPlotConfig?: PlotConfig
  ) => {
    const xDomain = calculateMultiXDomain(multilineData);
    const yDomain = calculateMultiYDomain(multilineData);
    console.log(`${plotID}: setting line state with domains`, xDomain, yDomain);
    const plotConfig = newPlotConfig ?? linePlotConfig;
    setLineData(multilineData);
    setLinePlotConfig(plotConfig);
    setPlotProps({
      lineData: multilineData,
      xDomain,
      yDomain,
      plotConfig: plotConfig,
      addSelection: updateSelection,
      selections,
      batonProps,
      updateLineParams,
    });
  };

  const appendMultilineData = (message: AppendLineDataMessage) => {
    const newPointsData = message.alData.map((l) => createLineData(l));
    console.log(`${plotID}: appending line data`, Object.keys(newPointsData));
    const l = Math.max(lineData.length, newPointsData.length);
    const newLineData: LineData[] = [];
    for (let i = 0; i < l; i++) {
      newLineData.push(appendLineData(lineData[i], newPointsData[i]));
    }
    updateLineData(newLineData);
  };

  const plotMultilineData = (message: MultiLineDataMessage) => {
    const plotConfig = createPlotConfig(message.plotConfig);
    const multilineData = message.mlData
      .map((l) => createLineData(l))
      .filter((d) => d !== null);
    console.log(`${plotID}: new line data`, multilineData);
    updateLineData(multilineData as LineData[], plotConfig);
  };

  const plotNewImageData = (message: ImageDataMessage) => {
    const imageData = createImageData(message.imData);
    console.log(`${plotID}: new image data`, Object.keys(imageData));
    const imagePlotConfig = createPlotConfig(message.plotConfig);
    if (isHeatmapData(imageData)) {
      const heatmapData = imageData as HeatmapData;
      setPlotProps({
        ...heatmapData,
        plotConfig: imagePlotConfig,
        addSelection: updateSelection,
        selections,
        batonProps,
      });
    } else {
      setPlotProps({
        ...imageData,
        plotConfig: imagePlotConfig,
        addSelection: updateSelection,
        selections,
        batonProps,
      });
    }
  };

  const plotNewScatterData = (message: ScatterDataMessage) => {
    const scatterData = createScatterData(message.scData);
    console.log(`${plotID}: new scatter data`, Object.keys(scatterData));
    const scatterPlotConfig = createPlotConfig(message.plotConfig);
    setScatterData(scatterData);
    setPlotProps({
      ...scatterData,
      plotConfig: scatterPlotConfig,
      addSelection: updateSelection,
      setPointSize: updateScatterParams,
      selections,
      batonProps,
    });
  };

  const plotNewSurfaceData = (message: SurfaceDataMessage) => {
    const surfaceData = createSurfaceData(message.suData);
    console.log(`${plotID}: new surface data`, Object.keys(surfaceData));
    const surfacePlotConfig = createPlotConfig(message.plotConfig);
    setPlotProps({
      ...surfaceData,
      plotConfig: surfacePlotConfig,
      addSelection: addSelection,
      selections,
      batonProps,
    });
  };

  const displayNewTableData = (message: TableDataMessage) => {
    const tableData = createTableData(message.taData);
    console.log(`${plotID}: new table data`, Object.keys(tableData));
    setPlotProps({
      ...tableData,
      batonProps,
    });
  };

  const updateSelections = (message: UpdateSelectionsMessage) => {
    const updatedSelections = message.updateSelections
      .map((s) => cloneSelection(s))
      .filter((s) => s !== null) as SelectionBase[];
    console.log(`${plotID}: update selections`, updatedSelections);
    setSelections((prevSelections) => {
      const ns = [...prevSelections];
      for (const s of updatedSelections) {
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

  const clearSelections = (message: ClearSelectionsMessage) => {
    const ids = message.selectionIds;
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

  const replaceSelections = (message: SelectionsMessage) => {
    const newSelections = message.setSelections
      .map((s) => cloneSelection(s))
      .filter((s) => s !== null) as SelectionBase[];
    console.log(`${plotID}: new selections`, newSelections);
    setSelections(newSelections);
  };

  const updateBaton = (message: BatonMessage) => {
    console.log(plotID, ': updating baton with msg:', message, 'for', uuid);
    const baton = message.baton;
    setBatonProps({
      ...batonProps,
      batonUuid: baton,
      others: message.uuids.filter((u) => u !== uuid),
      hasBaton: baton === uuid,
    });
  };

  const showSelections = useRef<boolean>(false);
  const changeBaton = useRef<boolean>(false);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }
    if (readyState !== ReadyState.OPEN) {
      console.log(`${plotID}: still not open`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = lastMessage.data;
    if (data instanceof Blob) {
      console.log('Message was a blob:', data);
      return;
    }
    // eslint-disable-next-line
    const decodedMessage = decode(data) as DecodedMessage;
    console.log(
      `${plotID}: decodedMessage`,
      Object.keys(decodedMessage),
      typeof decodedMessage
    );

    const interaction = measureInteraction();
    afterFrame(() => {
      interactionTime.current = interaction.end();
    });

    let report = true;
    showSelections.current = true;
    changeBaton.current = false;
    if ('mlData' in decodedMessage) {
      console.log('data type is multiline data');
      plotMultilineData(decodedMessage);
    } else if ('alData' in decodedMessage) {
      console.log('data type is new line data to append');
      appendMultilineData(decodedMessage);
    } else if ('imData' in decodedMessage) {
      console.log('data type is new image data');
      plotNewImageData(decodedMessage);
    } else if ('scData' in decodedMessage) {
      console.log('data type is new scatter data');
      plotNewScatterData(decodedMessage);
    } else if ('suData' in decodedMessage) {
      showSelections.current = false;
      console.log('data type is new surface data');
      plotNewSurfaceData(decodedMessage);
    } else if ('taData' in decodedMessage) {
      showSelections.current = false;
      console.log('data type is new table data');
      displayNewTableData(decodedMessage);
    } else if ('updateSelections' in decodedMessage) {
      updateSelections(decodedMessage);
    } else if ('selectionIds' in decodedMessage) {
      clearSelections(decodedMessage);
    } else if ('setSelections' in decodedMessage) {
      replaceSelections(decodedMessage);
    } else if ('baton' in decodedMessage) {
      updateBaton(decodedMessage);
      changeBaton.current = true;
    } else if ('requester' in decodedMessage) {
      receiveBatonApprovalRequest(decodedMessage);
    } else if ('plotId' in decodedMessage) {
      clearAllData();
    } else {
      report = false;
      console.log(`${plotID}: new message type unknown`);
    }
    if (report) {
      sendStatusMessage(`ready ${interactionTime.current}`);
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
  if (changeBaton.current) {
    currentProps = { ...currentProps, batonProps };
  }
  if (showSelections.current) {
    currentProps = { ...currentProps, selections };
  }
  console.log(`${plotID}: plotprops`, Object.keys(plotProps), typeof plotProps);
  console.log(`${plotID}: selections`, selections.length);

  return <AnyPlot {...currentProps} />;
}

ConnectedPlot.defaultProps = {
  plotId: 'plot_0',
  hostname: '127.0.0.1',
  port: '8000',
} as ConnectedPlotProps;

export default ConnectedPlot;
export type { ConnectedPlotProps };
