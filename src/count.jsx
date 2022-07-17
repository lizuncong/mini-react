import React, { useState } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div id="count" onClick={() => setCount(count + 1)}>
      {count}
    </div>
  );
};

export default Counter;
