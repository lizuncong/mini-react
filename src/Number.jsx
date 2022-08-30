import React from "react";

const NumberComp = ({ count }) => {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 1) {}
  return count;
};

export default NumberComp;
