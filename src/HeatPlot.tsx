import '@h5web/lib/dist/styles.css';
import {HeatmapVis} from '@h5web/lib';
import ndarray from 'ndarray';
import './App.css';
import React from 'react';

type HeatmapProps = {
  heatmapValues: ndarray.NdArray<number[]>;
  heatmapDomain: [number, number];
};

class HeatPlot extends React.Component<HeatmapProps> {
  render() {
    return (
      <>
        <HeatmapVis
          colorMap="Warm"
          dataArray={this.props.heatmapValues}
          domain={this.props.heatmapDomain}
          layout="fill"
          scaleType="linear"
          showGrid
        ></HeatmapVis>
      </>
    );
  }
}

export default HeatPlot;
