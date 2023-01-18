import '@h5web/lib/dist/styles.css';
import { AxisParams, HeatmapVis } from '@h5web/lib';
import React from 'react';
import type { TypedArray, NdArray } from 'ndarray';

class HeatmapPlot extends React.Component<HeatmapPlotProps> {
  render() {
    let aspect = this.props.aspect ?? 'equal';
    let colorMap = this.props.colorMap ?? 'Warm';
    return (
      <>
        <HeatmapVis
          dataArray={this.props.values as NdArray<TypedArray>}
          domain={this.props.domain}
          colorMap={colorMap}
          scaleType={this.props.heatmapScale}
          aspect={aspect}
          showGrid
          title={this.props.axesParameters.title}
          abscissaParams={
            {
              label: this.props.axesParameters.xLabel,
              value: this.props.axesParameters.xValues as
                | NdArray<TypedArray>
                | undefined,
            } as AxisParams
          }
          ordinateParams={
            {
              label: this.props.axesParameters.yLabel,
              value: this.props.axesParameters.yValues as
                | NdArray<TypedArray>
                | undefined,
            } as AxisParams
          }
        ></HeatmapVis>
      </>
    );
  }
}

export default HeatmapPlot;
