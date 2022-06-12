// import React from "react";
// import ReactDOM from "react-dom";

import React from "@react";
import ReactDOM from "@react-dom";

import Counter from "./Counter";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(
      (state) => {
        return { step: state.step + 1 };
      },
      () => {
        console.log("this.setState callback");
      }
    );
  }
  static getDerivedStateFromProps(props, state) {
    console.log("getDerivedStateFromProps======");
    return null;
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {
    const btn = document.getElementById("btn");
    const scrollHeight = btn.scrollHeight;
    console.log("get snapshot before update...", scrollHeight);
    return scrollHeight;
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log("component did update...", snapshot);
  }
  componentDidMount() {
    console.log("component did mount......");
  }
  componentWillUnmount() {
    console.log("component will unmount...");
  }
  UNSAFE_componentWillMount() {
    console.log("component will mount...");
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log("component will receive props...", nextProps);
  }
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    console.log("component will update....", nextProps, nextState);
  }
  shouldComponentUpdate() {
    console.log("should component update");
    return true;
  }

  render() {
    return [
      (!this.state.step || this.state.step % 3) && (
        <Counter step={this.state.step} />
      ),
      <button id="btn" key="2" onClick={this.handleClick}>
        类组件按钮：{this.state.step}
      </button>,
    ];
  }
}

ReactDOM.render(<Home />, document.getElementById("root"));
