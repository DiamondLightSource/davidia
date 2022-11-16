import '@h5web/lib/dist/styles.css';
import { ScatterVis } from '@h5web/lib';
import React from 'react';


class ScatterPlot extends React.Component<ScatterPlotProps> {
  render() {
    return (
      <>
        <ScatterVis
            abscissaParams={{value: Array.from(this.props.xData.data)}}
            colorMap="Viridis"
            dataArray={this.props.dataArray}
            domain={this.props.domain}
            onPointClick={function noRefCheck(){}}
            ordinateParams={{value: Array.from(this.props.yData.data)}}
            showGrid
        />
      </>
    );
  }
}

export default ScatterPlot;