import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
class Counter extends Component {
  constructor(props) {
    debugger;
    super(props);
  }
  handleClick() {
    fetch("http://localhost:4000/api/auth");
  }
  handleClickAuth() {
    fetch("/server/api/authSuccess");
  }
  render() {
    return (
      <>
        <button onClick={this.handleClick}>点击发起鉴权请求</button>
        <button onClick={this.handleClickAuth}>
          手动发起 auth success 请求
        </button>
      </>
    );
  }
}

ReactDOM.render(<Counter />, document.getElementById("root"));
