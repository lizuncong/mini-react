> 这篇文章介绍了 react 中 context 的实现原理，以及 context 变化时，React 如何查找所有订阅了 context 的组件并跳过 shouldComponentUpdate 强制更新。可以让我们更加充分认识到 context 的性能瓶颈并能够合理设计全局状态管理。

## 学习目标

- React Context 的实现原理
- 订阅了 context 的组件是如何跳过`shouldComponentUpdate`强制 render 的
- React 是如何使用堆栈来存储 Provider 的 value 以支持嵌套 Provider 的
- context 的存取发生在 React 渲染的哪些阶段
- fiber.dependencies 用于保存当前组件订阅的 context 依赖，一般情况下组件只有一个 context 依赖。但是通过 useContext 订阅多个 context 时，fiber.dependencies 就是一个链表
- 为什么我建议尽量少的使用 React Redux？如何合理使用 React Redux 管理全局共享状态？

## 前言

先来简单回顾一下，React 的渲染分为两大阶段，五小阶段：

- render 阶段
  - beginWork
  - completeUnitOfWork
- commit 阶段。
  - commitBeforeMutationEffects
  - commitMutationEffects
  - commitLayoutEffects

beginWork 阶段主要是协调子元素，也就是常说的 dom diff。在 render 阶段，React 为每一个 fiber 节点调用 beginWork 开始执行工作，如果 fiber 没有子节点或者子节点都已经完成了工作，那么这个 fiber 就可以调用 completeUnitOfWork 完成自身的工作，这个过程就是深度优先遍历，具体可以看这篇文章[深入概述 React 初次渲染及状态更新主流程](https://github.com/lizuncong/mini-react/blob/master/docs/render/%E6%B7%B1%E5%85%A5%E6%A6%82%E8%BF%B0%20React%E5%88%9D%E6%AC%A1%E6%B8%B2%E6%9F%93%E5%8F%8A%E7%8A%B6%E6%80%81%E6%9B%B4%E6%96%B0%E4%B8%BB%E6%B5%81%E7%A8%8B.md)。

**React context 只作用于 beginWork 阶段。** 在 beginWork 阶段，如果当前组件订阅了 context，则从 context 中读取 value 值。

context 提供了一种存取全局共享数据的方式

## Context API 简介

React 提供的与 Context 相关的 API，按用途可以划分如下：

- 创建 context: React.createContext
- 提供 context 值: Context.Provider
- 订阅 context 值：
  - Class.contextType。用于类组件订阅 Context
  - Context.Consumer。用于函数组件订阅 Context，这种方式也可以间接的订阅多个 context
  - useContext。用于函数组件订阅 Context，唯一的订阅多个 context 的 api。通过 useContext 订阅多个 context 时，函数组件的 fiber.dependencies 就是一个链表

下面逐一介绍每个 API 的原理

## React.createContext

createContext 负责创建一个 context 对象，包含 Provider 和 Consumer 属性，其中 \_currentValue 用于存储全局共享状态，订阅了 context 的组件都是从 context.\_currentValue 中读取最新值的

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

## Context.Provider

Provider 有三个特性：

- 如果没有对应的 Provider，那么消费组件将读取 context 的默认值，即传递给 createContext 的 defaultValue
- 多个 Provider 可以嵌套使用，里层的会覆盖外层的数据
- Provider 的 value 值发生变化时，它内部的所有消费组件都会跳过 shouldComponentUpdate 强制更新

在介绍 Provider 的源码实现前，我们思考一下，如果让我们设计一个类似 Provider 的 API，如何设计才能满足前面两个特性？（第三个特性机制较复杂，后面会详细介绍）

### 特性 1：Context 默认值的读取

如果没有对应的 Provider，那么消费组件将读取 context 的默认值，即传递给 createContext 的 defaultValue

注意，useContext(CounterContext)等价于 CounterContext.\_currentValue，为了减少干扰方便演示，这里我直接使用 CounterContext.\_currentValue 替代 useContext

```jsx
const CounterContext = React.createContext(-1);

const Counter = () => {
  // const context = useContext(CounterContext);
  const context = CounterContext._currentValue;
  return <div>{context}</div>;
};
class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <Counter />;
  }
}
```

由于没有 Provider，Counter 将读取 context 的默认值，即页面显示-1。但如果我们用 Provider 包裹一下：

```jsx
render() {
  return (
    <CounterContext.Provider value={1}>
      <Counter />
    </CounterContext.Provider>
  );
}
```

由于有 Provider，Counter 将读取 Provider 的 value 值，即页面显示 1。

在调用 React.createContext 创建 context 时，context.\_currentValue 的值保存的就是默认值。因此，如果没有 CounterContext.Provider 时，Counter 可以通过 context.\_currentValue 读取到默认值。

同理，如果有 CounterContext.Provider 包裹 Counter 组件时，我们只需要将 Provider 的 value 值保存到 context.\_currentValue 中就能让 Counter 读取到。

在 render 阶段，CounterContext.Provider 开始 beginWork 时，我们可以将 CounterContext.\_currentValue 设置为新的 value 值。这样在后续的渲染阶段，Counter 就能够通过 CounterContext.\_currentValue 读取到 Provider 最新的 value 值。我们似乎已经满足了第一个特性

```js
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      CounterContext._currentValue = workInProgress.pendingProps.value;
  }
}
```

但考虑到下面的案例

```jsx
render() {
  return [
    <CounterContext.Provider value={1}>
      <Counter />
    </CounterContext.Provider>,
    <Counter />,
  ];
}
```

第二个 Counter 由于没有 Provider，理论上它要读取 context 的默认值。但是我们在 beginWork 时，已经将 CounterContext.\_currentValue 修改成最新的值了，第二个 Counter 读取到的也将是最新的值，而不是默认值。我们需要修改一下 beginWork 的逻辑

```js
let valueCursor;
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      valueCursor = CounterContext._currentValue; // 先将旧值保存起来
      CounterContext._currentValue = workInProgress.pendingProps.value; // pendingProps保存的是新值
  }
}
```

我们声明一个全局变量，将旧值保存起来，然后再将 CounterContext.\_currentValue 设置成新的 value 值。那么问题来了，我们应该在哪个阶段将 CounterContext.\_currentValue 的值恢复成旧值？

> React 在 render 阶段会遍历每一个 fiber 节点并调用 beginWork 为 fiber 执行工作，如果 fiber 没有子节点或者子节点都已经完成了工作，那么可以调用 completeUnitOfWork 为 fiber 完成工作。这个过程就是深度优先遍历，我们可以将 beginWork 理解为"进入"fiber 节点，而将 completeUnitOfWork 理解为"离开"fiber 节点，因此我们可以在离开 fiber 节点时，将 context.\_currentValue 恢复成旧值

completeUnitOfWork 内部调用 completeWork 完成工作，大概如下：

```js
function completeWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      // 在离开Provider节点时，将context._currentValue恢复成旧值
      const oldValue = valueCursor;
      CounterContext._currentValue = oldValue;
      return null;
  }
}
```

### 特性 2：多个相同 Provider 可以嵌套使用，里层的会覆盖外层的数据

我们自己设计的 api 已经能够满足 Provider 的第一个特性了，我们在进入 Provider fiber 节点时，将当前的 context.\_currentValue 值保存起来，然后再将 Provider 新的 value 值保存在 context.\_currentValue 中，这样 Provider 内部的所有组件都能够通过 context.\_currentValue 读取到最新的值。然后再离开 Provider fiber 节点时，我们将 context.\_currentValue 恢复成旧值。

现在让我们考虑下面多个 Provider 嵌套的场景：

```jsx
render() {
  return [
    <CounterContext.Provider id="provider1" value={1}>
      <CounterContext.Provider id="provider2" value={2}>
        <Counter id="counter1" />
      </CounterContext.Provider>
      <Counter id="counter2" />
    </CounterContext.Provider>,
    <Counter id="counter3" />,
  ];
}
```

根据 Provider 里层覆盖外层值的特性：

- `counter1`读取的是`provider2`的 value 值，即 2
- `counter2`读取的是`provider1`的 value 值，即 1
- `counter3`由于没有 Provider 包裹，因此读取的是 context 的默认值，即-1

页面显示 2，1，-1。

**同时，我们必须要理解的一点是，`provider1`和`provider2`虽然是两个组件，但他们的 context 是同一个引用，三个 Counter 组件都是从 context.\_currentValue 中读取的值**

显然我们在前面设计的 api 满足不了这种场景，为了能实现嵌套的机制，我们遵循 React 遍历 fiber 节点的顺序，来看下这个思路：

- 在进入`provider1`时，将当前 context.\_currentValue 的值(记为`oldValue1`)保存起来，然后将`provider1`新的 value 值赋值给 context.\_currentValue
- React 继续遍历`provider2`，进入`provider2`时，我们又需要将当前 context.\_currentValue 的值(记为`oldValue2`)保存起来，然后将`provider2`新的 value 值赋值给 context.\_currentValue
- React 继续遍历`counter1`，`counter1`读取 context.\_currentValue 的值，就是`provider2`的 value 值。遍历完`counter1`后，就可以调用 completeUnitOfWork 完成工作
- 当为`provider2`完成工作时，即离开`provider2`时，我们需要将 context.\_currentValue 的值恢复成`provider1`的 value 值，即`oldValue2`
- 开始遍历 counter2，此时 counter2 通过 context.\_currentValue 读取到的就是 provider1 的 value 值
- 当为`provider1`完成工作时，即离开`provider1`时，我们需要将 context.\_currentValue 的值恢复成默认值，即`oldValue1`

看上去这个思路行得通，我们只需要多声明几个全局变量保存 context 的当前值就可以了

```js
let valueCursor1; // 保存oldValue1
let valueCursor2; // 保存oldValue2
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      if (workInProgress.id === "provider1") {
        valueCursor1 = CounterContext._currentValue; // 进入provider1时，将CounterContext的当前值保存起来，此时是默认值
        CounterContext._currentValue = workInProgress.pendingProps.value; //将provider1新的value值赋值给CounterContext._currentValue
      }
      if (workInProgress.id === "provider2") {
        valueCursor2 = CounterContext._currentValue; // 进入provider2时，将CounterContext的当前值保存起来，此时是provider1的value值
        CounterContext._currentValue = workInProgress.pendingProps.value; //将provider2新的value值赋值给CounterContext._currentValue
      }
  }
}
function completeWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      if (workInProgress.id === "provider2") {
        CounterContext._currentValue = valueCursor2; // 离开provider2节点时，需要将context._currentValue恢复成provider1的value值
      }
      if (workInProgress.id === "provider1") {
        CounterContext._currentValue = valueCursor1; // 离开provider1节点时，需要将context._currentValue恢复成默认值
      }

      return null;
  }
}
```

似乎这个实现思路已经满足两个 provider 的嵌套，如果有代码洁癖的同学会发现，valueCursor1，valueCursor2，以及 if 判断不太友好。同时，最重要的是，我们无法满足更多层级的 provider 的嵌套：

```jsx
  render() {
    return [
      <CounterContext.Provider id="provider1" value={1}>
        <CounterContext.Provider id="provider2" value={2}>
          <CounterContext.Provider id="provider3" value={3}>
            <CounterContext.Provider id="provider4" value={4}>
              <Counter id="counter1" />
            </CounterContext.Provider>
          </CounterContext.Provider>
        </CounterContext.Provider>
        <Counter id="counter2" />
      </CounterContext.Provider>,
      <Counter id="counter3" />,
    ];
  }
```

如果按照我们的做法，得声明好几个变量保存当前值，然后我们又无法确定有多少层级根本无法提前声明这些变量。看到这里，fiber 节点进进出出的很容易让我们想到堆栈，我们可以使用栈来保存当前的 context 值

```js
let valueStack = [];
let index = -1;
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider: {
      var context = workInProgress.type._context;
      index++;
      valueStack[index] = context._currentValue; // 先将context当前的值保存起来
      context._currentValue = workInProgress.pendingProps.value; // 然后将provider新的value值赋值给context._currentValue
    }
  }
}
function completeWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider: {
      const preValue = valueStack[index];
      valueStack[index] = null;
      index--;
      var context = providerFiber.type._context;
      context._currentValue = preValue;
    }
  }
}
```

这个版本的实现已经可以满足嵌套任意层的 Provider 了，同时还能满足不同的 Provider 组件嵌套，比如：

```jsx
render() {
  return [
    <CounterContext.Provider id="provider1" value={1}>
      <UserContext.Provider id="userprovider1" value={"mike"}>
        <Counter id="counter1" />
      </UserContext.Provider>
    </CounterContext.Provider>,
  ];
}
```

实际上，这正是 React 所采用的实现方式，这种方式既能满足读取默认值的特性，又能满足里层的 Provider 覆盖外层的 Provider 的场景(指的是相同的 Provider 的覆盖)

### Context.Provider 源码实现

React 在 beginWork 阶段对 Provider 类型的 fiber 节点执行的主要工作有两点：

- 调用 pushProvider，将 context.\_currentValue 保存到 valueStack 栈中。然后将 context.\_currentValue 设置成 Provider 新的 value 值
- 使用浅比较判断 Context.Provider 的新旧 value 值是否发生了改变，如果发生了改变，则调用 propagateContextChange 找出所有订阅了这个 context 的组件，然后跳过 shouldComponenentUpdate 强制更新。查找算法放在后面单独一节介绍

在 completeWork 阶段，Provider 类型的 fiber 节点执行的主要工作有一点：

- 调用 popProvider 将 context.\_current 恢复成上一个值，即直接从 valueStack 取出第一项即可

```js
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      return updateContextProvider(current, workInProgress, renderLanes);
  }
}
function completeWork(current, workInProgress, renderLanes) {
  var newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case ContextProvider:
      popProvider(workInProgress);
      return null;
  }
}
var valueCursor = { current: null };
var valueStack = [];
var index = -1;
function pushProvider(providerFiber, nextValue) {
  var context = providerFiber.type._context;
  index++;
  valueStack[index] = valueCursor.current;
  valueCursor.current = context._currentValue;
  context._currentValue = nextValue;
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

function popProvider(providerFiber) {
  var currentValue = valueCursor.current;
  pop(valueCursor);
  var context = providerFiber.type._context;
  context._currentValue = currentValue;
}
```

## 消费组件如何读取 Context 的值？

React 提供了三种方式读取 Context 的值：

- Class.contextType。用于类组件订阅 Context
- Context.Consumer。用于函数组件订阅 Context
- useContext。用于函数组件订阅 Context

以上三种方式，都是需要手动传递 context 对象的，比如 useContext(context)，Class.contextType = context。

对于函数组件，useContext 本质上就是调的`readContext`函数，即我们可以直接认为`useContext === readContext`，readContext 返回 context.\_currentValue

对于类组件，React 会判断类组件上是否有静态属性 contextType，如果有，则调用 `readContext` 读取 context 值，并赋值给类实例的 context 属性

```js
const ctor = workInProgress.type;
const instance = new ctor();
const contextType = ctor.contextType;
if (typeof contextType === "object" && contextType !== null) {
  instance.context = readContext(contextType);
}
```

对于 Context.Consumer，context 本身就存在 Consumer 里面

```js
var context = workInProgress.type;
var newProps = workInProgress.pendingProps;
var render = newProps.children;
prepareToReadContext(workInProgress, renderLanes);
var newValue = readContext(context, newProps.unstable_observedBits);
var newChildren = render(newValue);
```

可以看出，这三种方式在读取 context 时都要进行两个操作：

- 在读取 context 前，都需要先调用`prepareToReadContext`进行准备工作，重置几个和 contex 有关的全局变量，以及判断 context 的value是否变更了
- 都是调用 readContext 方法读取 context 值，readContext 方法返回 context.\_currentValue 的值

`prepareToReadContext`主要逻辑如下：

- 将全局变量 currentlyRenderingFiber 设置为当前正在工作的 fiber，在 readContext 时可以通过这个全局变量拿到正在工作中的 fiber
- 将全局变量 lastContextWithAllBitsObserved 重置为 null，这个变量在 readContext 函数中会被设置成 context 对象
- 全局变量 lastContextDependency 在通过 useContext 订阅多个不同的 context 时，用于构造 dependencies 列表
- 重置 fiber dependencies 列表

```js
function prepareToReadContext(workInProgress, renderLanes) {
  currentlyRenderingFiber = workInProgress;
  lastContextDependency = null;
  lastContextWithAllBitsObserved = null; // 这个全局变量保存的是context对象
  var dependencies = workInProgress.dependencies;

  if (dependencies !== null) {
    var firstContext = dependencies.firstContext;

    if (firstContext !== null) {
      if (includesSomeLane(dependencies.lanes, renderLanes)) {
        // Context list has a pending update. Mark that this fiber performed work.
        didReceiveUpdate = true;
      } // Reset the work-in-progress list
      // 重置fiber context依赖
      dependencies.firstContext = null;
    }
  }
}
```

```js
function readContext(context, observedBits) {
  if (lastContextWithAllBitsObserved === context);
  else if (observedBits === false || observedBits === 0);
  else {
    var resolvedObservedBits; // Avoid deopting on observable arguments or heterogeneous types.

    if (
      typeof observedBits !== "number" ||
      observedBits === MAX_SIGNED_31_BIT_INT
    ) {
      // Observe all updates.
      lastContextWithAllBitsObserved = context;
      resolvedObservedBits = MAX_SIGNED_31_BIT_INT;
    } else {
      resolvedObservedBits = observedBits;
    }

    var contextItem = {
      context: context,
      observedBits: resolvedObservedBits,
      next: null,
    };

    if (lastContextDependency === null) {
      if (!(currentlyRenderingFiber !== null)) {
        {
          throw Error(formatProdErrorMessage(308));
        }
      } // This is the first dependency for this component. Create a new list.

      lastContextDependency = contextItem;
      currentlyRenderingFiber.dependencies = {
        lanes: NoLanes,
        firstContext: contextItem,
        responders: null,
      };
    } else {
      // Append a new context item.
      lastContextDependency = lastContextDependency.next = contextItem;
    }
  }

  return context._currentValue;
}
```

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
