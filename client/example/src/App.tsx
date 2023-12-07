import React from 'react';
import { ToastContainer } from 'react-toastify';

import './App.css';

import ConnectedPlot from '../../component/src/ConnectedPlot';

interface AppMainProps {
  instance: number;
}

interface AppMainStates {
  plots: string[];
}

class AppMain extends React.Component<AppMainProps, AppMainStates> {
  uuid: string;
  constructor(props: AppMainProps) {
    super(props);
    this.state = {
      plots: ['plot_0', 'plot_1'],
    };
    this.uuid = crypto.randomUUID().slice(-8);
  }

  render() {
    console.log('new App created with uuid: ', this.uuid);
    return (
      <>
        <div
          style={{
            display: 'grid',
            height: '50vh',
            gridTemplateColumns: '67% 33%',
          }}
        >
          <ConnectedPlot plot_id="plot_0" uuid={this.uuid} />
        </div>
        <div style={{ display: 'grid', height: '50vh' }}>
          <ConnectedPlot plot_id="plot_1" uuid={this.uuid} />
        </div>
        <ToastContainer
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
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
