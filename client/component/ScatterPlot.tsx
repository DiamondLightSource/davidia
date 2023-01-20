import '@h5web/lib/dist/styles.css';
import { ScaleType, ScatterVis } from '@h5web/lib';
import React from 'react';
import type { TypedArray, NdArray } from 'ndarray';

class ScatterPlot extends React.Component<ScatterPlotProps> {
  abscissaValue: number[] =
    this.props.axesParameters.xValues === undefined
      ? Array.from((this.props.xData as NdArray<TypedArray>).data)
      : Array.from(
          (this.props.axesParameters.xValues as NdArray<TypedArray>).data
        );
  ordinateValue: number[] =
    this.props.axesParameters.yValues === undefined
      ? Array.from((this.props.yData as NdArray<TypedArray>).data)
      : Array.from(
          (this.props.axesParameters.yValues as NdArray<TypedArray>).data
        );
  render() {
    const colorMap =
      this.props.colorMap === undefined ? 'Viridis' : this.props.colorMap;
    return (
      <>
        <ScatterVis
          abscissaParams={{
            label: this.props.axesParameters.xLabel,
            value: this.abscissaValue,
            scaleType: this.props.axesParameters.xScale as ScaleType,
          }}
          colorMap={colorMap}
          title={this.props.axesParameters.title}
          dataArray={this.props.dataArray as NdArray<TypedArray>}
          domain={this.props.domain}
          ordinateParams={{
            label: this.props.axesParameters.yLabel,
            value: this.ordinateValue,
            scaleType: this.props.axesParameters.yScale as ScaleType,
          }}
          showGrid
        />
      </>
    );
  }
}

export default ScatterPlot;
