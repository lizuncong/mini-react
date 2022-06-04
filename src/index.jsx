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
  static getDerivedStateFromProps(props, state) {
    // 只要当前 user 变化，
    // 重置所有跟 user 相关的状态。
    // 这个例子中，只有 email 和 user 相关。
    if (props.userID !== state.prevPropsUserID) {
      return {
        prevPropsUserID: props.userID,
        email: props.defaultEmail,
      };
    }
    return null;
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {
  //   // 我们是否在 list 中添加新的 items ？
  //   // 捕获滚动​​位置以便我们稍后调整滚动位置。
  //   if (prevProps.list.length < this.props.list.length) {
  //     const list = this.listRef.current;
  //     return list.scrollHeight - list.scrollTop;
  //   }
  //   return null;
  // }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   // 如果我们 snapshot 有值，说明我们刚刚添加了新的 items，
  //   // 调整滚动位置使得这些新 items 不会将旧的 items 推出视图。
  //   //（这里的 snapshot 是 getSnapshotBeforeUpdate 的返回值）
  //   if (snapshot !== null) {
  //     const list = this.listRef.current;
  //     list.scrollTop = list.scrollHeight - snapshot;
  //   }
  // }
  componentDidMount() {
    console.log("component did mount......");
  }
  componentWillUnmount() {
    console.log("component will unmount...");
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log("component will receive props...", nextProps);
  }
  UNSAFE_componentWillMount() {
    console.log("component will mount...");
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
      <button key="2" onClick={this.handleClick}>
        class：{this.state.step}
      </button>,
    ];
  }
}
// debugger;

ReactDOM.render(<ClickCounter />, document.getElementById("root"));
