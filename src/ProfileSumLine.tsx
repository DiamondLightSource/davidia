import '@h5web/lib/dist/styles.css';
import { LineVis } from '@h5web/lib';
import ndarray from 'ndarray';
import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


type ProfileSumProps = {
    profileXArray: [],
    profileYArray: ndarray.NdArray<number[]>,
    profileYDomain: [number, number],
  };
  class ProfileSumLine extends React.Component<ProfileSumProps> {
    render() {
      return (
        <>
          <LineVis abscissaParams={{ value: this.props.profileXArray}} dataArray={this.props.profileYArray} domain={this.props.profileYDomain}>
          </LineVis>
        </>
      );
    }
  }

export default ProfileSumLine;