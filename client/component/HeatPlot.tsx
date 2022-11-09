import '@h5web/lib/dist/styles.css';
import {AxisParams, HeatmapVis, ScaleType} from '@h5web/lib';
import ndarray from 'ndarray';
import React from 'react';
import type {TypedArray} from 'ndarray';



type HeatmapProps = {
  values: ndarray.NdArray<TypedArray>;
  domain?: [number, number];
  heatmapScale?: ScaleType;
  axesParameters: AxesParameters;
};

class HeatPlot extends React.Component<HeatmapProps> {
  render() {
    return (
      <>
        <HeatmapVis
          dataArray={this.props.values}
          domain={this.props.domain}
          colorMap="Warm"
          scaleType={this.props.heatmapScale}
          layout="fill"
          showGrid
          abscissaParams={ {scaleType: this.props.axesParameters.x_scale, label: this.props.axesParameters.x_label} as AxisParams}
          ordinateParams={ {scaleType: this.props.axesParameters.y_scale, label: this.props.axesParameters.y_label} as AxisParams}
        ></HeatmapVis>
      </>
    );
  }
}

export default HeatPlot;
