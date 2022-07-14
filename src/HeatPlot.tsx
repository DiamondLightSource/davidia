import '@h5web/lib/dist/styles.css';
import {  SelectionTool, SelectionRect, HeatmapVis } from '@h5web/lib';
import ndarray from 'ndarray';
import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Vector2 } from 'three';


interface ActiveSelection {
    startPoint: Vector2;
    endPoint: Vector2;
  }

type HeatmapProps = {
    heatmapValues: ndarray.NdArray<number[]>,
    heatmapDomain: [number, number],
    handleSelectionChange: (points: ActiveSelection) => void;
  };
  
class HeatPlot extends React.Component<HeatmapProps> {
    render() {
      return (
        <>
          <HeatmapVis colorMap="Warm" dataArray={this.props.heatmapValues} domain={this.props.heatmapDomain} layout="fill" scaleType="linear" showGrid>
          <SelectionTool onSelectionEnd={this.props.handleSelectionChange}>
              {(selection) => <SelectionRect{...selection}/>}
          </SelectionTool>
          </HeatmapVis>
        </>
      );
    }
  }

  export default HeatPlot;