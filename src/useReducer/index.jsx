import React, { useReducer, useEffect, useState } from "react";
import { render } from "react-dom";

function reducer(state, action) {
  return state + 1;
}

const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0)
  console.log('render counter...', count)
  return (
    <div 
      onClick={() => {
        setCount(1)
        setCount(2)
      }}
    >
      {count}
    </div>
  )
};

render(<Counter />, document.getElementById("root"));