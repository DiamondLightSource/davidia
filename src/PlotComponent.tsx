import '@h5web/lib/dist/styles.css';
import { CurveType, DataCurve, HeatmapVis, ResetZoomButton, SelectToZoom, TooltipMesh, VisCanvas } from '@h5web/lib';
import { decode } from "messagepack";
import ndarray from 'ndarray';
import React from 'react';


interface LinePlotParameters {
  data: LineData[];
  xDomain: [number, number];
  yDomain: [number, number];
  curveType: CurveType;
  }


interface HeatPlotParameters {
  values: ndarray.NdArray<number[]>,
  domain: [number, number],
  }


function instanceOfHeatPlotParameters(object: any): object is HeatPlotParameters {
    return 'values' in object;
}


type PlotProps = {
    plotParameters: LinePlotParameters | HeatPlotParameters
  };

class Plot extends React.Component<PlotProps> {
  render() {
    if (instanceOfHeatPlotParameters(this.props.plotParameters)) {
    return (
      <>
      <HeatmapVis colorMap="Warm" dataArray={this.props.plotParameters.values} domain={this.props.plotParameters.domain} layout="fill" scaleType="linear" showGrid>
      </HeatmapVis>
      </>
      );
    }
    else {
      let curveType = this.props.plotParameters.curveType;
      return (
        <>
        <VisCanvas
        abscissaConfig={{ visDomain: this.props.plotParameters.xDomain, showGrid: true }}
        ordinateConfig={{ visDomain: this.props.plotParameters.yDomain, showGrid: true }}
        >
        {Array.from(this.props.plotParameters.data).map(d => <DataCurve key={d.id} abscissas={d.x} ordinates={d.y} color={d.colour} curveType={curveType}/>)}
        <TooltipMesh renderTooltip={(x, y) => <p>{x + "," + y}</p>} />
        <SelectToZoom/>
        <ResetZoomButton/>
        </VisCanvas>
    </>
      );
    }
  }
}


type PlotComponentProps = {
  plot_id: string,
  hostname: string,
  port: string
};

type PlotStates = {
  multilineData: LineData[]};

class PlotComponent extends React.Component<PlotComponentProps, PlotStates> {
  public static defaultProps = {hostname: "ws://127.0.0.1", port: "8000"};
  constructor(props: PlotComponentProps) {
    super(props)
    this.state = {multilineData: []}
  }
  socket: WebSocket = new WebSocket(this.props.hostname + ':' + this.props.port + '/plot/' + this.props.plot_id);
  multilineXDomain: any = [0, 0];
  multilineYDomain: any = [0, 0];

  waitForOpenSocket = async (socket: WebSocket) => {
    return new Promise<void>((resolve) => {
      if (socket.readyState !== socket.OPEN) {
        socket.addEventListener("open", (_) => {
          resolve();
        })
      } else {
        resolve();
      }
    });
  }

  componentDidMount() {
    this.socket.binaryType = "arraybuffer"
    this.socket.onopen = () => {
        console.log('WebSocket Client Connected');
        let initStatus: PlotMessage = {'plot_id': this.props.plot_id, 'type': 0, "params": {"status":"ready"}};
        this.socket.send(JSON.stringify(initStatus));
      };
      this.socket.onmessage = (event: MessageEvent) => {
        const decoded_message: LineDataMessage | MultiLineDataMessage | ClearPlotsMessage = decode(event.data);
        console.log('decoded_message: ', decoded_message)
        switch (decoded_message["type"]) {
          case "MultiLineDataMessage":
            console.log('data type is multiline data')
            const multiMessage = decoded_message as MultiLineDataMessage;
            this.plot_multiline_data(multiMessage);
            let multiStatus: PlotMessage = {'plot_id': this.props.plot_id, 'type': 0, "params": {"status":"ready"}};
            this.socket.send(JSON.stringify(multiStatus));
            break;
          case "LineDataMessage":
            console.log('data type is new line data')
            const newLineMessage = decoded_message as LineDataMessage;
            this.plot_new_line_data(newLineMessage);
            let lineStatus: PlotMessage = {'plot_id': this.props.plot_id, 'type': 0, "params": {"status":"ready"}};
            this.socket.send(JSON.stringify(lineStatus));
            break;
          case "ClearPlotsMessage":
            console.log('clearing data')
            this.clear_all_line_data();
            let clearStatus: PlotMessage = {'plot_id': this.props.plot_id, 'type': 0, "params": {"status":"ready"}};
            this.socket.send(JSON.stringify(clearStatus));
            break;
          default:
            console.log('data type is: ', decoded_message["type"])
          }
      };
  }

  plot_multiline_data = (message: MultiLineDataMessage) => {
    console.log(message);
    let multilineData = message.data;
    this.multilineXDomain = this.calculateMultiXDomain(multilineData);
    this.multilineYDomain = this.calculateMultiYDomain(multilineData);
    multilineData = message.data;
    this.setState({ multilineData: multilineData })
  }

  plot_new_line_data = (message: LineDataMessage) => {
    console.log(message);
    const newLineData = message.data;
    console.log("new line for plot 0");
    const multilineData = this.state.multilineData;
    multilineData.push(newLineData);
    this.multilineXDomain = this.calculateMultiXDomain(multilineData);
    this.multilineYDomain = this.calculateMultiYDomain(multilineData);
    this.setState({ multilineData: multilineData })
    console.log("adding new line to plot: ", newLineData);
  }

  calculateMultiXDomain = (multilineData: LineData[]) => {
    console.log('calculating multi x domain ', multilineData)
    let minimum: number = multilineData[0].x[0];
    let maximum: number = multilineData[0].x[0];
    for (let i = 0; i < multilineData.length; i++) {
      minimum = Math.min(...multilineData[i].x, minimum)
      maximum = Math.max(...multilineData[i].x, maximum)
    }
    return [minimum, maximum]
  }

  calculateMultiYDomain = (multilineData: LineData[]) => {
    console.log('calculating multi y domain ', multilineData)
    let minimum: number = multilineData[0].y[0];
    let maximum: number = multilineData[0].y[0];
    for (let i = 0; i < multilineData.length; i++) {
      minimum = Math.min(...multilineData[i].y, minimum)
      maximum = Math.max(...multilineData[i].y, maximum)
    }
    return [minimum, maximum]
  }

  clear_all_line_data = () => {
    this.multilineXDomain = [0, 1]
    this.multilineYDomain = [0, 1]
    this.setState({ multilineData: [] })
    console.log("data cleared: ", this.state.multilineData, this.multilineXDomain, this.multilineYDomain);
  }

  render() {
    let plotParams: LinePlotParameters = { data:this.state.multilineData, xDomain:this.multilineXDomain, yDomain:this.multilineYDomain, curveType:CurveType.LineOnly }

    return (
      <>
      <Plot plotParameters={plotParams}/>
      </>
    );
  }
}

export default PlotComponent;