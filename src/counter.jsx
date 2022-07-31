import React, { useState, useLayoutEffect, useEffect } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  // useLayoutEffect(() => {
  //   console.log(aaadd);
  // }, []);
  return (
    <div
      onClick={() => {
        Promise.resolve()
          .then(() => {
            debugger;
            setCount({ a: 1 });
            console.log("after setCount");
            debugger;
          })
          .catch((e) => {
            console.log("Swallowed!");
          });
      }}
    >
      {count}
    </div>
  );
};

export default Counter;
