> 这篇文章介绍了 react 中 context 的实现原理，以及 context 变化时，React 如何查找所有订阅了 context 的组件并跳过 shouldComponentUpdate 强制更新。可以让我们更加充分认识到 context 的性能瓶颈并能够合理设计全局状态管理。

## 大纲

- React Context 的实现原理
- 订阅了 context 的组件是如何跳过`shouldComponentUpdate`强制 render 的
- context 的读取发生在 React 渲染的哪些阶段
- fiber.dependencies 属性的用途，函数组件通过 useContext 订阅多个 context 时，fiber.dependencies 就是一个链表，保存的是组件订阅的 context
- 如何合理使用 React Redux 管理全局共享状态

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
