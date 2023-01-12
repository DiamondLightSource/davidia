import '@h5web/lib/dist/styles.css';
import { AxisParams, HeatmapVis } from '@h5web/lib';
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
          aspect="auto"
          showGrid
          title={this.props.axesParameters.title}
          abscissaParams={
            {
              label: this.props.axesParameters.xLabel,
              value: this.props.axesParameters.xValues,
            } as AxisParams
          }
          ordinateParams={
            {
              label: this.props.axesParameters.yLabel,
              value: this.props.axesParameters.yValues,
            } as AxisParams
          }
        ></HeatmapVis>
      </>
    );
  }
}

export default HeatmapPlot;
