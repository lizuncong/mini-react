import React from "../react";
import ReactDOM from "../react-dom";

const btn1 = document.createElement("button");
btn1.innerText = "key相同， 类型相同，数量相同";
btn1.onclick = function () {
  console.log("更新后。。");

  const element = (
    <div key="title" id="title2">
      title2
    </div>
  );

  ReactDOM.render(element, document.getElementById("root"));
};
document.body.appendChild(btn1);

const element = (
  <div key="title" id="title">
    title
  </div>
);

ReactDOM.render(element, document.getElementById("root"));
