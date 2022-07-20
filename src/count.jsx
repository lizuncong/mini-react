import React, { useState, useEffect, useLayoutEffect } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log('use effect..')
    return () => {
      console.log('use effect clear...')
    }
  })
  useLayoutEffect(() => {
    console.log('use layout effect...')
    return () => {
      console.log('use layout effect clear....')
    }
  })
  return (
    <div id="count" onClick={() => setCount(count + 1)}>
      {count}
    </div>
  );
};

export default Counter;
