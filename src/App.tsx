import '@h5web/lib/dist/styles.css';
import { CurveType } from '@h5web/lib';
import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { decode } from "messagepack";
import Plot from "./Plot"


const socket = new WebSocket('ws://127.0.0.1:8000/plot');
socket.binaryType = "arraybuffer";

let multilineXDomain: any = [0, 0];
let multilineYDomain: any = [0, 0];

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
  yDomain: [number, number],
  lineYDomain: [number, number],
  multilineData: LineData[]
};

class AppMain extends React.Component<AppMainProps, AppMainStates> {
  constructor(props: AppMainProps) {
    super(props)
    this.state = {
      yDomain: [0, 1],
      lineYDomain: [0, 1],
      multilineData: []
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
        const decoded_message: LineDataMessage | MultiDataMessage = decode(event.data);
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

  sendNewLineRequest = async (nextLineID: number) => {
    await this.waitForOpenSocket(socket)
    let message_params: NewLineParams = {'line_id': String(nextLineID)};
    let message: PlotMessage = {'type': 1, 'params': message_params};
    socket.send(JSON.stringify(message));
  }

  plot_multiline_data = (message: MultiDataMessage) => {
    console.log(message);
    let multilineData = message.data;
    multilineXDomain = this.calculateMultiXDomain(multilineData);
    multilineYDomain = this.calculateMultiYDomain(multilineData);
    multilineData = message.data;
    this.setState({ multilineData: multilineData })
  }

  plot_new_line_data = (message: LineDataMessage) => {
    console.log(message);
    const newLineData = message.data;
    const multilineData = this.state.multilineData;
    multilineData.push(newLineData);
    multilineXDomain = this.calculateMultiXDomain(multilineData);
    multilineYDomain = this.calculateMultiYDomain(multilineData);
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

  onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('preventing default behaviour when pressing Enter key');
  }

  handleAddLine = () => {
    console.log('Requesting new line')
    this.lineID++;
    this.sendNewLineRequest(this.lineID);
  }

    render() {
      let params: LinePlotParameters = { data:this.state.multilineData, xDomain:multilineXDomain, yDomain:multilineYDomain, curveType:CurveType.LineOnly }
      return (
        <>
        <button onClick={this.handleAddLine}>Add line</button>
        <Plot plotParameters={params}/>
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
