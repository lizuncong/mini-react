import React, { useState, useLayoutEffect, useEffect } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  // useLayoutEffect(() => {
  //   console.log(bb);
  // });
  // useEffect(() => {
  //   console.log(aaadd);
  // }, []);
  return (
    <div
      onClick={() => {
        Promise.resolve()
          .then(() => {
            setCount({ a: 1 });
          })
          .catch((e) => {
            console.log("Swallowed!", e);
          });
      }}
    >
      {count}
    </div>
  );
};

export default Counter;
