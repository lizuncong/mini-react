import React, { useReducer, useEffect, useState } from "react";
import { render } from "react-dom";

function reducer(state, action) {
  return state + 1;
}

const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0)
  const [count2, setCount2] = useReducer(reducer, 1000)
  useEffect(() => {
    console.log('useEffect')
  }, [])
  return (
    <div 
      onClick={() => {
        debugger;
        setCount(1)
        setCount(2)
      }}
    >
      {count}
    </div>
  )
};

render(<Counter />, document.getElementById("root"));