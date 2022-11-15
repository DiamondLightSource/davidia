import '@h5web/lib/dist/styles.css';
import {AxisParams, HeatmapVis} from '@h5web/lib';
import React from 'react';

class HeatmapPlot extends React.Component<HeatmapPlotProps> {
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

export default HeatmapPlot;
