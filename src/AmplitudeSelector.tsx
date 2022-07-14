import '@h5web/lib/dist/styles.css';
import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Col} from 'react-bootstrap';
import RangeSlider from 'react-bootstrap-range-slider';


type AmplitudeProps = {
    handleAmpSelect: (e: string) => void;
    amplitude: string;
    minAmplitude: number;
    maxAmplitude: number;
  };
  type AmplitudeStates = {
    amplitude: string;
  };
  
  class AmplitudeSelector extends React.Component<AmplitudeProps, AmplitudeStates> {
    constructor(props: AmplitudeProps) {
      super(props);
      console.log('props are: ', props)
      this.state = {
        amplitude: props.amplitude
      };
      this.handleChange = this.handleChange.bind(this);
    }
  
    handleChange = (e: string) => {
      console.log('amp event is ', e)
      if(parseInt(e) >= this.props.minAmplitude && parseInt(e) <= this.props.maxAmplitude){
        this.setState({amplitude: e});
        this.props.handleAmpSelect(e);
        console.log('amp state set as: ', e)
    }
  }
    render() {
      return (
        <>
        <Col xs="4">
          <RangeSlider
            value={this.state.amplitude}
            min={this.props.minAmplitude}
            max={this.props.maxAmplitude}
            onChange={changeEvent => this.handleChange(changeEvent.target.value)}
          />
        </Col>
        <Col xs="2">
          <Form.Control
            value={this.state.amplitude}
            type="number"
            min={this.props.minAmplitude}
            max={this.props.maxAmplitude}
            onChange={changeEvent => this.handleChange(changeEvent.target.value)}
          />
        </Col>
        </>
      );
    }
  }

export default AmplitudeSelector;