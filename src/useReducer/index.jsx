import React, { useReducer, useEffect, useState } from "react";
import { render } from "react-dom";

function reducer(state, action) {
  if (action.type === "add") {
    return state + 1;
  } else {
    return state;
  }
}

const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0)
  console.log('render counter...', count)
  return (
    <div 
      onClick={() => {
        setCount(count + 1);
      }}
    >
      {count}
    </div>
  )
};

render(<Counter />, document.getElementById("root"));
