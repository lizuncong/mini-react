import React, { useState, useLayoutEffect, useEffect, useRef } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("use effect...", a);
  });
  return (
    <div
      onClick={() => {
        setCount(count + 1);
      }}
    >
      {count}
    </div>
  );
};

export default Counter;
