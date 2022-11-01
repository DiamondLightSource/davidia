import '@h5web/lib/dist/styles.css';
import {
  AxisParams,
  CurveType,
  DataCurve,
  GlyphType,
  HeatmapVis,
  ResetZoomButton,
  ScaleType,
  SelectToZoom,
  TooltipMesh,
  VisCanvas,
} from '@h5web/lib';
import {decode} from 'messagepack';
import ndarray from 'ndarray';
import React from 'react';
import {ReactElement} from 'react';

let color_indices: { [id: string] : number } = {};

interface LinePlotParameters {
  data: LineData[];
  xDomain: [number, number];
  yDomain: [number, number];
  axesParameters: AxesParameters;
  plot_id: string;
}

interface HeatPlotParameters {
  values: ndarray.NdArray<number[]>;
  domain: [number, number];
  heatmapScale: ScaleType;
  axesParameters: AxesParameters;
}

type PlotProps = {
  plotParameters: LinePlotParameters | HeatPlotParameters;
};

function isHeatPlotParameters(obj : LinePlotParameters | HeatPlotParameters) : boolean {
	return 'values' in obj;
}

function createDataCurve(d : LineData, plot_id: string) : JSX.Element {
  const COLORLIST = ["rgb(0, 0, 0)", "rgb(230, 159, 0)", "rgb(86, 180, 233)", "rgb(0, 158, 115)",
                     "rgb(240, 228, 66)", "rgb(0, 114, 178)", "rgb(213, 94, 0)", "rgb(204, 121, 167)"];
  let i = color_indices[plot_id]
  let visible = true;
  let curveType = CurveType.LineAndGlyphs;
  if (!d.line_on && !d.point_size) {
    visible = false;
  } else if (d.line_on && !d.point_size) {
    curveType = CurveType.LineOnly;
  } else if (!d.line_on && d.point_size) {
    curveType = CurveType.GlyphsOnly;
  }

  if (!d.color) {
    d.color = COLORLIST[i%COLORLIST.length]
    ++i;
    color_indices[plot_id] = i;
  }

	return <DataCurve
            key={d.key}
            abscissas={d.x}
            ordinates={d.y}
            color={d.color}
            curveType={curveType}
            glyphType={GlyphType.Circle}
            glyphSize={d.point_size}
            visible={visible}
          />;
}


class Plot extends React.Component<PlotProps> {
  render() {
    if (isHeatPlotParameters(this.props.plotParameters)) {
      const heatPlotParams: HeatPlotParameters = this.props.plotParameters as HeatPlotParameters;
      return (
        <>
          <HeatmapVis
            dataArray={heatPlotParams.values}
            domain={heatPlotParams.domain}
            colorMap="Warm"
            scaleType={heatPlotParams.heatmapScale}
            layout="fill"
            showGrid
            abscissaParams={ {scaleType: heatPlotParams.axesParameters.x_scale, label: heatPlotParams.axesParameters.x_label} as AxisParams}
            ordinateParams={ {scaleType: heatPlotParams.axesParameters.y_scale, label: heatPlotParams.axesParameters.y_label} as AxisParams}
          ></HeatmapVis>
        </>
      );
    } else {
      const linePlotParams: LinePlotParameters = this.props.plotParameters as LinePlotParameters;
      if(!(linePlotParams.plot_id in color_indices)) {
        color_indices[linePlotParams.plot_id] = 0;
      }
      const tooltipText = (x: number, y: number): ReactElement<string> => {
        return <p>{x.toPrecision(8)}, {y.toPrecision(8)}</p>;
      };
      return (
        <>
          <VisCanvas
            abscissaConfig={{
              visDomain: linePlotParams.xDomain,
              showGrid: true,
              scaleType: linePlotParams.axesParameters.x_scale as ScaleType,
              label: linePlotParams.axesParameters.x_label,
            }}
            ordinateConfig={{
              visDomain: linePlotParams.yDomain,
              showGrid: true,
              scaleType: linePlotParams.axesParameters.y_scale as ScaleType,
              label: linePlotParams.axesParameters.y_label,
            }}
          >
            {Array.from(linePlotParams.data).map(d => (createDataCurve(d, linePlotParams.plot_id)))}
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
  lineAxesParams: AxesParameters;
  imageData?: ImageData;
  imageAxesParams: AxesParameters;
};

class PlotComponent extends React.Component<PlotComponentProps, PlotStates> {
  public static defaultProps = {hostname: '127.0.0.1', port: '8000'};
  constructor(props: PlotComponentProps) {
    super(props);
    this.state = {
      multilineData: [],
      lineAxesParams: {x_scale: ScaleType.Linear, y_scale: ScaleType.Linear},
      imageAxesParams: {x_scale: ScaleType.Linear, y_scale: ScaleType.Linear}
    };
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
        plot_config: {},
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
          plot_config: {},
        };
        this.socket.send(JSON.stringify(status));
      }
    };
  }

  plot_multiline_data = (message: MultiLineDataMessage) => {
    console.log(message);
    let multilineData = message.data;
    const newLineAxesParams = message.axes_parameters
    this.multilineXDomain = this.calculateMultiXDomain(multilineData);
    this.multilineYDomain = this.calculateMultiYDomain(multilineData);
    multilineData = message.data;
    this.setState({multilineData: multilineData, lineAxesParams: newLineAxesParams});
  };

  plot_new_line_data = (message: LineDataMessage) => {
    console.log(message);
    const newLineData = message.data;
    const newLineAxesParams = message.axes_parameters
    console.log('new line for plot "', this.props.plot_id, '"');
    const multilineData = this.state.multilineData as LineData[];
    multilineData.push(newLineData);
    this.multilineXDomain = this.calculateMultiXDomain(multilineData);
    this.multilineYDomain = this.calculateMultiYDomain(multilineData);
    this.setState({multilineData: multilineData, lineAxesParams: newLineAxesParams});
    console.log('adding new line: ', newLineData);
  };

  plot_new_image_data = (message: ImageDataMessage) => {
    console.log(message);
    const newImageData = message.data;
    console.log('newImageData', newImageData)
    const newImageAxesParams = message.axes_parameters
    console.log('newImageAxesParams', newImageAxesParams)
    console.log('new image for plot "', this.props.plot_id, '"');
    this.setState({imageData: newImageData, imageAxesParams: newImageAxesParams});
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
    this.setState({
      multilineData: [],
      imageData: undefined,
      lineAxesParams: {x_scale: ScaleType.Linear, y_scale: ScaleType.Linear},
      imageAxesParams: {x_scale: ScaleType.Linear, y_scale: ScaleType.Linear}
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
      const i = this.state.imageData;
      const plotParams : HeatPlotParameters = {
        values: ndarray(i.values, i.shape),
        domain: i.domain,
        heatmapScale: i.heatmap_scale as ScaleType,
        axesParameters: this.state.imageAxesParams
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
      axesParameters: this.state.lineAxesParams,
      plot_id: this.props.plot_id
    };
    return (
      <>
        <Plot plotParameters={plotParams} />
      </>
    );
  }
}

export default PlotComponent;
