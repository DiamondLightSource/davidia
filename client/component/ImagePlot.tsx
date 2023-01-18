import '@h5web/lib/dist/styles.css';
import { AxisParams, RgbVis } from '@h5web/lib';
import React from 'react';
import type { TypedArray, NdArray } from 'ndarray';

class ImagePlot extends React.Component<ImagePlotProps> {
  render() {
    let aspect = this.props.aspect ?? 'equal';
    return (
      <>
        <RgbVis
          dataArray={this.props.values as NdArray<TypedArray>}
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
        ></RgbVis>
      </>
    );
  }
}

export default ImagePlot;
