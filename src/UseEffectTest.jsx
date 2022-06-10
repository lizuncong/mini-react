import React, { useEffect, useState, useLayoutEffect } from "react";
import ReactDOM from 'react-dom'

const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.getElementById('useEffect').innerText = 'useEffect：' + count
    const start = Date.now()
    while(Date.now() - start < 5000){}
    return () => {
      console.log("use effect 清除 =============");
    };
  });
  useLayoutEffect(() => {
    // if(count === 2){
    //   debugger
    //   console.log('在useLayoutEffect里面调度')
    //   setCount(count + 1)
    // }
    document.getElementById('useLayoutEffect').innerText = 'useLayoutEffect：' + count
    return () => {
      console.log("use layout effect 清除 ===========");
    };
  });
  const onBtnClick = () => {
    setCount(count + 1)
  }
  return (
    <button style={{ margin: '100px 0'}} onClick={onBtnClick}>Counter：{count}</button>
  );
};


ReactDOM.render(<Counter />, document.getElementById("root"));
