import '@h5web/lib/dist/styles.css';
import { LineVis, SelectionTool, SelectionRect } from '@h5web/lib';
import ndarray from 'ndarray';
import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Vector2 } from 'three';


interface ActiveSelection {
    startPoint: Vector2;
    endPoint: Vector2;
  }

type LineProps = {
    xArray: [],
    yArray: ndarray.NdArray<number[]>,
    yDomain: [number, number],
    handleSelectionChange: (points: ActiveSelection) => void;
  };

class LinePlot extends React.Component<LineProps> {
    render() {
      return (
        <>
          <LineVis abscissaParams={{ value: this.props.xArray}} dataArray={this.props.yArray} domain={this.props.yDomain}>
          <SelectionTool onSelectionEnd={this.props.handleSelectionChange}>
              {(selection) => <SelectionRect{...selection}/>}
          </SelectionTool>
          </LineVis>
        </>
      );
    }
  }

  export default LinePlot;