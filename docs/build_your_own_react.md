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

### 第一章 基本概念
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


### 第二章 createElement 函数
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
`React.createElement`接收的children有可能是原子值，比如字符串或者数字等，`React.createElement('h1', {title: 'foo'}, 'Hello')`。为了简化我们的代码，创建一个特殊的`TEXT_ELEMENT` 类型将其转换成对象
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
      children: children.map(child => {
        if(typeof child === 'object'){
          return child
        }
        return {
          type: 'TEXT_ELEMENT',
          props: {
            nodeValue: child,
            children: [],
          }
        }
      })
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

好了，现在我们已经实现了一个简单的`createElement`函数，我们可以通过一段**特殊的注释**来告诉babel在将jsx转换成js时使用我们自己的`createElement`函数：
```jsx
const MiniReact = {
  createElement:  (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if(typeof child === 'object'){
            return child
          }
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: child,
              children: [],
            }
          }
        })
      }
    }
  }
}
/** @jsx MiniReact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)
console.log('element======', element)
const container = document.getElementById("root")
ReactDOM.render(element, container)
```


### 第三章 render函数
```js
import React from 'react';

function render(element, container) {
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(element.type)

  const isProperty = key => key !== 'children'
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name]
    })

  element.props.children.forEach(child => {
    render(child, dom)
  });

  container.appendChild(dom)
}
const MiniReact = {
  createElement:  (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if(typeof child === 'object'){
            return child
          }
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: child,
              children: [],
            }
          }
        })
      }
    }
  },
  render
}
/** @jsx MiniReact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)
console.log('element======', element)
const container = document.getElementById("root")
MiniReact.render(element, container)
```
`render`函数递归创建真实的dom元素，然后将各个元素append到其父元素中，最后整个dom树append到root container中，渲染完成。


**注意，只有当整个dom树append到root container中时，页面才会显示**

### 第四章 Concurrent Mode
在第三章中可以看到，当前版本的`render`函数是递归构建dom树，最后才append到root container，最终页面才渲染出来。这里有个问题，如果dom节点数量庞大，递归层级过深，这个过程其实是恨耗时的，导致`render`函数长时间占用主线程，浏览器无法响应用户输入等事件，造成卡顿的现象。

因此我们需要将`render`过程拆分成小的任务单元，每执行完一个单元，都允许浏览器打断`render`过程并执行高优先级的任务，等浏览器得空再继续执行`render`过程

如果对`requestIdleCallback`不熟悉的，可以自行了解一下。真实React代码中并没有使用这个api，因为有兼容性问题。因此React使用`scheduler package`模拟这个调度过程
```js
let nextUnitOfWork = null
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
```

`performUnitOfWork`接收当前工作单元，并返回下一个工作单元。**工作单元可以理解为就是一个fiber对象节点**

`workLoop`循环里会循环调用`performUnitOfWork`，直到所有工作单元都已经处理完毕，或者当前帧浏览器已经没有空闲时间，则循环终止。等下次浏览器空闲时间再接着继续执行

**因此我们需要一种数据结构，能够支持任务打断并且可以接着继续执行，很显然，链表就非常适合**