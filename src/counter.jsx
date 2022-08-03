import React, { useState, useLayoutEffect, useEffect, useRef } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  useLayoutEffect(() => {
    return () => {
      console.log("清除");
    };
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
