> 这篇文章介绍了 react 中 context 的实现原理，以及 context 变化时，React 如何查找所有订阅了 context 的组件并跳过 shouldComponentUpdate 强制更新。可以让我们更加充分认识到 context 的性能瓶颈并能够合理设计全局状态管理。

## 大纲

- React Context 的实现原理
- 订阅了 context 的组件是如何跳过`shouldComponentUpdate`强制 render 的
- context 的读取发生在 React 渲染的哪些阶段
- fiber.dependencies 属性的用途，函数组件通过 useContext 订阅多个 context 时，fiber.dependencies 就是一个链表，保存的是组件订阅的 context
- 如何合理使用 React Redux 管理全局共享状态

## 前言

先来简单回顾一下，React 的渲染分为两大阶段，五小阶段：

- render 阶段
  - beginWork
  - completeUnitOfWork
- commit 阶段。
  - commitBeforeMutationEffects
  - commitMutationEffects
  - commitLayoutEffects

beginWork 阶段主要是协调子元素，也就是常说的 dom diff。**React context 只作用于 beginWork 阶段。** 在 beginWork 阶段，如果当前组件订阅了 context，则从 context 中读取 value 值。

context 提供了一种存取全局共享数据的方式

## Context 实现原理

React 提供的与 Context 相关的 API，按用途可以划分如下：

- 创建 context: React.createContext
- 提供 context 值: Context.Provider
- 订阅 context 值：
  - Class.contextType。用于类组件订阅 Context
  - Context.Consumer。用于函数组件订阅 Context，这种方式也可以间接的订阅多个 context
  - useContext。用于函数组件订阅 Context，唯一的订阅多个 context 的 api

### React.createContext

createContext 负责创建一个 context 对象，包含 Provider 和 Consumer 属性，其中 \_currentValue 用于存储全局共享状态，订阅了 context 的组件都是从 context.\_currentValue 中读取值的

```js
var symbolFor = Symbol.for;
const REACT_CONTEXT_TYPE = symbolFor("react.context");
const REACT_PROVIDER_TYPE = symbolFor("react.provider");
function createContext(defaultValue) {
  var context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null,
  };
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context,
  };
  context.Consumer = {
    $$typeof: REACT_CONTEXT_TYPE,
    _context: context,
  };

  return context;
}
const context = createContext({ count: 0 });
console.log("context....", context);
```

### Context.Provider

以下面的 demo 为例

```jsx
import React, { useContext } from "react";
import ReactDOM from "react-dom";

const CounterContext = React.createContext({
  count: 0,
  addCount: () => {},
});

const Counter = () => {
  const context = useContext(CounterContext);
  console.log("Counter render");
  return (
    <button id="counter" onClick={context.addCount}>
      {context.count}
    </button>
  );
};
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.addCount = () => {
      console.log("点击按钮触发更新", this.state.count + 1);
      this.setState({
        count: this.state.count + 1,
      });
    };
    this.state = {
      count: 0,
      addCount: this.addCount,
    };
  }

  render() {
    console.log("Home render");
    return (
      <CounterContext.Provider value={this.state}>
        <Counter />
      </CounterContext.Provider>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
```

在 beginWork 阶段，React 为 Context.Provider fiber 执行的操作：

```js
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      return updateContextProvider(current, workInProgress, renderLanes);
  }
}
function updateContextProvider(current, workInProgress, renderLanes) {
  var context = workInProgress.type._context; // React.createContext的返回值
  var newProps = workInProgress.pendingProps;
  var oldProps = workInProgress.memoizedProps;
  var newValue = newProps.value;

  pushProvider(workInProgress, newValue);

  if (oldProps !== null) {
    var oldValue = oldProps.value;
    var changedBits = newValue === oldValue;
    if (changedBits === 0) {
      if (oldProps.children === newProps.children && !hasContextChanged()) {
        // 没有改变
        return bailoutOnAlreadyFinishedWork(
          current,
          workInProgress,
          renderLanes
        );
      }
    } else {
      // context变了，遍历Provider所有的子孙fiber节点，查找订阅了该context的组件并标记为强制更新
      propagateContextChange(workInProgress, context, changedBits, renderLanes);
    }
  }

  var newChildren = newProps.children;
  reconcileChildren(current, workInProgress, newChildren, renderLanes);
  return workInProgress.child;
}
```

这里有两个重要的操作

- 调用 pushProvider 给 context.\_currentValue 设置新的值
- 使用浅比较判断 Context.Provider 的新旧 value 值是否发生了改变，如果发生了改变，则调用 propagateContextChange 找出所有订阅了这个 context 的组件，然后跳过 shouldComponenentUpdate 强制更新。查找算法放在后面单独一节介绍

我们来看下 pushProvider 方法

```js
function pushProvider(providerFiber, nextValue) {
  var context = providerFiber.type._context;

  push(valueCursor, context._currentValue);
  context._currentValue = nextValue;
}
```

context.\_currentValue 保存的是最新的 value 值，这样其子元素就能够通过 context.\_currentValue 读取到最新的值，因此，在 beginWork 阶段会调用 pushProvider 给 context.\_currentValue 设置最新的 value 值。

这里有个问题，如果订阅了这个 context 的组件没有被 Context.Provider 组件包裹，比如下面这样：

```jsx
<>
  <Context.Provider value={this.state}>
    <Counter />
  </Context.Provider>
  <Counter />
</>
```

第二个 Counter 组件在 Provider 外面，因此它会读取到 context 的默认值，即永远都是 `{ count: 0, addCount: () => }`。但是 beginWork 阶段 React 在执行 Context.Provider 时已经修改了 context 的\_currentValue 值，此时如果继续遍历到第二个 Counter 组件，它读取到的 context.\_currentValue 就不是默认值而是最新值了。因此，React 在 completeUnitOfWork 阶段，当 Context.Provider 执行完时，会调用 popProvider 将 context.\_currentValue 重置为默认值


```js
function popProvider(providerFiber) {
  var currentValue = valueCursor.current;
  pop(valueCursor);
  var context = providerFiber.type._context;
  context._currentValue = currentValue;
}
function completeWork(current, workInProgress, renderLanes) {
  var newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case ContextProvider:
      popProvider(workInProgress);
      return null;
  }
}
```

那问题来了，React是如何存储默认值的？原本我们可以将默认值直接存在


## Context.Provider value 变化，React 如何强制更新？

以下面的 demo 为例

```jsx
import React, { useContext } from "react";
import ReactDOM from "react-dom";

const CounterContext = React.createContext({
  count: 0,
  addCount: () => {},
});

class Counter extends React.Component {
  static contextType = CounterContext;
  shouldComponentUpdate() {
    return false;
  }
  render() {
    console.log("Counter render");
    return (
      <button id="counter" onClick={this.context.addCount}>
        {this.context.count}
      </button>
    );
  }
}

class CounterWrap extends React.Component {
  render() {
    console.log("CounterWrap render，控制台只会输出一次");
    return <Counter />;
  }
}

class NeverUpdate extends React.Component {
  render() {
    console.log("NeverUpdate render，控制台只会输出一次");
    return <div>永远不会更新</div>;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    console.log("App render，控制台只会输出一次");
    return [<CounterWrap />, <NeverUpdate />];
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.addCount = () => {
      console.log("点击按钮触发更新", this.state.count + 1);
      this.setState({
        count: this.state.count + 1,
      });
    };
    this.state = {
      count: 0,
      addCount: this.addCount,
    };
  }

  render() {
    console.log("Home render");
    return (
      <CounterContext.Provider value={this.state}>
        <App />
      </CounterContext.Provider>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
```

- App 组件的 shouldComponentUpdate 永远返回 false，理论上 App 组件以及它的所有子组件的 render 在更新的过程中都不会执行，即不会更新。
- Counter 组件的 shouldComponentUpdate 永远返回 false，理论上 Counter 也不会更新

但是我们点击按钮，观察控制台可以发现：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/context-01.jpg)

- 第一次渲染时，所有组件都会更新，组件的 render 方法都被执行
- 在随后的点击过程中，只有 Home 组件以及订阅了 Context 的 Counter 组件更新了，它们对应的 render 方法执行

Home 的更新很容易理解，因为点击按钮触发了它的 state 更新，**那么 Counter 组件是如何跳过父组件 App 以及其自身的 shouldComponentUpdate 强制更新的？**

先来简单回顾一下，React 的渲染分为两大阶段，五小阶段：

- render 阶段
  - beginWork
  - completeUnitOfWork
- commit 阶段。
  - commitBeforeMutationEffects
  - commitMutationEffects
  - commitLayoutEffects

beginWork 阶段主要是协调子元素，也就是常说的 dom diff。**React context 只作用于 beginWork 阶段。**当点击按钮触发更新时，React 从 fiber 树的根节点(root fiber)开始执行 beginWork 函数，协调子元素(实际上每一次更新都会从 root fiber 开始调度执行)。

当执行到 CounterContext.Provider 组件时，React 使用**浅比较** 比较 Provider 的新旧值

```js
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      return updateContextProvider(current, workInProgress, renderLanes);
  }
}

// React真实的源码中，使用changedBits标记context是否有变化，但其实逻辑可以简化成下面的实现
function calculateChangedBits(context, newValue, oldValue) {
  if (oldValue === newValue) {
    // 浅比较
    // 如果相等，说明没有变化
    return 0;
  } else {
    // 有变化
    return true;
  }
}
function updateContextProvider(current, workInProgress, renderLanes) {
  var providerType = workInProgress.type;
  var context = providerType._context;
  var newProps = workInProgress.pendingProps;
  var oldProps = workInProgress.memoizedProps;
  var newValue = newProps.value;

  pushProvider(workInProgress, newValue);

  if (oldProps !== null) {
    var oldValue = oldProps.value;
    var changedBits = calculateChangedBits(context, newValue, oldValue);

    if (changedBits === 0) {
    } else {
      // context变化了，因此需要查找所有订阅了这个context的组件，将它们标记为强制更新，并调度更新
      propagateContextChange(workInProgress, context, changedBits, renderLanes);
    }
  }
  var newChildren = newProps.children;
  reconcileChildren(current, workInProgress, newChildren, renderLanes);
  return workInProgress.child;
}
```

updateContextProvider 方法逻辑较简单，判断 context 是否变化，**如果有变化则调用 propagateContextChange 开始向下遍历查找所有订阅了这个 context 的组件**，查找的算法也很简单，从当前的 Provider 组件开始，遍历 Provider 组件下面所有的 fiber 节点，找到订阅了这个 context 的组件，并标记为强制更新。

## React Context 的实现原理

## 如何合理使用 React Redux 管理全局共享状态

在平时的开发中，我发现大部分同学都是将所有的状态丢给 React Redux 管理，实际上这是很不利于 React 渲染性能的，因此一个最佳实践是，只将真正需要共享的状态丢给 React Redux 管理，而组件内部的状态则内部维护。这样就能充分利用 React 提供的 memo 或者 PureComponent 提高更新阶段的渲染性能。
