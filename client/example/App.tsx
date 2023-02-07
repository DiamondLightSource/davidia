import '@h5web/lib/dist/styles.css';
import './App.css';
import React from 'react';
import PlotContainer from '../component/PlotContainer';

interface AppMainProps {
  instance: number;
}

interface AppMainStates {
  plots: string[];
  selection: Rect | undefined;
}

class AppMain extends React.Component<AppMainProps, AppMainStates> {
  constructor(props: AppMainProps) {
    super(props);
    this.state = {
      plots: ['plot_0', 'plot_1'],
    };
  }

  render() {
    return (
      <>
        <PlotContainer
          plots={this.state.plots}
          title={'Example Plots'}
        ></PlotContainer>
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
