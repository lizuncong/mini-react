import React, { useEffect, useState, useLayoutEffect } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("use effect ==============");
  });
  useLayoutEffect(() => {
    console.log("use layout effect ==============");
  });
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
};

export default Counter;
