import '@h5web/lib/dist/styles.css';
import { ScatterVis } from '@h5web/lib';
import React from 'react';

class ScatterPlot extends React.Component<ScatterPlotProps> {
  abscissaValue: number[] =
    this.props.axesParameters.xValues === undefined
      ? Array.from(this.props.xData.data)
      : Array.from(this.props.axesParameters.xValues.data);
  ordinateValue: number[] =
    this.props.axesParameters.yValues === undefined
      ? Array.from(this.props.yData.data)
      : Array.from(this.props.axesParameters.yValues.data);
  render() {
    const colorMap =
      this.props.colorMap === undefined ? 'Viridis' : this.props.colorMap;
    return (
      <>
        <ScatterVis
          abscissaParams={{
            label: this.props.axesParameters.xLabel,
            value: this.abscissaValue,
            scaleType: this.props.axesParameters.xScale,
          }}
          colorMap={colorMap}
          title={this.props.axesParameters.title}
          dataArray={this.props.dataArray}
          domain={this.props.domain}
          ordinateParams={{
            label: this.props.axesParameters.yLabel,
            value: this.ordinateValue,
            scaleType: this.props.axesParameters.yScale,
          }}
          showGrid
        />
      </>
    );
  }
}

export default ScatterPlot;
