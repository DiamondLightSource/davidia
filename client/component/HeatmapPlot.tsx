import '@h5web/lib/dist/styles.css';
import { AxisParams, HeatmapVis } from '@h5web/lib';
import React from 'react';
import type { TypedArray, NdArray } from 'ndarray';

class HeatmapPlot extends React.Component<HeatmapPlotProps> {
  render() {
    const colorMap = this.props.colorMap ?? 'Warm';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const aspect = this.props.aspect ?? 'auto';
    return (
      <>
        <HeatmapVis
          dataArray={this.props.values as NdArray<TypedArray>}
          domain={this.props.domain}
          colorMap={colorMap}
          scaleType={this.props.heatmapScale}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
