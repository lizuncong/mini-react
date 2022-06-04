import React, { Component, PureComponent } from "react";
// import ReactDOM from "@react-dom";
import ReactDOM from "react-dom";
import Counter from "./Counter";
class ClickCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState((state) => {
      return { step: state.step + 2 };
    });
  }

  componentDidUpdate() {
    console.log("component did update....");
  }

  componentDidMount() {
    console.log("component did mount......");
  }
  shouldComponentUpdate() {
    console.log("should component update");
    return true;
  }

  render() {
    return [
      <Counter />,
      <button key="2" onClick={this.handleClick}>
        {this.state.step}
      </button>,
    ];
  }
}
// debugger;

ReactDOM.render(<ClickCounter />, document.getElementById("root"));
