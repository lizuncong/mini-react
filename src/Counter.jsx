import React from "react";
// import { useEffect, useState, useLayoutEffect } from 'react'
import { useEffect, useState, useLayoutEffect } from '@react'

const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("use effect ==============");
    return () => {
      console.log("use effect 清除 =============");
    };
  });
  useLayoutEffect(() => {
    console.log("use layout effect ==============");
    return () => {
      console.log("use layout effect 清除 ===========");
    };
  });
  return (
    <div>
      counter wrap
      <div>hello counter</div>
      <button onClick={() => setCount(count + 1)}>function：{count}</button>;
    </div>
  );
};

export default Counter;
