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
// const element = (
//   <ul key="ul">
//     <li key="A">A</li>
//     <li key="B" id="B">
//       B
//     </li>
//     <li key="C">C</li>
//   </ul>
// );

// ReactDOM.render(element, document.getElementById("root"));
// btn1.innerText = "多节点变单节点";
// btn1.onclick = function () {
//   const element = (
//     <ul key="ul">
//       <li key="B" id="B2">
//         B2
//       </li>
//     </ul>
//   );

//   ReactDOM.render(element, document.getElementById("root"));
// };

// 场景5：多个节点的数量、类型和key全部相同，只更新属性
// 第1轮遍历
// - 如果key不同则直接结束本轮循环
// - newChildren或oldFiber遍历完，结束本轮循环
// - key相同而type不同，标记oldFiber为删除，继续循环
// - key相同而type也相同，则可以复用oldFiber，继续循环

// 第2轮遍历
// - newChildren遍历完而oldFiber还有，遍历剩下所有的oldFiber标记为删除，DIFF结束
// - oldFiber遍历完了，而newChildren还有，将剩下的newChildren标记为插入，DIFF结束
// - newChildren和oldFiber都同时遍历完成，diff结束
// - newChildren和oldFiber都没有完成，则进行节点移动的逻辑

// 第3轮遍历
// - 处理节点移动的情况
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
btn1.innerText = "多个节点的数量、类型和key全部相同，只更新属性";
btn1.onclick = function () {
  const element = (
    <ul key="ul">
      <li key="A">A</li>
      <p key="B" id="B2">
        B2
      </p>
    </ul>
  );

  ReactDOM.render(element, document.getElementById("root"));
};
