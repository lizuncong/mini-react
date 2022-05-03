import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
class Counter extends Component {
  constructor(props) {
    debugger;
    super(props);
    this.state = {
      number: 0,
    };
  }
  handleClick = (event) => {
    debugger;
    this.setState({ number: 1 });
    this.setState({ number: 2 });
  };

  render() {
    console.log("render===", this.state);
    return <button onClick={this.handleClick}>{this.state.number}</button>;
  }
}

ReactDOM.render(<Counter />, document.getElementById("root"));
