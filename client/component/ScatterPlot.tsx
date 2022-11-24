import '@h5web/lib/dist/styles.css';
import { ScaleType, ScatterVis } from '@h5web/lib';
import React from 'react';


class ScatterPlot extends React.Component<ScatterPlotProps> {
  abscissaValue: number[] = (this.props.axesParameters.xValues == undefined)? Array.from(this.props.xData.data) : Array.from(this.props.axesParameters.xValues);
  ordinateValue: number[] = (this.props.axesParameters.yValues == undefined)? Array.from(this.props.yData.data) : Array.from(this.props.axesParameters.yValues);
  render() {
    return (
      <>
        <ScatterVis
            abscissaParams={ {label: this.props.axesParameters.xLabel, value: this.abscissaValue, scaleType: this.props.axesParameters.xScale as ScaleType}}
            colorMap="Viridis"
            title={this.props.axesParameters.title}
            dataArray={this.props.dataArray}
            domain={this.props.domain}
            onPointClick={function noRefCheck(){}}
            ordinateParams={{label: this.props.axesParameters.yLabel, value: this.ordinateValue, scaleType: this.props.axesParameters.yScale as ScaleType}}
            showGrid
        />
      </>
    );
  }
}

export default ScatterPlot;