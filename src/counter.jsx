import React, { useState, useEffect } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("use effect");
  }, []);
  return undefined;
};

export default Counter;
