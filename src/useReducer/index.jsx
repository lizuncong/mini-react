import React, { useReducer, useEffect, useState } from "react";
import { render } from "react-dom";

function reducer(state, action) {
  return state + 1;
}

const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0);
  console.log("render======", count);
  return (
    <button
      onClick={() => {
        // debugger;
        // setCount(1);
        // setCount(2);
        setTimeout(() => {
          debugger;
          setCount(1);
          setCount(2);
        }, 0);
      }}
    >
      {count}
    </button>
  );
};

render(<Counter />, document.getElementById("root"));
