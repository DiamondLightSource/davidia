import '@h5web/lib/dist/styles.css';
import {AxisParams, RgbVis} from '@h5web/lib';
import React from 'react';

class ImagePlot extends React.Component<ImagePlotProps> {
  render() {
    return (
      <>
        <RgbVis
          dataArray={this.props.values}
          showGrid
          title={this.props.axesParameters.title}
          abscissaParams={ {label: this.props.axesParameters.xLabel, value: this.props.axesParameters.xValues} as AxisParams}
          ordinateParams={ {label: this.props.axesParameters.yLabel, value: this.props.axesParameters.yValues} as AxisParams}
        ></RgbVis>
      </>
    );
  }
}

export default ImagePlot;
