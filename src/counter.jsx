import React, { useState, useEffect } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // console.log("use effect", aa);

    setTimeout(() => {
      console.log("use effect", aa);
    }, 1000);
  }, []);
  return (
    <div
      onClick={() => {
        console.log("onclick...", click);
      }}
    >
      12
    </div>
  );
};

export default Counter;
