import '@h5web/lib/dist/styles.css';
import { CurveType, DataCurve, HeatmapVis, ResetZoomButton, SelectToZoom, TooltipMesh, VisCanvas } from '@h5web/lib';
import ndarray from 'ndarray';
import React from 'react';

interface LinePlotParameters {
    data: LineData[];
    xDomain: [number, number];
    yDomain: [number, number];
    curveType: CurveType;
  }

interface HeatPlotParameters {
  values: ndarray.NdArray<number[]>,
  domain: [number, number],
  }

function instanceOfHeatPlotParameters(object: any): object is HeatPlotParameters {
    return 'values' in object;
}

type PlotProps = {
    plotParameters: LinePlotParameters | HeatPlotParameters
  };

class Plot extends React.Component<PlotProps> {
    render() {
      if (instanceOfHeatPlotParameters(this.props.plotParameters)) {
      return (
        <>
        <HeatmapVis colorMap="Warm" dataArray={this.props.plotParameters.values} domain={this.props.plotParameters.domain} layout="fill" scaleType="linear" showGrid>
        </HeatmapVis>
        </>
        );
      }
      else {
        let curveType = this.props.plotParameters.curveType;
        return (
          <>
          <VisCanvas
          abscissaConfig={{ visDomain: this.props.plotParameters.xDomain, showGrid: true }}
          ordinateConfig={{ visDomain: this.props.plotParameters.yDomain, showGrid: true }}
          >
          {Array.from(this.props.plotParameters.data).map(d => <DataCurve key={d.id} abscissas={d.x} ordinates={d.y} color={d.colour} curveType={curveType}/>)}
          <TooltipMesh renderTooltip={(x, y) => <p>{y}</p>} />
          <SelectToZoom/>
          <ResetZoomButton/>
          </VisCanvas>
      </>
        );
      }
    }
}

export default Plot;
