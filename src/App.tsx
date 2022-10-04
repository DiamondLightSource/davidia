import '@h5web/lib/dist/styles.css';
import './App.css';
import React from 'react';
import PlotComponent from "./PlotComponent"


type AppMainProps = {instance: number};
type AppMainStates = {plots: string[]};
class AppMain extends React.Component<AppMainProps, AppMainStates> {
  constructor(props: AppMainProps) {
    super(props)
    this.state = {
      plots: ["plot_0", "plot_1"]
        }
  }

    render() {
      return (
        <>
        <PlotComponent plot_id="plot_0"/>
        <PlotComponent plot_id="plot_1"/>
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
