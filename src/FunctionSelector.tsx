import '@h5web/lib/dist/styles.css';
import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown, DropdownButton, Col, Anchor} from 'react-bootstrap';


type FunctionProps = {
    handleFuncSelect: (e: string) => void;
    function: string;
  };
  type FunctionStates = {
    function: string;
  };
  
  class FunctionSelector extends React.Component<FunctionProps, FunctionStates> {
    constructor(props: FunctionProps) {
      super(props);
      this.state = {function: props.function};
      this.handleChange = this.handleChange.bind(this);
    }
  
    handleChange = (e: string | null) => {
      console.log('event is ', e)
      if(typeof(e) === "string") {
        const functionChoice: string = e;
        this.setState({function: functionChoice});
        this.props.handleFuncSelect(functionChoice);
        console.log('func state set as: ', functionChoice)
      }
    }
  
    render() {
      return (
        <Col xs="4">
          <DropdownButton
            title={this.state.function}
            id="dropdown-menu-align-left"
            onSelect={this.handleChange}
          >
            <Dropdown.Item as={Anchor} eventKey="Sine">Sine</Dropdown.Item>
            <Dropdown.Item as={Anchor} eventKey="Cosine">Cosine</Dropdown.Item>
          </DropdownButton>
      </Col>
      );
    }
  }

export default FunctionSelector;