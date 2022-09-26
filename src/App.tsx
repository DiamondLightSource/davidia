import '@h5web/lib/dist/styles.css';
import { CurveType } from '@h5web/lib';
import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { decode } from "messagepack";
import Plot from "./Plot"


const socket = new WebSocket('ws://127.0.0.1:8000/plot');
socket.binaryType = "arraybuffer";

let multilineXDomain0: any = [0, 0];
let multilineYDomain0: any = [0, 0];
let multilineXDomain1: any = [0, 0];
let multilineYDomain1: any = [0, 0];

interface LinePlotParameters {
  data: LineData[];
  xDomain: [number, number];
  yDomain: [number, number];
  curveType: CurveType;
}
type AppMainProps = {
  instance: number
};
type AppMainStates = {
  multilineData0: LineData[],
  multilineData1: LineData[]
};

class AppMain extends React.Component<AppMainProps, AppMainStates> {
  constructor(props: AppMainProps) {
    super(props)
    this.state = {
      multilineData0: [],
      multilineData1: []
    }
    this.onSubmitForm = this.onSubmitForm.bind(this);
  }

  lineID = 3;

  componentDidMount() {
    socket.onopen = () => {
        console.log('WebSocket Client Connected');
        let initStatus: PlotMessage = {'type': 0, "params": {"status":"ready"}};
        socket.send(JSON.stringify(initStatus));
      };
      socket.onmessage = (event: MessageEvent) => {
        const decoded_message: LineDataMessage | MultiDataMessage | ClearPlotsMessage = decode(event.data);
        console.log('decoded_message: ', decoded_message)
        switch (decoded_message["type"]) {
          case "multiline data":
            console.log('data type is multiline data')
            const multiMessage = decoded_message as MultiDataMessage;
            this.plot_multiline_data(multiMessage);
            let multiStatus: PlotMessage = {'type': 0, "params": {"status":"ready"}};
            socket.send(JSON.stringify(multiStatus));
            break;
          case "new line data":
            console.log('data type is new line data')
            const newLineMessage = decoded_message as LineDataMessage;
            this.plot_new_line_data(newLineMessage);
            let lineStatus: PlotMessage = {'type': 0, "params": {"status":"ready"}};
            socket.send(JSON.stringify(lineStatus));
            break;
          case "clear plots":
            console.log('clearing data')
            this.clear_all_line_data();
            let clearStatus: PlotMessage = {'type': 0, "params": {"status":"ready"}};
            socket.send(JSON.stringify(clearStatus));
            break;
          default:
            console.log('data type is: ', decoded_message["type"])
          }
      };
  }

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

  sendNewLineRequest = async (plotID: string, nextLineID: number) => {
    await this.waitForOpenSocket(socket)
    let message_params: NewLineParams = {'plot_id': plotID, 'line_id': String(nextLineID)};
    let message: PlotMessage = {'type': 1, 'params': message_params};
    socket.send(JSON.stringify(message));
  }

  plot_multiline_data = (message: MultiDataMessage) => {
    console.log(message);
    console.log("multi message plot id is: ", typeof(message.plot_id))
    if (message.plot_id === "0") {
      let multilineData = message.data;
      multilineXDomain0 = this.calculateMultiXDomain(multilineData);
      multilineYDomain0 = this.calculateMultiYDomain(multilineData);
      multilineData = message.data;
      this.setState({ multilineData0: multilineData })
    } else if (message.plot_id === "1") {
    let multilineData = message.data;
    multilineXDomain1 = this.calculateMultiXDomain(multilineData);
    multilineYDomain1 = this.calculateMultiYDomain(multilineData);
    multilineData = message.data;
    this.setState({ multilineData1: multilineData })
    }
  }

  plot_new_line_data = (message: LineDataMessage) => {
    console.log(message);
    console.log("new line message plot id is: ", typeof(message.plot_id))
    const newLineData = message.data;
    if (message.plot_id === "0") {
      console.log("new line for plot 0");
      const multilineData = this.state.multilineData0;
      multilineData.push(newLineData);
      multilineXDomain0 = this.calculateMultiXDomain(multilineData);
      multilineYDomain0 = this.calculateMultiYDomain(multilineData);
      this.setState({ multilineData0: multilineData })
      console.log("adding new line to plot 0: ", newLineData);
    } else if (message.plot_id === "1") {
      const multilineData = this.state.multilineData1;
      multilineData.push(newLineData);
      multilineXDomain1 = this.calculateMultiXDomain(multilineData);
      multilineYDomain1 = this.calculateMultiYDomain(multilineData);
      this.setState({ multilineData1: multilineData })
      console.log("adding new line to plot 1: ", newLineData);
    }
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
    multilineXDomain0 = [0, 1]
    multilineYDomain0 = [0, 1]
    multilineXDomain1 = [0, 1]
    multilineYDomain1 = [0, 1]
    this.setState({ multilineData0: [] })
    this.setState({ multilineData1: [] })
    console.log("data cleared: ", this.state.multilineData0, multilineXDomain0, multilineYDomain0, multilineXDomain1, multilineYDomain1, this.state.multilineData1);
  }

  onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('preventing default behaviour when pressing Enter key');
  }

  handleAddLine = (plotID: string) => {
    console.log('Requesting new line')
    this.lineID++;
    this.sendNewLineRequest(plotID, this.lineID);
  }

    render() {
      let plotParams0: LinePlotParameters = { data:this.state.multilineData0, xDomain:multilineXDomain0, yDomain:multilineYDomain0, curveType:CurveType.LineOnly }
      let plotParams1: LinePlotParameters = { data:this.state.multilineData1, xDomain:multilineXDomain1, yDomain:multilineYDomain1, curveType:CurveType.LineOnly }

      return (
        <>
        <button onClick={() => this.handleAddLine('0')}>Add line</button>
        <Plot plotParameters={plotParams0}/>
        <button onClick={() => this.handleAddLine('1')}>Add line</button>
        <Plot plotParameters={plotParams1}/>
        </>
      );
    }
  }


export default function App() {
  return (
    <>
      <AppMain instance={0}/>
    </> );
 }
