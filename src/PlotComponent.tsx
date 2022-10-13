import '@h5web/lib/dist/styles.css';
import {
  DataCurve,
  GlyphType,
  HeatmapVis,
  ResetZoomButton,
  SelectToZoom,
  TooltipMesh,
  VisCanvas,
} from '@h5web/lib';
import {decode} from 'messagepack';
import ndarray from 'ndarray';
import React from 'react';
import {ReactElement} from 'react';

interface LinePlotParameters {
  data: LineData[];
  xDomain: [number, number];
  yDomain: [number, number];
}

interface HeatPlotParameters {
  values: ndarray.NdArray<number[]>;
  domain: [number, number];
}

type PlotProps = {
  plotParameters: LinePlotParameters | HeatPlotParameters;
};

function isHeatPlotParameters(obj : LinePlotParameters | HeatPlotParameters) : boolean {
	return 'values' in obj;
}

class Plot extends React.Component<PlotProps> {
  render() {
    if (isHeatPlotParameters(this.props.plotParameters)) {
      const heatPlotParams: HeatPlotParameters = this.props.plotParameters as HeatPlotParameters;
      return (
        <>
          <HeatmapVis
            colorMap="Warm"
            dataArray={heatPlotParams.values}
            domain={heatPlotParams.domain}
            layout="fill"
            scaleType="linear"
            showGrid
          ></HeatmapVis>
        </>
      );
    } else {
      const linePlotParams: LinePlotParameters = this.props.plotParameters as LinePlotParameters;
      const tooltipText = (x: number, y: number): ReactElement<string> => {
        return <p>`${x}, ${y}`</p>;
      };
      return (
        <>
          <VisCanvas
            abscissaConfig={{
              visDomain: linePlotParams.xDomain,
              showGrid: true,
            }}
            ordinateConfig={{
              visDomain: linePlotParams.yDomain,
              showGrid: true,
            }}
          >
            {Array.from(linePlotParams.data).map(d => (
              <DataCurve
                key={d.id}
                abscissas={d.x}
                ordinates={d.y}
                color={d.colour}
                curveType={d.curve_type}
                glyphType={GlyphType.Circle}
                glyphSize={8}
              />
            ))}
            <TooltipMesh renderTooltip={tooltipText} />
            <SelectToZoom />
            <ResetZoomButton />
          </VisCanvas>
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
  multilineData: LineData[];
  imageData?: ImageData;
};

class PlotComponent extends React.Component<PlotComponentProps, PlotStates> {
  public static defaultProps = {hostname: '127.0.0.1', port: '8000'};
  constructor(props: PlotComponentProps) {
    super(props);
    this.state = {multilineData: []};
  }
  socket: WebSocket = new WebSocket(
    `ws://${this.props.hostname}:${this.props.port}/plot/${this.props.plot_id}`

  );
  multilineXDomain: [number, number] = [0, 0];
  multilineYDomain: [number, number] = [0, 0];

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
        type: 0,
        params: {status: 'ready'},
      };
      this.socket.send(JSON.stringify(initStatus));
    };
    this.socket.onmessage = (event: MessageEvent) => {
      const decoded_message:
        | LineDataMessage
        | MultiLineDataMessage
        | ImageDataMessage
        | ClearPlotsMessage = decode(event.data);
      console.log('decoded_message: ', decoded_message);
      let report = true;
      const message_type = decoded_message['type'] as string;
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
          type: 0,
          params: {status: 'ready'},
        };
        this.socket.send(JSON.stringify(status));
      }
    };
  }

  plot_multiline_data = (message: MultiLineDataMessage) => {
    console.log(message);
    let multilineData = message.data;
    this.multilineXDomain = this.calculateMultiXDomain(multilineData);
    this.multilineYDomain = this.calculateMultiYDomain(multilineData);
    multilineData = message.data;
    this.setState({multilineData: multilineData});
  };

  plot_new_line_data = (message: LineDataMessage) => {
    console.log(message);
    const newLineData = message.data;
    console.log('new line for plot "', this.props.plot_id, '"');
    const multilineData = this.state.multilineData as LineData[];
    multilineData.push(newLineData);
    this.multilineXDomain = this.calculateMultiXDomain(multilineData);
    this.multilineYDomain = this.calculateMultiYDomain(multilineData);
    this.setState({multilineData: multilineData});
    console.log('adding new line: ', newLineData);
  };

  plot_new_image_data = (message: ImageDataMessage) => {
    console.log(message);
    const newImageData = message.data;
    console.log('new image for plot "', this.props.plot_id, '"');
    this.setState({imageData: newImageData});
    console.log('adding new image: ', newImageData);
  };

  calculateMultiXDomain(multilineData: LineData[]): [number, number] {
    console.log('calculating multi x domain ', multilineData);
    const firstData = multilineData[0].x;
    let minimum: number = Math.min(...firstData);
    let maximum: number = Math.max(...firstData);
    for (let i = 1; i < multilineData.length; i++) {
      const currentData = multilineData[i].x;
      minimum = Math.min(...currentData, minimum);
      maximum = Math.max(...currentData, maximum);
    }
    return [minimum, maximum];
  }

  calculateMultiYDomain = (multilineData: LineData[]): [number, number] => {
    console.log('calculating multi y domain ', multilineData);
    const firstData = multilineData[0].y;
    let minimum: number = Math.min(...firstData);
    let maximum: number = Math.max(...firstData);
    for (let i = 1; i < multilineData.length; i++) {
      const currentData = multilineData[i].y;
      minimum = Math.min(...currentData, minimum);
      maximum = Math.max(...currentData, maximum);
    }
    return [minimum, maximum];
  };

  clear_all_line_data = () => {
    this.multilineXDomain = [0, 1];
    this.multilineYDomain = [0, 1];
    this.setState({multilineData: [], imageData: undefined});
    console.log(
      'data cleared: ',
      this.state.multilineData,
      this.multilineXDomain,
      this.multilineYDomain
    );
  };

  render() {
    if (this.state.imageData !== undefined) {
      const i = this.state.imageData;
      const plotParams : HeatPlotParameters = {
        values: ndarray(i.values, i.shape),
        domain: i.domain,
      };
      return (
        <>
          <Plot plotParameters={plotParams} />
        </>
      );
    }
    const plotParams: LinePlotParameters = {
      data: this.state.multilineData,
      xDomain: this.multilineXDomain,
      yDomain: this.multilineYDomain,
    };
    return (
      <>
        <Plot plotParameters={plotParams} />
      </>
    );
  }
}

export default PlotComponent;
