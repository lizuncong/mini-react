import React, { useState, useLayoutEffect, useEffect, useRef } from "react";

const Counter = () => {
  const [count, setCount] = useState(11);
  useLayoutEffect(() => {
    // console.log("effect...", aa);
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
