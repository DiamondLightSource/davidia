import afterFrame from 'afterframe';
import { decode, encode } from '@msgpack/msgpack';
import { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { toast } from 'react-toastify';

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
  serializeSelection,
} from './selections/utils';
import type { AnyPlotProps } from './AnyPlot';
import type { LineData, LineParams } from './LinePlot';
import type { HeatmapData } from './HeatmapPlot';
import type { ScatterData } from './ScatterPlot';

type DecodedMessage =
  | MultiLineMessage
  | ImageMessage
  | ScatterMessage
  | SurfaceMessage
  | TableMessage
  | SelectionsMessage
  | ClearSelectionsMessage
  | ClearPlotMessage
  | BatonMessage
  | BatonRequestMessage;

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
 * A baton donate message
 */
interface BatonDonateMessage {
  /** The uuid of the client the baton is offered to */
  receiver: string;
}

/**
 * A plot message
 * @member {CPlotConfig} plotConfig - plot configuration
 */
interface _PlotMessage {
  /** The plot ID */
  plotId: string;
}

/**
 * A selections message
 */
interface SelectionsMessage extends _PlotMessage {
  update: boolean;
  /** The selections */
  setSelections: SelectionBase[];
}

/**
 * A clear selections message
 */
interface ClearSelectionsMessage extends _PlotMessage {
  /** The selection IDs */
  selectionIds: string[];
}

/**
 * A client status message
 */
interface ClientStatusMessage {
  status: string;
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
 * A client config message
 */
interface ClientConfigMessage {
  config: Map<string, string>;
}

type ClientMessage =
  | ClientStatusMessage
  | ClientSelectionMessage
  | ClientLineParametersMessage
  | ClientScatterParametersMessage
  | ClearSelectionsMessage
  | ClientConfigMessage
  | BatonRequestMessage
  | BatonDonateMessage;

/**
 * A clear plot message
 */
interface ClearPlotMessage {
  /** The plot ID */
  plotId: string;
}

/**
 * A data message
 * @member {CPlotConfig} plotConfig - plot configuration
 */
interface _DataMessage extends _PlotMessage {
  /** The plot ID */
  plotConfig: CPlotConfig;
}

/**
 * A multiline data message
 */
interface MultiLineMessage extends _DataMessage {
  append: boolean;
  /** The multiline data */
  mlData: CLineData[];
}

/**
 * An image data message
 */
interface ImageMessage extends _DataMessage {
  /** The image data */
  imData: CImageData;
}

/**
 * A scatter data message
 */
interface ScatterMessage extends _DataMessage {
  /** The scatter data */
  scData: CScatterData;
}

/**
 * A surface data message
 */
interface SurfaceMessage extends _DataMessage {
  /** The surface data */
  suData: CSurfaceData;
}

/**
 * A table data message
 */
interface TableMessage extends _DataMessage {
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
  /** A configuration map */
  config?: object;
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
  port = '80',
  config,
  uuid,
}: ConnectedPlotProps) {
  const [plotProps, setPlotProps] = useState<AnyPlotProps | null>();
  const [lineData, setLineData] = useState<LineData[]>([]);
  const [linePlotConfig, setLinePlotConfig] =
    useState<PlotConfig>(defaultPlotConfig);
  const [scatterData, setScatterData] = useState<ScatterData>();

  const [configMap, setConfigMap] = useState(config);
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

  if (config != configMap) {
    setConfigMap(config);
  }

  const sendClientMessage = useCallback(
    (data: ClientMessage) => {
      console.log('%s: sending', plotId, data);
      sendMessage(encode(data));
    },
    [plotId, sendMessage]
  );

  const sendStatusMessage = useCallback(
    (message: string) => {
      sendClientMessage({ status: message });
    },
    [sendClientMessage]
  );

  const sendBatonRequestMessage = () => {
    sendClientMessage({ requester: uuid });
  };

  const offerBatonRequest = (uuid: string) => {
    sendClientMessage({ receiver: uuid });
  };

  const [batonProps, setBatonProps] = useState<BatonProps>({
    uuid: uuid,
    batonUuid: '',
    others: [],
    hasBaton: false,
    requestBaton: sendBatonRequestMessage,
    offerBaton: offerBatonRequest,
  });

  const handleSelectionsEvent: SelectionsEventListener = (
    type: SelectionsEventType,
    dragging: boolean,
    selection?: SelectionBase
  ) => {
    // if dragging don't broadcast
    if (!dragging) {
      if (type === SelectionsEventType.removed) {
        sendClientMessage({
          selectionIds: selection ? [selection.id] : [],
        } as ClearSelectionsMessage);
      } else if (selection) {
        sendClientMessage({
          selection: serializeSelection(selection),
        } as ClientSelectionMessage);
      }
    }
  };

  const { selections, updateSelection, setSelections } = useSelections(
    undefined,
    handleSelectionsEvent
  );

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

  useEffect(() => {
    if (readyState === ReadyState.OPEN && configMap) {
      sendClientMessage({ config: configMap } as ClientConfigMessage);
    }
  }, [readyState, configMap, sendClientMessage]);

  const clearLineData = () => {
    setLineData([]);
    setLinePlotConfig(defaultPlotConfig);
    setPlotProps(null);
    setSelections([]);
  };

  const clearAllData = () => {
    clearLineData();
    console.log('%s: data cleared', plotId, Object.keys(linePlotConfig));
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
    console.log('Finding old line with key', key);
    const old = lineData.findIndex((s) => s.key === key);
    if (old === -1) {
      console.log('Line with key', key, 'cannot be found');
      return lineData;
    }

    const all = [...lineData];
    console.debug('Replacing old line params with', params);
    all[old] = { ...all[old], ...params };

    if (broadcast) {
      sendClientMessage({
        key: key,
        lineParams: params,
      });
    }
    return all;
  };

  const updateScatterParams = (newSize: number, broadcast = true) => {
    if (scatterData != undefined) {
      setScatterData({ ...scatterData, pointSize: newSize });
    }

    if (broadcast) {
      sendClientMessage({
        pointSize: newSize,
      });
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
    setLineData(multilineData);
    setLinePlotConfig(plotConfig);
    setPlotProps({
      lineData: multilineData,
      xDomain,
      yDomain,
      plotConfig,
      updateLineParams,
    });
  };

  const appendMultilineData = (message: MultiLineMessage) => {
    const newPointsData = message.mlData.map((l) => createLineData(l));
    console.log('%s: appending line data', plotId, Object.keys(newPointsData));
    const l = Math.max(lineData.length, newPointsData.length);
    const newLineData: LineData[] = [];
    for (let i = 0; i < l; i++) {
      newLineData.push(appendLineData(lineData[i], newPointsData[i]));
    }
    updateLineData(newLineData);
  };

  const plotMultilineData = (message: MultiLineMessage) => {
    const plotConfig = createPlotConfig(message.plotConfig);
    if (message.append) {
      appendMultilineData(message);
    } else {
      const multilineData = message.mlData
        .map((l) => createLineData(l))
        .filter((d) => d !== null);
      console.log(
        '%s: new line data',
        plotId,
        multilineData.map((o: LineData) => o.key)
      );
      updateLineData(multilineData, plotConfig);
    }
  };

  const plotNewImageData = (message: ImageMessage) => {
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

  const plotNewScatterData = (message: ScatterMessage) => {
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

  const plotNewSurfaceData = (message: SurfaceMessage) => {
    const surfaceData = createSurfaceData(message.suData);
    console.log('%s: new surface data', plotId, Object.keys(surfaceData));
    const surfacePlotConfig = createPlotConfig(message.plotConfig);
    setPlotProps({
      ...surfaceData,
      plotConfig: surfacePlotConfig,
    });
  };

  const displayNewTableData = (message: TableMessage) => {
    const tableData = createTableData(message.taData);
    console.log('%s: new table data', plotId, Object.keys(tableData));
    setPlotProps({
      ...tableData,
    });
  };

  const updateSelections = (message: SelectionsMessage) => {
    const newSelections = message.setSelections
      .map((s) => cloneSelection(s))
      .filter((s) => s !== null) as SelectionBase[];
    if (message.update) {
      console.log('%s: update selections', plotId, newSelections);
      setSelections((prevSelections) => {
        const ns = [...prevSelections];
        for (const s of newSelections) {
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
    } else {
      console.log('%s: new selections', plotId, newSelections);
      setSelections(newSelections);
    }
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

  const updateBaton = (message: BatonMessage) => {
    console.log('%s: updating baton with msg:', plotId, message, 'for', uuid);
    const baton = message.baton;
    setBatonProps((old) => ({
      ...old,
      batonUuid: baton,
      others: message.uuids.filter((u) => u !== uuid),
      hasBaton: baton === uuid,
    }));
  };

  const [processedMessage, setProcessedMessage] = useState(lastMessage);
  if (processedMessage != lastMessage && lastMessage != null) {
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
      interaction.end();
    });

    let report = true;
    if ('mlData' in decodedMessage) {
      plotMultilineData(decodedMessage);
    } else if ('imData' in decodedMessage) {
      plotNewImageData(decodedMessage);
    } else if ('scData' in decodedMessage) {
      plotNewScatterData(decodedMessage);
    } else if ('suData' in decodedMessage) {
      plotNewSurfaceData(decodedMessage);
    } else if ('taData' in decodedMessage) {
      displayNewTableData(decodedMessage);
    } else if ('selectionIds' in decodedMessage) {
      clearSelections(decodedMessage);
    } else if ('setSelections' in decodedMessage) {
      updateSelections(decodedMessage);
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
      const measures = performance.getEntriesByType('measure');
      const first = measures.shift();
      sendStatusMessage(`ready ${first?.duration}`);
    }

    setProcessedMessage(lastMessage);
  }

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
