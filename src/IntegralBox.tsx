import '@h5web/lib/dist/styles.css';
import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Vector2 } from 'three';


interface ActiveSelection {
    startPoint: Vector2;
    endPoint: Vector2;
  }
  type IntegralProps = {
    activeSelection: ActiveSelection | null,
    integral: number | null,
    integralError: number | null,
    selectionOn: boolean
  };

  class IntegralBox extends React.Component<IntegralProps> {
    render() {
      return (
        <>
        {this.props.activeSelection != null && this.props.integral != null && this.props.integralError != null ? (
          <p style={{marginLeft:'20px'}}> Integral between x={(this.props.activeSelection.startPoint.x).toFixed(2)} and x
             ={(this.props.activeSelection.endPoint.x).toFixed(2)} is {this.props.integral} with an error {this.props.integralError}</p>
        ) : (
          <p style={{marginLeft:'20px'}}> Select region</p>
        )}
        </>
      );
    }
  }

export default IntegralBox;