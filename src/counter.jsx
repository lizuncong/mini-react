import React, { useState, useLayoutEffect, useEffect } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  useLayoutEffect(() => {
    // console.log(aaadd);
  }, []);
  return (
    <div
      onClick={() => {
        // Promise.resolve()
        //   .then(() => {
        //     setCount({ a: 1 });
        //   })
        //   .catch(() => {
        //     console.log("Swallowed!");
        //   });
        setTimeout(() => {
          setCount(4);
          // setCount({ a: 1 });
        }, 1000);
      }}
    >
      {count}
    </div>
  );
};

export default Counter;
