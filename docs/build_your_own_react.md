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
// const element = React.createElement(
//   "h1",
//   { title: "foo" },
//   "Hello"
// )
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