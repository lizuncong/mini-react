import React from "react";
import { useEffect, useState, useLayoutEffect } from 'react'
// import { useEffect, useState, useLayoutEffect } from '@react'

const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("use effect ==============");
    document.getElementById('useEffect').innerText = 'useEffect：' + count
    return () => {
      console.log("use effect 清除 =============");
    };
  });
  useLayoutEffect(() => {
    console.log("use layout effect ==============");
    if(count === 1){
      debugger
      console.log('在useLayoutEffect里面调度')
      setCount(count + 1)
    }
    document.getElementById('useLayoutEffect').innerText = 'useLayoutEffect：' + count
    return () => {
      console.log("use layout effect 清除 ===========");
    };
  });
  const onBtnClick = () => {
    debugger
    console.log('按钮点击...')
    setCount(count + 1)
  }
  return (
    <div>
      counter wrap
      <div>hello counter</div>
      <button onClick={onBtnClick}>function：{count}</button>;
    </div>
  );
};

export default Counter;
