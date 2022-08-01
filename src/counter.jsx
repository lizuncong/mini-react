import React, { useState, useLayoutEffect, useEffect } from "react";

const Counter = () => {
  const [count, setCount] = useState({ a: 1 });
  // useEffect(() => {
  //   console.log(aaadd);
  // }, []);
  return (
    <div
      onClick={() => {
        // console.log("after setCount");
        // setCount({ a: 1 });
        // Promise.resolve()
        //   .then(() => {
        //     // debugger;
        //     setCount({ a: 1 });
        //     console.log("after setCount");
        //     // debugger;
        //   })
        //   .catch((e) => {
        //     console.log("Swallowed!");
        //   });
      }}
    >
      {count}
    </div>
  );
};

export default Counter;
