import React from "react";

const NumberComp = ({ count }) => {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 1) {}
  performance.mark("--Number-" + count);
  return count;
};

export default NumberComp;
