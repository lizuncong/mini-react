import React, { useEffect, useState, useLayoutEffect } from "react";
import ReactDOM from "react-dom";

const sleep = () => {
  const start = Date.now();
  while (Date.now() - start < 5000) {}
};
const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.getElementById("useEffect").innerText = "useEffect：" + count;
    return () => {
      console.log("use effect 清除 =============");
      sleep(); // 死循环5秒
    };
  });
  useLayoutEffect(() => {
    document.getElementById("useLayoutEffect").innerText =
      "useLayoutEffect：" + count;
    return () => {
      console.log("use layout effect 清除 ===========");
    };
  });
  const onBtnClick = () => {
    setCount(count + 1);
  };
  return <button onClick={onBtnClick}>Counter：{count}</button>;
};

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCounter: true,
    };
  }
  render() {
    return [
      <div
        style={{ marginTop: "100px" }}
        onClick={() =>
          this.setState({ showCounter: !this.state.showCounter }, () =>
            console.log("this.setState回调函数执行======")
          )
        }
      >
        切换显示计数器
      </div>,
      this.state.showCounter && <Counter />,
    ];
  }
}

ReactDOM.render(<Index />, document.getElementById("root"));
