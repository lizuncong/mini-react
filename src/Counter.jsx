import React from "react";
// import { useState } from "react";
import { useState } from "@react";
const Counter = ({ step }) => {
  const [count, setCount] = useState(0);
  const onBtnClick = () => {
    setCount(count + 1);
  };
  return (
    <div style={{ marginBottom: "50px" }}>
      {!(count % 2) && <div>复数显示，单数隐藏</div>}
      <button onClick={onBtnClick}>{count}</button>
      <div>函数组件接收的props：{step}</div>
    </div>
  );
};

export default Counter;
