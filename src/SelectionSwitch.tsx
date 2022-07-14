import '@h5web/lib/dist/styles.css';
import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import BootstrapSwitchButton from 'bootstrap-switch-button-react'


type SelectionProps = {
    handleSelectionSwitch: (e: boolean) => void;
    selectionOn: boolean;
  };
  type SelectionStates = {
    selectionActive: boolean;
  };
  
  class SelectionSwitch extends React.Component<SelectionProps, SelectionStates> {
    constructor(props: SelectionProps) {
      super(props)
      console.log('props are: ', props);
      this.state = {selectionActive: props.selectionOn};
      this.handleChange = this.handleChange.bind(this);
      console.log('starting state: ', this.state.selectionActive)
    }
  
    handleChange(checked: boolean) {
      console.log('switching state from ', this.state.selectionActive, ' to ', checked);
      this.setState({selectionActive: checked});
      this.props.handleSelectionSwitch(checked);
    }
  
    render() {
      return (
        <>
          <BootstrapSwitchButton
              checked={this.state.selectionActive}
              width={300}
              onlabel='Selecting Region'
              offlabel='Select Region'
              onChange={(checked) => {this.handleChange(checked)}}
          />
        </>
      );
    }
  }

export default SelectionSwitch;