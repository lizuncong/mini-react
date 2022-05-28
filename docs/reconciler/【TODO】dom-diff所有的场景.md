```js
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

// 场景5：多个节点的数量和key相同，有的type不同
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
// const element = (
//   <ul key="ul">
//     <li key="A">A</li>
//     <li key="B" id="B">
//       B
//     </li>
//     <li key="C" id="C">
//       C
//     </li>
//   </ul>
// );

// ReactDOM.render(element, document.getElementById("root"));
// btn1.innerText = "多个节点的数量和key相同，有的type不同";
// btn1.onclick = function () {
//   const element = (
//     <ul key="ul">
//       <li key="A">A</li>
//       <p key="B" id="B2">
//         B2
//       </p>
//       <li key="C" id="C2">
//         C2
//       </li>
//     </ul>
//   );

//   ReactDOM.render(element, document.getElementById("root"));
// };

// 场景6：多个节点的类型和key全部相同，有新增元素
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
// btn1.innerText = "多个节点的数量和key相同，有的type不同";
// btn1.onclick = function () {
//   const element = (
//     <ul key="ul">
//       <li key="A">A</li>
//       <p key="B" id="B2">
//         B2
//       </p>
//       <li key="C">C2</li>
//       <li key="D">D</li>
//     </ul>
//   );

//   ReactDOM.render(element, document.getElementById("root"));
// };

// 场景7：多个节点的类型和key全部相同，有删除老元素
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
// btn1.innerText = "多个节点的类型和key全部相同，有删除老元素";
// btn1.onclick = function () {
//   const element = (
//     <ul key="ul">
//       <li key="A">A</li>
//       <li key="B" id="B2">
//         B2
//       </li>
//     </ul>
//   );

//   ReactDOM.render(element, document.getElementById("root"));
// };

// 场景8：多个节点数量不同、key不同
// 第一轮比较A和A，相同可以复用，更新，然后比较B和C，key不同直接跳出第一个循环
// 把剩下的oldFiber都放入existingChildren这个map中
// 然后声明一个lastPlacedIndex变量，表示不需要移动的旧节点的索引，默认为0
// 继续循环剩下的虚拟DOM节点，从C开始
// 如果能在map中找到相同key，相同type的节点，则可以复用旧fiber节点，并把此旧的fiber从map中删除
// 如果在map中找不到相同key相同type的节点则创建新的fiber节点
// 如果是复用旧的fiber，则判断旧fiber的索引是否小于lastPlaceIndex
// 如果小于lastPlaceIndex则需要移动旧的fiber，lastPlaceIndex不变
// 如果大于lastPlaceIndex则不需要移动旧的fiber，更新lastPlaceIndex为旧fiber的index
// 虚拟DOM循环结束后把map中所有的剩下的fiber全部标记为删除
// 删除 li#F，移动li#B，添加li#G，移动li#D
const element = (
  <ul key="ul">
    <li key="A">A</li>
    <li key="B" id="b">
      B
    </li>
    <li key="C">C</li>
    <li key="D">D</li>
    <li key="E">E</li>
    <li key="F">F</li>
  </ul>
);

ReactDOM.render(element, document.getElementById("root"));
btn1.innerText = "多个节点数量不同、key不同";
btn1.onclick = function () {
  const element = (
    <ul key="ul">
      <li key="A">A</li>
      <li key="C">C</li>
      <li key="E">E</li>
      <li key="B" id="b2">
        B2
      </li>
      <li key="G">G</li>
      <li key="D">D</li>
    </ul>
  );

  ReactDOM.render(element, document.getElementById("root"));
};
```
