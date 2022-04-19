import React, { useReducer, useState } from "react";
import { render } from "react-dom";
// import { IndeterminateComponent } from './ReactWorkTags'
// import { render } from './ReactFiberWorkLoop'
// import { useReducer, useState } from './ReactFiberHooks'

function reducer(state, action) {
  if (action.type === "add") {
    return state + 1;
  } else {
    return state;
  }
}

const Counter = () => {
  // debugger
  // const [count, setCount] = useReducer(reducer, 0)
  const [count, setCount] = useState(0);
  console.log("render======");
  return <div onClick={() => setCount(2)}>计数器：{count}</div>;
};

render(<Counter />, document.getElementById("root"));
// const counterFiber = {
//   tag: IndeterminateComponent,
//   type: Counter,
//   alternate: null,
// };

// render(counterFiber);
