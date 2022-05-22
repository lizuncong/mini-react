import React from "../react";
import ReactDOM from "../react-dom";

// const element = (
//   <div key="title" id="title">
//     title
//   </div>
// );

// ReactDOM.render(element, document.getElementById("root"));

const btn1 = document.createElement("button");
document.body.appendChild(btn1);

// 场景1：key相同， 类型相同，数量相同
// btn1.innerText = "key相同， 类型相同，数量相同";
// btn1.onclick = function () {
//   const element = (
//     <div key="title" id="title2">
//       title2
//     </div>
//   );

//   ReactDOM.render(element, document.getElementById("root"));
// };

// 场景2: key相同，类型不同，删除旧节点，添加新节点
// btn1.innerText = "key相同，类型不同，删除旧节点，添加新节点";
// btn1.onclick = function () {
//   const element = (
//     <p key="title" id="title">
//       title2
//     </p>
//   );

//   ReactDOM.render(element, document.getElementById("root"));
// };

// 场景3: 类型相同 key不同 删除旧节点 添加新节点
// btn1.innerText = "类型相同 key不同 删除旧节点 添加新节点";
// btn1.onclick = function () {
//   const element = (
//     <div key="name" id="title">
//       title2
//     </div>
//   );

//   ReactDOM.render(element, document.getElementById("root"));
// };

// 场景4: 多节点变单节点
const element = (
  <ul key="ul">
    <li key="A">A</li>
    <li key="B" id="B">
      B
    </li>
    <li key="C">C</li>
  </ul>
);

ReactDOM.render(element, document.getElementById("root"));
btn1.innerText = "多节点变单节点";
btn1.onclick = function () {
  const element = (
    <ul key="ul">
      <li key="B" id="B2">
        B2
      </li>
    </ul>
  );

  ReactDOM.render(element, document.getElementById("root"));
};
