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
        const iframe = document.createElement('iframe')
        iframe.src = 'http://127.0.0.1:4000/api/product'
        document.body.appendChild(iframe)
        // fetch('http://127.0.0.1:4000/api/product')
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
