import '@h5web/lib/dist/styles.css';
import {  getDomain } from '@h5web/lib';
import ndarray from 'ndarray';
import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Row } from 'react-bootstrap';
import { decode } from "messagepack";
import { Vector2 } from 'three';
import LinePlot from "./LinePlot"
import HeatPlot from "./HeatPlot"
import MultiLinePlot from "./MultiLinePlot"
import FunctionSelector from "./FunctionSelector"
import SelectionSwitch from "./SelectionSwitch"
import AmplitudeSelector from "./AmplitudeSelector"
import IntegralBox from "./IntegralBox"
import ProfileSumLine from "./ProfileSumLine"


const socket = new WebSocket('ws://127.0.0.1:5000/status');
socket.binaryType = "arraybuffer";
const minAmplitude = 1;
const maxAmplitude = 20;
let integralError: number | null = null;
let lineXArray: any = [0, 0];
let lineYArray: ndarray.NdArray<any> = ndarray([0, 0]);
let profileXArray: any = [0, 0];
let profileYArray: ndarray.NdArray<any> = ndarray([0, 0]);
let profileYDomain: any = [0, 0];
let multilineXDomain: any = [0, 0];
let multilineYDomain: any = [0, 0];
let heatmapValues: ndarray.NdArray<any> = ndarray(
  new Float32Array([0, 0, 0, 0]),
  [2, 2]
);
let heatmapDomain: any = [0, 0];


interface LineData {
  id: string;
  colour: string;
  x: number[];
  y: number[];
}

interface ActiveSelection {
  startPoint: Vector2;
  endPoint: Vector2;
}

interface LineDataMessage {
  type: string;
  data: LineData;
}
interface MultiDataMessage {
  type: string;
  data: LineData[];
}
interface HeatmapDataMessage {
  type: string;
  data: HeatmapData;
}
interface IntegralMessage {
  type: string;
  data: IntegralData;
}
interface IntegralData {
  integral: number;
  error: number;
}
interface HeatmapData {
  rows: number;
  columns: number;
  values: number[];
}

type AppMainProps = {
  instance: number
};
type AppMainStates = {
  yDomain: [number, number],
  lineYDomain: [number, number],
  profileYDomain: [number, number],
  heatmapDomain: [number, number],
  activeSelection: ActiveSelection | null,
  active2DSelection: ActiveSelection | null,
  integral: number | null,
  multilineData: LineData[]
};

class AppMain extends React.Component<AppMainProps, AppMainStates> {
  constructor(props: AppMainProps) {
    super(props)
    this.state = {
      yDomain: [0, 1],
      lineYDomain: [0, 1],
      profileYDomain: [0, 1],
      heatmapDomain: [0, 1],
      activeSelection: null,
      active2DSelection: null,
      integral: null,
      multilineData: []
    }
    this.onSubmitForm = this.onSubmitForm.bind(this);
    this.handleFuncSelect = this.handleFuncSelect.bind(this);
    this.handleAmpSelect = this.handleAmpSelect.bind(this);
  }

  funcSelection = "Sine";
  ampSelection = "10";
  integralError = null;
  selectionOn = false;
  lineID = 3;

  componentDidMount() {
    socket.onopen = () => {
        console.log('WebSocket Client Connected');
        socket.send(JSON.stringify({"type":"status","text":"ready"}));
      };
      socket.onmessage = (event: MessageEvent) => {
        const decoded_message: LineDataMessage | MultiDataMessage | IntegralMessage | HeatmapDataMessage = decode(event.data);
        console.log('decoded_message: ', decoded_message)
        switch (decoded_message["type"]) {
          case "multiline data":
            console.log('data type is multiline data')
            const multiMessage = decoded_message as MultiDataMessage;
            this.plot_multiline_data(multiMessage);
            socket.send(JSON.stringify({"type":"status","text":"ready"}));
            break;
          case "new line data":
            console.log('data type is new line data')
            const newLineMessage = decoded_message as LineDataMessage;
            this.plot_new_line_data(newLineMessage);
            socket.send(JSON.stringify({"type":"status","text":"ready"}));
            break;
          case "line data":
            console.log('data type is line data')
            const lineMessage = decoded_message as LineDataMessage;
            this.plot_line_data(lineMessage);
            socket.send(JSON.stringify({"type":"status","text":"ready"}));
            break;
          case "heatmap data":
            console.log('data type is heatmap data')
            const heatmapMessage = decoded_message as HeatmapDataMessage;
            this.plot_heatmap_data(heatmapMessage);
            socket.send(JSON.stringify({"type":"status","text":"ready"}));
            break;
          case "integral":
            console.log('data type is integral')
            const integralMessage = decoded_message as IntegralMessage;
            this.display_integral(integralMessage);
            socket.send(JSON.stringify({"type":"status","text":"ready"}));
            break;
          case "profile":
            console.log('data type is profile')
            const profileMessage = decoded_message as LineDataMessage;
            this.plot_profile(profileMessage);
            socket.send(JSON.stringify({"type":"status","text":"ready"}));
            break;
          default:
            console.log('data type is: ', decoded_message["type"])
          }
      };
    this.handleFuncSelect(this.funcSelection);
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

  sendUpdateRequest = async (funcSelection: string, ampSelection: string) => {
    await this.waitForOpenSocket(socket)
    console.log("waiting to send update request. amp = ", ampSelection, " func: ", funcSelection)
    socket.send(JSON.stringify({"type":"data_request", "request_type":"update_request", "function":funcSelection, "amplitude":ampSelection}));
  }

  sendIntegralRequest = async (funcSelection: string, ampSelection: string, xStart: number, xEnd: number) => {
    console.log("sending integral request: ", xStart, " ", xEnd)
    await this.waitForOpenSocket(socket)
    socket.send(JSON.stringify({"type":"data_request", "request_type":"integral_request", "function":funcSelection, "amplitude":ampSelection, "xStart":xStart, "xEnd":xEnd}));
  }

  sendProfileRequest = async (xStart: number, yStart: number, xEnd: number, yEnd: number) => {
    console.log("sending profile request: ", xStart, " ", xEnd)
    await this.waitForOpenSocket(socket)
    socket.send(JSON.stringify({"type":"data_request", "request_type":"profile_request", "xStart":xStart, "yStart":yStart, "xEnd":xEnd, "yEnd":yEnd}));
  }

  sendNewLineRequest = async (nextLineID: number) => {
    await this.waitForOpenSocket(socket)
    socket.send(JSON.stringify({"type":"data_request", "request_type":"new_line_request", "line_id":nextLineID}));
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

  plot_line_data = (message: LineDataMessage) => {
    console.log('plotting line data');
    lineXArray = message.data.x;
    lineYArray = ndarray(message.data.y);
    const lineYDomain = getDomain(lineYArray);
    if(typeof(lineYDomain) != "undefined")
    this.setState({ lineYDomain: lineYDomain })
  }

  plot_heatmap_data = (message: HeatmapDataMessage) => {
    console.log(message);
    const rows = message.data.rows;
    const cols = message.data.columns;
    const values = message.data.values;
    heatmapValues = ndarray(
      new Float32Array(values),
      [cols, rows]
    );
    heatmapDomain = getDomain(heatmapValues)
    if(typeof(heatmapDomain) != "undefined")
    this.setState({ heatmapDomain: heatmapDomain })
  }

  plot_profile = (message: LineDataMessage) => {
    console.log('plotting profile data');
    profileXArray = message.data.x;
    profileYArray = ndarray(message.data.y);
    profileYDomain = getDomain(profileYArray);
    if(typeof(profileYDomain) != "undefined")
    this.setState({ profileYDomain: profileYDomain })
  }

  display_integral = (message: IntegralMessage) => {
    integralError = message.data.error
    const integral = message.data.integral
    this.setState({integral: message.data.integral})
    console.log('integral is: ', integral)
    console.log('integral_error is: ', integralError)
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

  handleFuncSelect = (e: string) => {
    this.funcSelection = e;
    console.log(this.funcSelection);
    this.sendUpdateRequest(this.funcSelection, this.ampSelection);
  }

  handleAmpSelect = (e: string) => {
    this.ampSelection = e;
    this.sendUpdateRequest(this.funcSelection, this.ampSelection);
  }

  handleSelectionSwitch = (e: boolean) => {
    this.selectionOn = e;
    console.log('selectioOn set to ', this.selectionOn)
  }

  handleAddLine = () => {
    console.log('Requesting new line')
    this.lineID++;
    this.sendNewLineRequest(this.lineID);
  }

  handleSelectionChange = (e: ActiveSelection) => {
    if(this.selectionOn) {
      this.setState( { activeSelection: e } );
      if(this.state.activeSelection != null) {
      console.log('setting activeSelection to: ', e)
      console.log('activeSelection is: ', this.state.activeSelection)
        this.sendIntegralRequest(
          this.funcSelection,
          this.ampSelection,
          this.state.activeSelection.startPoint.x,
          this.state.activeSelection.endPoint.x,
        )}}
    else {console.log('Selection switched off')}
  }

  handle2DSelectionChange = (e: ActiveSelection) => {
    this.setState( { active2DSelection: e } );
    if(this.state.active2DSelection != null) {
    console.log('setting active2DSelection to: ', e)
    console.log('active2DSelection is: ', this.state.active2DSelection)
    if(this.state.active2DSelection != null) {
      console.log('setting activeSelection to: ', e)
      console.log('activeSelection is: ', this.state.activeSelection)
        this.sendProfileRequest(
          this.state.active2DSelection.startPoint.x,
          this.state.active2DSelection.startPoint.y,
          this.state.active2DSelection.endPoint.x,
          this.state.active2DSelection.endPoint.y
          )}}
    else {console.log('No profile selection made')}
  }

    render() {
      return (
        <>
        <LinePlot handleSelectionChange={this.handleSelectionChange} xArray={lineXArray} yArray={lineYArray} yDomain={this.state.lineYDomain}/>
        <Form onSubmit={this.onSubmitForm}>
          <Form.Group as={Row}>
          <FunctionSelector function={this.funcSelection} handleFuncSelect={this.handleFuncSelect}/>
          <AmplitudeSelector amplitude={this.ampSelection} minAmplitude={minAmplitude} maxAmplitude={maxAmplitude} handleAmpSelect={this.handleAmpSelect}/>
          <SelectionSwitch selectionOn={this.selectionOn} handleSelectionSwitch={this.handleSelectionSwitch}/>
          </Form.Group>
        </Form>
        <IntegralBox selectionOn={this.selectionOn} activeSelection={this.state.activeSelection} integral={this.state.integral} integralError={integralError}/>
        <HeatPlot heatmapValues={heatmapValues} heatmapDomain={this.state.heatmapDomain} handleSelectionChange={this.handle2DSelectionChange}/>
        <ProfileSumLine profileXArray={profileXArray} profileYArray={profileYArray} profileYDomain={this.state.profileYDomain} />
        <button onClick={this.handleAddLine}>Add line</button>
        <MultiLinePlot data={this.state.multilineData} xDomain={multilineXDomain} yDomain={multilineYDomain}/>
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
