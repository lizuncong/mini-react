### 前言
本文翻译自[build-your-own-react](https://pomb.us/build-your-own-react/)，建议先读下原文，是入门fiber的绝佳选择。这篇文章主要是简单介绍实现以下几个概念：
- createElement函数
- render函数
- Concurrent Mode
- Fibers
- Render and Commit Phases
- Reconciliation
- Function Components
- Hooks

### 基本概念
以下面代码为例
```jsx
const element = <h1 title="foo">Hello</h1>
const container = document.getElementById("root")
ReactDOM.render(element, container)
```
jsx不是合法的javascript语法，可以借助Babel等工具将其转换成合法的js。转换过程也非常简单，将html标签替换成createElement方法：
```js
// const element = <h1 title="foo">Hello</h1>
const element = React.createElement(
  "h1",
  { title: "foo" },
  "Hello"
)
const container = document.getElementById("root")
ReactDOM.render(element, container)
```
`React.createElement`根据传递的参数创建一个对象，这个对象至少包含一个type和一个props属性：
```js
// const element = <h1 title="foo">Hello</h1>
// 经babel等编译工具将jsx转换成js
// const element = React.createElement(
//   "h1",
//   { title: "foo" },
//   "Hello"
// )
// React.createElement返回的最终对象大致如下：
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
}
const container = document.getElementById("root")
ReactDOM.render(element, container)
```
`ReactDOM.render`将虚拟dom转换成真实的dom并渲染：
```js
// const element = <h1 title="foo">Hello</h1>
// 经babel等编译工具将jsx转换成js
// const element = React.createElement(
//   "h1",
//   { title: "foo" },
//   "Hello"
// )
// React.createElement返回的最终对象大致如下：
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
}
const container = document.getElementById("root")
// ReactDOM.render(element, container)
// ReactDOM.render大致处理逻辑：
const node = document.createElement(element.type)
node['title'] = element.props.title
const text = document.createTextNode("")
text["nodeValue"] = element.props.children
node.appendChild(text)
container.appendChild(node)
```
为了避免歧义，这里使用 `element` 表示 `React elements`，`node` 表示真实的DOM元素节点。

至此，这段代码无需经过任何编译已经能够在浏览器上跑起来了，不信你可以复制到浏览器控制台试试


### createElement 函数
以下面的代码为例，从本章开始实现一个简单的react代码。
```jsx
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)
const container = document.getElementById("root")
ReactDOM.render(element, container)
```
将jsx转换成`React.createElement`调用的js语法
```js
// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <b />
//   </div>
// )
// 将jsx转换成js语法
const element = React.createElement(
  "div",
  { id: "foo" },
  React.createElement("a", null, "bar"),
  React.createElement("b")
)
const container = document.getElementById("root")
ReactDOM.render(element, container)
```
`React.createElement`实现如下：
```js
// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <b />
//   </div>
// )
React.createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children
    }
  }
}
// 将jsx转换成js语法
const element = React.createElement(
  "div",
  { id: "foo" },
  React.createElement("a", null, "bar"),
  React.createElement("b")
)
const container = document.getElementById("root")
ReactDOM.render(element, container)
```
