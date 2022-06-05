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
  static getDerivedStateFromProps(props, state) {
    // 只要当前 user 变化，
    // 重置所有跟 user 相关的状态。
    // 这个例子中，只有 email 和 user 相关。
    // if (props.userID !== state.prevPropsUserID) {
    //   return {
    //     prevPropsUserID: props.userID,
    //     email: props.defaultEmail,
    //   };
    // }
    return null;
  }
  // getSnapshotBeforeUpdate() 在最近一次渲染输出（提交到 DOM 节点）之前调用。
  // 它使得组件能在发生更改之前从 DOM 中捕获一些信息（例如，滚动位置）。此生命周期方法的
  // 任何返回值将作为参数传递给 componentDidUpdate()。
  // 此用法并不常见，但它可能出现在 UI 处理中，如需要以特殊方式处理滚动位置的聊天线程等。
  getSnapshotBeforeUpdate(prevProps, prevState) {
    const btn = document.getElementById("btn");
    const scrollHeight = btn.scrollHeight;
    console.log("get snapshot before update...", scrollHeight);
    return scrollHeight;
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    //（这里的 snapshot 是 getSnapshotBeforeUpdate 的返回值）
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
      <Counter />,
      <button id="btn" key="2" onClick={this.handleClick}>
        class：{this.state.step}
      </button>,
    ];
  }
}
// debugger;

ReactDOM.render(<ClickCounter />, document.getElementById("root"));
