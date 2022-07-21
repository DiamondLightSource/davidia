import '@h5web/lib/dist/styles.css';
import { CurveType, DataCurve, TooltipMesh, VisCanvas } from '@h5web/lib';
import './App.css';
import React from 'react';


interface LineData {
    id: string;
    colour: string;
    x: number[];
    y: number[];
  }

type MultiLineProps = {
    data: LineData[];
    xDomain: [number, number];
    yDomain: [number, number];
    curveType: CurveType;
  };

class MultiLinePlot extends React.Component<MultiLineProps> {
    render() {
        return (
        <>
            <VisCanvas
            abscissaConfig={{ visDomain: this.props.xDomain, showGrid: true }}
            ordinateConfig={{ visDomain: this.props.yDomain, showGrid: true }}
            >
            {Array.from(this.props.data).map(d => <DataCurve key={d.id} abscissas={d.x} ordinates={d.y} color={d.colour} curveType={this.props.curveType}/>)}
            <TooltipMesh renderTooltip={(x, y) => <p>{y}</p>} />
            </VisCanvas>
        </>
        );
    }
}

export default MultiLinePlot;
