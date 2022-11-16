import '@h5web/lib/dist/styles.css';
import './App.css';
import React from 'react';
import PlotComponent from '../component/PlotComponent';

type AppMainProps = {instance: number};
type AppMainStates = {plots: string[]};
class AppMain extends React.Component<AppMainProps, AppMainStates> {
  constructor(props: AppMainProps) {
    super(props);
    this.state = {
      plots: ["plot_0", "plot_1"]
    };
  }

  render() {
    return (
      <>
        <div style={{ display: 'grid', height: '50vh' }}>
          <PlotComponent plot_id="plot_0" />
        </div>
        <div style={{ display: 'grid', height: '50vh' }}>
          <PlotComponent plot_id="plot_1" />
        </div>
      </>
    );
  }
}

export default function App() {
  return (
    <>
      <AppMain instance={0} />
    </>
  );
}
