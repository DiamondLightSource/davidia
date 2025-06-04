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
  SelectionsEventType,
  useSelections,
  type SelectionsEventListener,
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
  | 'baton_offer'
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
  | BatonRequestMessage
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
  plotConfig?: PlotConfig;
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
 * A baton request message
 */
interface BatonRequestMessage {
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
  hostname?: string;
  /** The port */
  port?: string;
  /** The universally unique identifier */
  uuid: string;
}

/**
 *
 * Renders a connected plot
 * @param {ConnectedPlotProps} props - component props
 * @returns {JSX.Element} The rendered component
 */
function ConnectedPlot({
  plotId = 'plot_0',
  hostname = '127.0.0.1',
  port = '8000',
  uuid,
}: ConnectedPlotProps) {
  const [plotProps, setPlotProps] = useState<AnyPlotProps | null>();
  const lineDataRef = useRef<LineData[]>([]);
  const [linePlotConfig, setLinePlotConfig] =
    useState<PlotConfig>(defaultPlotConfig);
  const [scatterData, setScatterData] = useState<ScatterData>();

  const handleSelectionsEvent: SelectionsEventListener = (
    type: SelectionsEventType,
    dragging: boolean,
    selection?: SelectionBase
  ) => {
    // if dragging don't broadcast
    if (!dragging) {
      if (type === SelectionsEventType.removed) {
        sendClientMessage('clear_selection_data', {
          selectionIds: selection ? [selection.id] : [],
        } as ClearSelectionsMessage);
      } else {
        sendClientMessage(
          type === SelectionsEventType.created
            ? 'client_new_selection'
            : 'client_update_selection',
          {
            selection,
          } as ClientSelectionMessage
        );
      }
    }
  };

  const { selections, updateSelection, setSelections } = useSelections(
    undefined,
    handleSelectionsEvent
  );
  const interactionTime = useRef<number>(0);

  const mountState = useRef('');
  const plotServerURL = `ws://${hostname}:${port}/plot/${uuid}/${plotId}`;
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    plotServerURL,
    {
      onOpen: () => {
        console.log('%s: WebSocket connected', plotId);
      },
      onClose: () => {
        console.log('%s: WebSocket disconnected', plotId);
      },
      reconnectAttempts: 5,
      reconnectInterval: 5000,
      shouldReconnect: (_e) => {
        return mountState.current !== 'unmounted'; // don't reconnect when unmounted
      },
    }
  );
  useEffect(() => {
    mountState.current = 'initial';
    return () => {
      mountState.current = 'unmounted';
    };
  }, []);

  const sendClientMessage = useCallback(
    (type: MsgType, message: unknown) => {
      console.log('%s: sending', plotId, message);
      const status: PlotMessage = {
        plotId: plotId,
        type,
        params: message,
      };
      sendMessage(encode(status));
    },
    [plotId, sendMessage]
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

  const offerBatonRequest = (uuid: string) => {
    sendClientMessage('baton_offer', uuid);
  };

  const [batonProps, setBatonProps] = useState<BatonProps>({
    uuid: uuid,
    batonUuid: '',
    others: [],
    hasBaton: false,
    requestBaton: sendBatonRequestMessage,
    offerBaton: offerBatonRequest,
  });

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      const socket = getWebSocket() as WebSocket | null;
      if (socket && socket.binaryType !== 'arraybuffer') {
        socket.binaryType = 'arraybuffer';
        console.log('%s: WebSocket set binaryType', plotId);
      }
      sendStatusMessage('ready');
    }
  }, [getWebSocket, plotId, readyState, sendStatusMessage]);

  const clearAllData = () => {
    clearLineData();
    console.log('%s: data cleared', plotId, Object.keys(linePlotConfig));
  };

  const clearLineData = () => {
    lineDataRef.current = [];
    setLinePlotConfig(defaultPlotConfig);
    setPlotProps(null);
    setSelections([]);
  };

  useEffect(() => {
    if (batonProps.batonUuid) {
      let toastMessage = batonProps.hasBaton ? 'Baton gained' : 'Baton lost';
      if (mountState.current === 'initial') {
        toastMessage = batonProps.hasBaton
          ? 'Taken baton'
          : 'Another client has baton';
        mountState.current = '';
      }

      toast(toastMessage, {
        toastId: uuid,
        position: 'bottom-center',
        autoClose: 2000,
        theme: 'light',
      });
    }
  }, [batonProps.hasBaton, batonProps.batonUuid, uuid]);

  const approveBatonRequest = (message: BatonRequestMessage) => {
    const Approve = () => {
      const handleClick = () => {
        // if request approved then offer baton to requester
        offerBatonRequest(message.requester);
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

  const updateLineParams = (
    key: string,
    params: LineParams,
    broadcast = true
  ) => {
    const prevLineData = lineDataRef.current;
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
    console.log(
      '%s: setting line state with domains',
      plotId,
      xDomain,
      yDomain
    );
    const plotConfig = newPlotConfig ?? linePlotConfig;
    lineDataRef.current = multilineData;
    setLinePlotConfig(plotConfig);
    setPlotProps({
      lineData: multilineData,
      xDomain,
      yDomain,
      plotConfig,
      updateLineParams,
    });
  };

  const appendMultilineData = (message: AppendLineDataMessage) => {
    const newPointsData = message.alData.map((l) => createLineData(l));
    console.log('%s: appending line data', plotId, Object.keys(newPointsData));
    const lineData = lineDataRef.current;
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
    console.log(
      '%s: new line data',
      plotId,
      multilineData.map((o: LineData) => o.key)
    );
    updateLineData(multilineData, plotConfig);
  };

  const plotNewImageData = (message: ImageDataMessage) => {
    const imageData = createImageData(message.imData);
    const imagePlotConfig = createPlotConfig(message.plotConfig);
    if (isHeatmapData(imageData)) {
      const heatmapData = imageData as HeatmapData;
      console.log('%s: new heatmap data', plotId, Object.keys(heatmapData));
      setPlotProps({
        ...heatmapData,
        plotConfig: imagePlotConfig,
      });
    } else {
      console.log('%s: new image data', plotId, Object.keys(imageData));
      setPlotProps({
        ...imageData,
        plotConfig: imagePlotConfig,
      });
    }
  };

  const plotNewScatterData = (message: ScatterDataMessage) => {
    const scatterData = createScatterData(message.scData);
    console.log('%s: new scatter data', plotId, Object.keys(scatterData));
    const scatterPlotConfig = createPlotConfig(message.plotConfig);
    setScatterData(scatterData);
    setPlotProps({
      ...scatterData,
      plotConfig: scatterPlotConfig,
      setPointSize: updateScatterParams,
    });
  };

  const plotNewSurfaceData = (message: SurfaceDataMessage) => {
    const surfaceData = createSurfaceData(message.suData);
    console.log('%s: new surface data', plotId, Object.keys(surfaceData));
    const surfacePlotConfig = createPlotConfig(message.plotConfig);
    setPlotProps({
      ...surfaceData,
      plotConfig: surfacePlotConfig,
    });
  };

  const displayNewTableData = (message: TableDataMessage) => {
    const tableData = createTableData(message.taData);
    console.log('%s: new table data', plotId, Object.keys(tableData));
    setPlotProps({
      ...tableData,
    });
  };

  const updateSelections = (message: UpdateSelectionsMessage) => {
    const updatedSelections = message.updateSelections
      .map((s) => cloneSelection(s))
      .filter((s) => s !== null) as SelectionBase[];
    console.log('%s: update selections', plotId, updatedSelections);
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
    console.log('%s: clear selections', plotId, ids);
    if (ids.length === 0) {
      setSelections(() => []);
    } else {
      setSelections((prevSelections) => {
        const ns = [] as SelectionBase[];
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
    console.log('%s: new selections', plotId, newSelections);
    setSelections(newSelections);
  };

  const updateBaton = (message: BatonMessage) => {
    console.log('%s: updating baton with msg:', plotId, message, 'for', uuid);
    const baton = message.baton;
    setBatonProps((old) => {
      return {
        ...old,
        batonUuid: baton,
        others: message.uuids.filter((u) => u !== uuid),
        hasBaton: baton === uuid,
      };
    });
  };

  useEffect(() => {
    if (!lastMessage) {
      return;
    }
    if (readyState !== ReadyState.OPEN) {
      console.log('%s: still not open', plotId);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = lastMessage.data;
    if (data instanceof Blob) {
      console.log('Message was a blob:', data);
      return;
    }
    // eslint-disable-next-line
    const decodedMessage = decode(data) as DecodedMessage;
    console.log('%s: decodedMessage', plotId, Object.keys(decodedMessage));

    const interaction = measureInteraction();
    afterFrame(() => {
      interactionTime.current = interaction.end();
    });

    let report = true;
    if ('mlData' in decodedMessage) {
      plotMultilineData(decodedMessage);
    } else if ('alData' in decodedMessage) {
      appendMultilineData(decodedMessage);
    } else if ('imData' in decodedMessage) {
      plotNewImageData(decodedMessage);
    } else if ('scData' in decodedMessage) {
      plotNewScatterData(decodedMessage);
    } else if ('suData' in decodedMessage) {
      plotNewSurfaceData(decodedMessage);
    } else if ('taData' in decodedMessage) {
      displayNewTableData(decodedMessage);
    } else if ('updateSelections' in decodedMessage) {
      updateSelections(decodedMessage);
    } else if ('selectionIds' in decodedMessage) {
      clearSelections(decodedMessage);
    } else if ('setSelections' in decodedMessage) {
      replaceSelections(decodedMessage);
    } else if ('baton' in decodedMessage) {
      updateBaton(decodedMessage);
    } else if ('requester' in decodedMessage) {
      approveBatonRequest(decodedMessage);
    } else if ('plotId' in decodedMessage) {
      clearAllData();
    } else {
      report = false;
      console.log('%s: new message type unknown', plotId);
    }
    if (report) {
      sendStatusMessage(`ready ${interactionTime.current}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage, plotId]);

  let currentProps = plotProps;
  if (currentProps) {
    currentProps = { ...currentProps, batonProps, updateSelection, selections };
  }

  if (currentProps) {
    console.log('%s: plotprops', plotId, Object.keys(currentProps));
  }
  if (selections.length) {
    console.log('%s: selections', plotId, selections.length);
  }

  if (!readyState || readyState === ReadyState.UNINSTANTIATED) {
    return <h2>Waiting for plot server connection</h2>;
  }

  if (readyState === ReadyState.CLOSING) {
    return <h2>Closing plot server connection</h2>;
  }

  if (readyState === ReadyState.CLOSED) {
    return <h2>Plot server connection closed</h2>;
  }

  if (!currentProps) {
    return <h2>Awaiting command from plot server</h2>;
  }

  return <AnyPlot {...currentProps} />;
}

export default ConnectedPlot;
export type { ConnectedPlotProps };
