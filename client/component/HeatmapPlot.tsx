import '@h5web/lib/dist/styles.css';
import { AxisParams, HeatmapVis } from '@h5web/lib';
import React from 'react';

class HeatmapPlot extends React.Component<HeatmapPlotProps> {
  render() {
    const colorMap = this.props.colorMap ?? 'Warm';
    const aspect = this.props.aspect ?? 'auto';
    return (
      <>
        <HeatmapVis
          dataArray={this.props.values}
          domain={this.props.domain}
          colorMap={colorMap}
          scaleType={this.props.heatmapScale}
          aspect={aspect}
          showGrid
          title={this.props.axesParameters.title}
          abscissaParams={
            {
              label: this.props.axesParameters.xLabel,
              scaleType: this.props.axesParameters.xScale,
              value: this.props.axesParameters.xValues?.data,
            } as AxisParams
          }
          ordinateParams={
            {
              label: this.props.axesParameters.yLabel,
              scaleType: this.props.axesParameters.yScale,
              value: this.props.axesParameters.yValues?.data,
            } as AxisParams
          }
        ></HeatmapVis>
      </>
    );
  }
}

export default HeatmapPlot;
