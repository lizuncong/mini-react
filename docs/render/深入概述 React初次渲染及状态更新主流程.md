> 本章主要介绍 `ReactDOM.render` 初次渲染以及 `setState` 手动触发更新的主流程。学习 `React` 渲染的两个阶段：`render` 和 `commit` 阶段。了解 `React` 合成事件注册时机、类组件生命周期方法、函数组件 `hook` 调用时机、reconcile(dom diff)算法等。

## 深入概述 ReactDOM.render 初次渲染 以及 setState 手动触发状态更新主流程

### 调试 DEMO

答应我，在阅读本篇文章时，用以下 Demo，在本篇文章介绍的各个函数入口处打断点，边阅读边 debug。书读百遍，真的不如动手一遍。

新建 index.jsx 文件：

```jsx
import React from "react";
import ReactDOM from "react-dom";
import Counter from "./Counter";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(
      (state) => {
        return { step: state.step + 1 };
      },
      () => {
        console.log("this.setState callback");
      }
    );
  }
  static getDerivedStateFromProps(props, state) {
    console.log("getDerivedStateFromProps======");
    return null;
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {
    const btn = document.getElementById("btn");
    const scrollHeight = btn.scrollHeight;
    console.log("get snapshot before update...", scrollHeight);
    return scrollHeight;
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log("component did update...", snapshot);
  }
  componentDidMount() {
    console.log("component did mount......");
  }
  componentWillUnmount() {
    console.log("component will unmount...");
  }
  UNSAFE_componentWillMount() {
    console.log("component will mount...");
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log("component will receive props...", nextProps);
  }
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    console.log("component will update....", nextProps, nextState);
  }
  shouldComponentUpdate() {
    console.log("should component update");
    return true;
  }

  render() {
    return [
      (!this.state.step || this.state.step % 3) && (
        <Counter step={this.state.step} />
      ),
      <button id="btn" key="2" onClick={this.handleClick}>
        类组件按钮：{this.state.step}
      </button>,
    ];
  }
}

ReactDOM.render(<Home />, document.getElementById("root"));
```

新建 Counter.jsx 文件：

```jsx
import React, { useState, useEffect, useLayoutEffect } from "react";
const Counter = ({ step }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("useEffect====");
  });
  useLayoutEffect(() => {
    console.log("useLayoutEffect====");
  });
  const onBtnClick = () => {
    setCount(count + 1);
  };
  return (
    <div style={{ margin: "50px" }}>
      <button onClick={onBtnClick}>{count}</button>
      <div>props：{step}</div>
      {!(count % 2) && <div>函数组件，复数显示，单数隐藏</div>}
    </div>
  );
};

export default Counter;
```

### 一、前置知识

在阅读本文时，假设你已经有一些 fiber 的基础知识。

#### 1.1 容器 root 节点

我们传递给 `ReactDOM.render(element, root)` 的第二个参数 `root`

#### 1.2 fiber 类型

`fiber` 节点的类型通过 `fiber.tag` 标识，称为 `React work tag`。我们重点关注以下几个类型：

- HostRoot。容器 root 节点对应的 fiber 类型。一般来说，一个 React 应用程序只会有一个 HostRoot 类型的 fiber 节点。
- ClassComponent。类组件对应的 fiber 类型。
- FunctionComponent。函数组件对应的 fiber 类型。
- IndeterminateComponen。函数组件第一次渲染时对应的 fiber 类型
- HostComponent。原生的 HTML 标签(比如 div)对应的 fiber 类型
- HostText。文本节点类型。

React 对于文本节点的处理分两种场景：单一节点和多节点。比如：

```jsx
// 单一节点情况。React在render阶段，不会为div的子节点创建新的fiber节点，而是将 "单一节点情况" 这个字符串当作 div 的 textContent或者nodeValue处理
<div>单一节点情况</div>
```

```jsx
// 多节点情况。假设props.count等于0。React 在 render 阶段将子节点视为两个节点："多节点情况：" 以及 "0"。然后为这两个子节点都创建对应的fiber节点，节点类型就是 HostText
<div>多节点情况：{props.count}</div>
```

记住这几个 fiber 类型，会贯穿整篇文章。在整个 react 渲染阶段，react 基于 fiber.tag 执行不同的操作。因此你会看到大量的基于 fiber.tag 的 switch 语句。

#### 1.3 副作用

副作用通过 `fiber.flags` 标记。对于不同的 fiber 类型，副作用含义不同

- HostRoot。
- ClassComponent。类组件如果实现了 componentDidMount 等生命周期方法，则对应的 fiber 节点包含副作用
- FunctionComponent。函数组件如果调用了 useEffect、useLayoutEffect，则对应的 fiber 节点包含副作用
- HostComponent。原生的 HTML 标签如果属性，比如 style 等发生了变更，则对应的 fiber 节点包含副作用。
- HostText。文本发生了变化，则对应的 fiber 节点包含副作用。

在 render 阶段，react 会找出有副作用的 fiber 节点，并自底向上构建单向的`副作用链表`

#### 1.4 React 渲染流程

React 渲染可以概括为：两大阶段，五小阶段：

- render 阶段
  - beginWork
  - completeUnitOfWork
- commit 阶段。
  - commitBeforeMutationEffects
  - commitMutationEffects
  - commitLayoutEffects

##### 1.4.1 render 阶段

`render` 阶段支持异步并发渲染，可中断。分为 beginWork 以及 completeUnitOfWork 两个子阶段：

- beginWork。
  - reconcileChildren。根据当前工作的 fiber 节点最新的 react element 子元素和旧的 fiber 子元素进行比较以决定是否复用旧的 fiber 节点，并标记 fiber 节点是否有副作用。注意这里如果是类组件或者函数组件，则需要调用类组件实例的 render 方法或者执行函数组件获取最新的 react element 子元素
- completeUnitOfWork。
  - 对于 HostComponent。比较 newProps 和 oldProps，收集发生变更的属性键值对，并存储在 fiber.updateQueue 中
  - 构建副作用链表。自底向上找出有副作用的 fiber 节点，并构建单向链表

render 阶段的结果是一个副作用链表以及一棵 finishedWork 树。

##### 1.4.2 commit 阶段

commit 阶段是同步的，一旦开始就不能再中断。这个阶段遍历副作用链表并执行真实的 DOM 操作。commit 阶段分为 `commitBeforeMutationEffects`、`commitMutationEffects` 以及 `commitLayoutEffects` 三个子阶段。每个子阶段都是一个 while 循环。同时，**每个子阶段都是从头开始遍历副作用链表！！！**

- commitBeforeMutationEffects。DOM 变更前。这个阶段除了类组件以外，其他类型的 fiber 节点几乎没有任何处理
  - 调用类组件实例上的 getSnapshotBeforeUpdate 方法
- commitMutationEffects。操作真实的 DOM
  - 对于 HostComponent
    - 更新 dom 节点上的 `__reactProps$md9gs3r7129` 属性，这个属性存的是 fiber 节点的 props 值。这个属性很重要，主要是更新 dom 上的 onClick 等合成事件。由于事件委托在容器 root 上，因此在事件委托时，需要通过 dom 节点获取最新的 onClick 等事件
    - 更新发生了变更的属性，比如 style 等
  - 对于 HostText，直接更新文本节点的 nodeValue 为最新的文本值
  - 对于类组件，则什么都不做。
- commitLayoutEffects。DOM 变更后。
  - 对于 HostComponent，判断是否需要聚焦
  - 对于 HostText，什么都没做
  - 对于类组件
    - 初次渲染，则调用 componentDidMount
    - 更新则调用 componentDidUpdate
    - 调用 this.setState 的 callback

### 二、ReactDOM.render 初次渲染

初次渲染的入口。初次渲染主要逻辑在 `createRootImpl` 以及 `updateContainer` 这两个函数中，**React 在初次渲染不会追踪副作用**，主要工作：

- 创建 FiberRootNode 类型节点。**这是用于保存 fiber 树的容器**。可以通过 `root._reactRootContainer._internalRoot` 属性访问。
- 创建 HostRoot Fiber。即容器 root 节点对应的 fiber 节点，这也是 fiber 树的根节点
- 将 HostRootFiber 挂载到 FiberRootNode 的 current 属性
- 往容器 root 上注册浏览器支持的所有原生事件。这也是合成事件的入口
- 调用 scheduleUpdateOnFiber 开始调度更新。

本篇文章中我们重点关注 `_internalRoot` 中的两个属性：`current` 和 `finishedWork`。`current` 保存的是当前页面对应的 fiber 树。`finishedWork` 保存的是 render 阶段完成，commit 阶段开始前，构建完成但是还没更新到页面的 fiber 树。等 `commit` 阶段完成后，`finishedWork` 树就变成了 `current` 树

```js
function render(element, container, callback) {
  return legacyRenderSubtreeIntoContainer(...);
}
// container = document.getElementById('root')
function legacyRenderSubtreeIntoContainer(...,container, ...) {
  // container._reactRootContainer只包含_internalRoot属性
  let root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container);
  let fiberRoot = root._internalRoot;
  updateContainer(children, fiberRoot, parentComponent, callback);
}
function legacyCreateRootFromDOMContainer(container, forceHydrate) {
  return createLegacyRoot(container, undefined);
}

function createLegacyRoot(container, options) {
  return new ReactDOMBlockingRoot(container, LegacyRoot, options);
}
function ReactDOMBlockingRoot(container, tag, options) {
  this._internalRoot = createRootImpl(container, tag, options);
}

function createRootImpl(container, tag, options) {
  // createContainer主要逻辑：
  // 1.创建FiberRootNode节点，注意这并不是一个fiber
  // 2.创建 HostRoot Fiber。即容器root节点对应的fiber节点，这也是fiber树的根
  // 3.将 HostRootFiber挂载到FiberRootNode的current属性
  const root = createContainer(container, tag, hydrate);
  // 在根容器上注册所有支持的事件监听器，合成事件的入口
  listenToAllSupportedEvents(container);
  return root;
}

// element就是 react element tree
// container 就是 fiber 树的容器，即 FiberRootNode
function updateContainer(element, container) {
  const current = container.current; // fiber 树的根节点，即 HostRootFiber
  const update = createUpdate(eventTime, lane);
  // 根节点的 update.payload存的是整棵 virtual dom 树
  update.payload = { element: element };
  enqueueUpdate(current, update);
  scheduleUpdateOnFiber(current, lane, eventTime);
}
```

### 三、调度更新

#### 3.1 scheduleUpdateOnFiber

更新的入口。不管是初次渲染，还是后续我们通过 this.setState 或者 useState 等手动触发状态更新，都会走 `scheduleUpdateOnFiber` 方法开始调度更新。`scheduleUpdateOnFiber` 会从当前 fiber 开始往上找到 HostRootFiber，然后从 HostRootFiber 开始更新。

这里又分为同步更新以及批量更新。同步更新直接走 `performSyncWorkOnRoot` 方法。批量更新走 `ensureRootIsScheduled` 方法调度。`ensureRootIsScheduled` 方法里面会根据环境判断是该走同步更新，即 `performSyncWorkOnRoot` 还是批量更新，即 `performConcurrentWorkOnRoot`

本篇文章中，我们只需要关注同步更新，即 `performSyncWorkOnRoot` 的流程。

```js
function scheduleUpdateOnFiber(fiber, lane, eventTime) {
  //返回的是FiberRootNode，即 fiber 树的容器
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  if (同步更新) {
    performSyncWorkOnRoot(root);
  } else {
    ensureRootIsScheduled(root);
  }
}
function ensureRootIsScheduled(root) {
  if (newCallbackPriority === SyncLanePriority) {
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
  } else if (newCallbackPriority === SyncBatchedLanePriority) {
    scheduleCallback(
      ImmediatePriority$1,
      performSyncWorkOnRoot.bind(null, root)
    );
  } else {
    scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root)
    );
  }
}
```

#### 3.2 performSyncWorkOnRoot

`performSyncWorkOnRoot` 的 render 阶段是同步的。在这里，React 将渲染过程拆分成了两个子阶段：

- renderRootSync。render 阶段
- commitRoot。commit 阶段

```js
function performSyncWorkOnRoot(root) {
  // render阶段的入口
  renderRootSync(root, lanes);
  // render阶段完成后得到一棵finishedWork tree以及副作用链表(effect list)
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  // commit阶段开始
  commitRoot(root);
}
```

### 四、render 阶段

#### 4.1 renderRootSync

render 阶段从 `renderRootSync` 函数开始。主要逻辑在 `prepareFreshStack` 以及 `workLoopSync` 方法。

```js
function renderRootSync(root, lanes) {
  prepareFreshStack(root, lanes);
  workLoopSync();
}
function prepareFreshStack(root, lanes) {
  root.finishedWork = null;
  workInProgressRoot = root;
  workInProgress = createWorkInProgress(root.current, null);
}
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
```

workInProgress 代表正在工作的 fiber 节点。对于每一个 fiber 节点，都会执行 performUnitOfWork。

#### 4.2 performUnitOfWork

对于每一个 fiber 节点，首先调用 `beginWork` 协调子节点，如果 `beginWork` 返回 `null`，说明当前 fiber 节点已经没有子节点，工作可以完成了，调用 `completeUnitOfWork` 完成工作。

```js
function performUnitOfWork(unitOfWork) {
  let current = unitOfWork.alternate;
  const next = beginWork(current, unitOfWork, subtreeRenderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}
```

#### 4.3 beginWork

`beginWork` 函数自身就是一个简单的基于 `fiber.tag` 的 switch 语句，这个阶段的逻辑主要在各个分支函数中。`beginWork` 最主要的工作：

- 协调。根据最新的 react element 子元素和旧的 fiber 子节点 对比，生成新的 fiber 子节点，即 DOM DIFF。
- 标记副作用。在协调子元素的过程中，会根据子元素是否增删改，从而将新的 newFiber 子节点的 flags 更新为对应的值。
- 返回新的子 fiber 节点作为下一个工作的 fiber 节点

```js
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case IndeterminateComponent:
      // 函数组件在第一次渲染时会走 IndeterminateComponent 分支
      return mountIndeterminateComponent(current, workInProgress);
    case FunctionComponent:
      // 函数组件在更新阶段会走FunctionComponent分支
      return updateFunctionComponent(current, workInProgress);
    case ClassComponent: {
      return updateClassComponent(current, workInProgress);
    }
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostText:
      return updateHostText(current, workInProgress);
  }
}
```

##### 4.3.1 HostRootFiber beginWork：updateHostRoot

`updateHostRoot` 函数执行完，由于 HostRootFiber 没有副作用，因此 HostRootFiber.flags 依然是 0

```js
function updateHostRoot(current, workInProgress, renderLanes) {
  cloneUpdateQueue(current, workInProgress);
  processUpdateQueue(workInProgress, nextProps, null, renderLanes);
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```

##### 4.3.2 类组件 beginWork： updateClassComponent

类组件的更新分为初次渲染以及更新两种情况。

- 初次渲染。逻辑主要在 `constructClassInstance` 以及 `mountClassInstance` 两个函数中
  - constructClassInstance 方法主要逻辑：
    - 初始化类组件实例 instance = new ctor(props, context)。
    - 初始化实例的 updater：instance.updater = classComponentUpdater，这是类组件 `this.setState` 方法的更新器
    - 关联 fiber 和实例：workInprogress.stateNode = instance。instance.\_reactInternals = workInprogress。这个关联很有必要，比如当我们点击按钮时，能够通过 `instance._reactInternals` 找到当前的 `fiber` 节点，并开始调度更新。
  - mountClassInstance 方法主要逻辑：
    - initializeUpdateQueue 初始化更新队列 updateQueue
    - 调用 processUpdateQueue 计算更新队列，获取最新的 state
    - 根据最新的 state 调用 `getDerivedStateFromProps` 静态生命周期方法
    - 调用 `componentWillMount` 生命周期方法
    - 如果类组件实现了 componentDidMount 生命周期方法，则更新 flags： workInProgress.flags |= Update
- 更新阶段。逻辑主要在 `updateClassInstance` 函数中，按顺序执行以下操作：
  - 调用 componentWillReceiveProps 生命周期方法
  - processUpdateQueue 计算更新队列，获取最新的 state
  - 根据最新的 state 调用 getDerivedStateFromProps 静态生命周期方法
  - 调用 shouldComponentUpdate 生命周期方法
  - 调用 componentWillUpdate 生命周期方法
  - 如果组件实例实现了 componentDidUpdate 或者 getSnapshotBeforeUpdate，则说明这个 fiber 节点有副作用，更新 fiber.flags

最后，调用 `finishClassComponent` 开始协调子元素

```js
function updateClassComponent(current, workInProgress, Component) {
  const instance = workInProgress.stateNode;
  // instance为null，说明是初次渲染
  if (instance === null) {
    // 初始化类组件实例 instance。
    // 初始化实例的 updater：instance.updater = classComponentUpdater，这是类组件 `this.setState` 方法的更新器
    // 关联 fiber 和实例：workInprogress.stateNode = instance。instances._reactInternals = workInprogress
    constructClassInstance(workInProgress, Component, nextProps);
    // initializeUpdateQueue 初始化更新队列 updateQueue
    // processUpdateQueue 计算更新队列，获取最新的 state
    // 根据最新的 state 调用 getDerivedStateFromProps 静态生命周期方法
    // 调用 componentWillMount 生命周期方法
    // 如果类组件实现了 componentDidMount 生命周期方法，则更新 flags： workInProgress.flags |= Update
    mountClassInstance(workInProgress, Component, nextProps);
  } else if (current === null) {
  } else {
    // 更新阶段
    shouldUpdate = updateClassInstance(current, workInProgress, Component);
  }
  return finishClassComponent(current, workInProgress, Component);
}
function finishClassComponent(current, workInProgress, Component) {
  nextChildren = instance.render();
  workInProgress.flags |= PerformedWork;
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  workInProgress.memoizedState = instance.state;
  return workInProgress.child;
}
```

##### 4.3.3 函数组件 beginWork：mountIndeterminateComponent & updateFunctionComponent

函数组件在第一次渲染时，会走 `IndeterminateComponent` 分支，执行 `mountIndeterminateComponent` 方法

当执行完成 `renderWithHooks` 方法后，此时 fiber 类型已经确定，因此需要修改 `workInProgress.tag`

```js
function mountIndeterminateComponent(_current, workInProgress) {
  const props = workInProgress.pendingProps;
  const nextChildren = renderWithHooks(current, workInProgress, Component);

  workInProgress.flags |= PerformedWork; // PerformedWork对应的值为1

  workInProgress.tag = FunctionComponent;

  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```

函数组件在更新阶段，会走 `FunctionComponent` 分支，执行 `updateFunctionComponent` 方法。

```js
function updateFunctionComponent(current, workInProgress, Component) {
  const newChildren = renderWithHooks(current, workInProgress, Component);
  reconcileChildren(null, workInProgress, newChildren);
  return workInProgress.child;
}
```

不管是初次渲染还是更新阶段，都会走 `renderWithHooks` 方法，这是函数组件执行的主要逻辑。React 提供了各种 hook 给我们在函数组件中使用，但是这些 hook 在初次渲染和更新阶段的行为又有点不同，为了屏蔽这些行为，React 在 `renderWithHooks` 中会判断，如果是初次渲染，则使用 `HooksDispatcherOnMount`，如果是更新阶段，则使用 `HooksDispatcherOnUpdate`。`HooksDispatcherOnMount` 和 `HooksDispatcherOnUpdate` 提供的 API 一模一样，只是实现有细微差别。

```js
function renderWithHooks(current, workInProgress, Component) {
  currentlyRenderingFiber = workInProgress;
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate;
  const children = Component(props, secondArg); // 调用函数组件
  currentlyRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null;
  return children;
}
```

##### 4.3.4 原生的 HTML 标签 beginWork：updateHostComponent

调用 `shouldSetTextContent` 判断是否需要为新的 react element 子节点创建 fiber 节点。如果新的 react element，即 nextChildren 是一个字符串或者数字，则说明 nextChildren 不需要创建 fiber 节点。比如：

```js
// 对于 div 这个fiber节点，由于它只有一个新的子元素，并且是一个字符串，因此不需要为这个 div fiber节点创建新的fiber节点
<div>只有一个子元素并且是字符串或者数字</div>
```

如果是多节点的情况，比如：

```jsx
// 假设此时的 count 为数字0，那么对于 div 这个fiber节点，在 reconcile 阶段，会认为它有两个新的子节点：
// 一个是 "接收父组件的props："，一个是 0。React 会为这两个文本节点创建对应的 fiber 节点，fiber.tag 都是
// HostText
<div>接收父组件的props：{props.count}</div>
```

```js
function updateHostComponent(current, workInProgress, renderLanes) {
  const type = workInProgress.type; // 原生的html标签，如 button
  const nextProps = workInProgress.pendingProps;
  let nextChildren = nextProps.children;
  // 对于原生的html标签，如果只有一个子节点，并且这个子节点是一个字符串或者数字的话，则
  // 不会对此子节点创建fiber
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    nextChildren = null;
  }
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}
```

##### 4.3.5 HostText 文本节点 beginWork：updateHostText

`HostText` 节点在 `beginWork` 阶段几乎不做任何处理，因此这个节点可以直接完成了。

```js
function updateHostText() {
  return null;
}
```

#### 4.4 completeUnitOfWork

当一个 fiber 节点没有子节点，或者子节点仅仅是单一的字符串或者数字时，说明这个 fiber 节点当前的 `beginWork` 已经完成，可以进入 `completeUnitOfWork` 完成工作。

`completeUnitOfWork` 主要工作如下：

- 调用 `completeWork`。创建真实的 DOM 节点，属性赋值等。
- 构建副作用链表。
- 如果有兄弟节点，则返回兄弟节点，兄弟节点执行 beginWork。否则继续完成父节点的工作。

```js
function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    let next;
    // 完成此fiber对应的真实DOM节点创建和属性赋值的功能
    next = completeWork(current, completedWork, subtreeRenderLanes);
    // 开始构建副作用列表。
    if (returnFiber !== null) {
      if (returnFiber.firstEffect === null) {
        returnFiber.firstEffect = completedWork.firstEffect;
      }
      if (completedWork.lastEffect !== null) {
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
        }
        returnFiber.lastEffect = completedWork.lastEffect;
      }
      const flags = completedWork.flags;

      if (flags > PerformedWork) {
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = completedWork;
        } else {
          returnFiber.firstEffect = completedWork;
        }

        returnFiber.lastEffect = completedWork;
      }
    }
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      // If there is more work to do in this returnFiber, do that next.
      workInProgress = siblingFiber;
      return;
    }

    completedWork = returnFiber;

    workInProgress = completedWork;
  } while (completedWork !== null);
}
```

`completeWork` 函数也是一个基于 `fiber.tag` 的 switch 语句

可以看出，对于函数组件和类组件，`completeWork` 几乎没有工作。主要的工作集中在 `HostRoot`、`HostComponent`、`HostText`

```js
export function completeWork(current, workInProgress, renderLanes) {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case FunctionComponent:
      return null;
    case ClassComponent:
      return null;
    case HostRoot:
      const fiberRoot = workInProgress.stateNode;
      if (current === null || current.child === null) {
        // 添加一个副作用，在下次commit开始前清空容器？？？
        workInProgress.flags |= Snapshot;
      }
      updateHostContainer(workInProgress); // 空函数
      return null;
    case HostComponent:
      const type = workInProgress.type;
      if (current && workInProgress.stateNode) {
        updateHostComponent(current, workInProgress);
      } else {
        // 第一次渲染，创建真实的DOM节点
        const instance = createInstance(type, newProps, workInProgress);
        // 将子元素对应的dom节点添加到instance中，即instance.appendChild(chid)
        appendAllChildren(instance, workInProgress, false, false);
        workInProgress.stateNode = instance;
        // 给真实dom实例添加属性，比如style等
        finalizeInitialChildren(instance, type, newProps);
      }
      return null;
    case HostText:
      const newText = newProps;
      if (current && workInProgress.stateNode != null) {
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        workInProgress.stateNode = createTextInstance(newText, workInProgress);
      }
      return null;
  }
}
```

##### 4.4.1 原生的 HTML 标签渲染 completeUnitOfWork

对于 `HostComponent`，则需要区分第一次渲染以及更新阶段。注意这里的第一次渲染是指这个 DOM 元素第一次渲染。而不是我们的页面第一次渲染。

`HostComponent` 第一次渲染

- 创建真实的 DOM 元素。并将 fiber 节点挂载到 DOM 上的 `__reactFiber$uqibbgdk1tp` 属性， 同时将 newProps 挂载到 DOM 上的 `__reactProps$uqibbgdk1tp` 属性。所以我们可以看到，浏览器上的每个 DOM 都会有至少两个自定义的属性：`__reactProps$uqibbgdk1tp` 和 `__reactFiber$uqibbgdk1tp`。这两个属性名称 `$` 后面的是一串随机字符串
- 在 `appendAllChildren` 中，调用 `parent.appendChild(child)` 将 fiber 的 child(对应的真实 dom) 添加到当前的 DOM 上。
- 在 `finalizeInitialChildren` 方法中，给真实的 DOM 设置属性，比如 style，id 等。

这里有一点需要注意，`appendAllChildren` 要区分两个场景：单一节点以及多节点。

我们知道在 `beginWork：updateHostComponent` 中，如果 `HostComponent` 只有一个新的子节点并且是字符串或者数字，那么则不会为新的子节点创建对应的 fiber 节点，比如：

```js
// 单一节点情况，div只有一个新的子节点，并且是字符串，因此在 beginWork 阶段不会为这个新的子节点创建对应的 fiber 节点，从而不会走appendAllChildren的逻辑。而是在finalizeInitialChildren函数中设置 div 的textContent
<div>只有一个子元素并且是字符串或者数字</div>
```

```jsx
// 多节点情况。假设此时的 count 为数字0，那么对于 div 这个fiber节点，在 reconcile 阶段，会认为它有两个新的子节点：
// 一个是 "接收父组件的props："，一个是 0。React 会为这两个文本节点创建对应的 fiber 节点，fiber.tag 都是
// HostText。然后在 completeUnitOfWork 阶段，针对 HostText 类型的fiber节点，React会调用 document.createTextNode(text) 创建文本DOM节点。在 div 的 completeUnitOfWork 中，就会走 appendAllChildren 的逻辑，将这些文本DOM添加到div中。
<div>接收父组件的props：{props.count}</div>
```

`HostComponent` 第一次渲染的逻辑主要集中在 `createInstance`、`appendAllChildren`、`finalizeInitialChildren` 三个函数中。从这个过程也可以看出，是有对真实的 dom 进行操作的。

`HostComponent` 更新阶段，主要逻辑在 `updateHostComponent` 函数中：

- 调用 `prepareUpdate` 比较 oldProps 和 newProps 的差异。如果属性发生了变更，则将变更的属性的键值对存入数组 `updatePayload` 中。
- 将 `updatePayload` 复制给 workInProgress.updateQueue
- 这里有一个特殊场景，如果只是合成事件变了，比如 `onClick` 变了，其他属性没有变化，React 在 `diffProperties` 时会特意将 `updatePayload` 赋值一个空数组。方便在 commit 阶段重新挂载 `__reactProps$` 属性

##### 4.4.2 HostText completeUnitOfWork

类似于 `HostComponent`，`HostText` 也需要区分第一次渲染以及更新阶段。

在第一次渲染阶段，只需要直接调用 `document.createTextNode(text)` 创建文本 DOM 节点，初次之外没有其他操作。

在更新阶段，判断是否需要更新 fiber.flags，除此之外没有其他操作。

##### 4.4.3 HostRoot completeUnitOfWork

`updateHostContainer` 方法其实就是一个空函数，`HostRoot` 在这个过程几乎没有操作。当执行到这里的时候，`render` 阶段已经完成，进入 `commit` 阶段。

**注意，在初次渲染的过程中，React 不需要追踪副作用，同时在 render 阶段就操作真实的 DOM！！！！！！。当 `HostRoot` 的 `completeUnitOfWork` 执行完成时，我们实际上已经得到一棵真实的 DOM 树，存储在内存中，还没挂载到容器 root 上**

### 五、commit 阶段

`render` 阶段完成后，我们得到一个副作用链表，以及一棵 finishedWork 树。

`commit` 阶段从 `commitRoot` 函数开始。主要逻辑在 `commitRootImpl` 函数中

#### 5.1 commitRootImpl

commit 阶段分成三个子阶段：

- 第一阶段：commitBeforeMutationEffects。DOM 变更前
  - 调用 类组件的 getSnapshotBeforeUpdate 生命周期方法
  - 启动一个微任务以刷新 passive effects 异步队列。passive effects 异步队列存的是 useEffect 的清除函数以及监听函数
- 第二阶段：commitMutationEffects。DOM 变更，操作真实的 DOM 节点。注意这个阶段是 `卸载` 相关的生命周期方法执行时机

  - 操作真实的 DOM 节点：增删改查
  - 同步调用函数组件 `useLayoutEffect` 的 `清除函数`
  - 同步调用类组件的 `componentWillUnmount` 生命周期方法
  - 将函数组件的 `useEffect` 的 `清除函数` 添加进异步队列，异步执行。
  - **所有的函数组件的 useLayoutEffect 的清除函数都在这个阶段执行完成**

- 第三阶段：commitLayoutEffects。DOM 变更后
  - 调用函数组件的 `useLayoutEffect` 监听函数，同步执行
  - 将函数组件的 `useEffect` 监听函数放入异步队列，异步执行
  - 执行类组件的 `componentDidMount` 生命周期方法，同步执行
  - 执行类组件的 `componentDidUpdate` 生命周期方法，同步执行
  - 执行类组件 `this.setState(arg, callback)` 中的 `callback` 回调，同步执行

每一个子阶段都是一个 while 循环，**从头开始**遍历副作用链表。

```js
function commitRootImpl(root, renderPriorityLevel) {
  const finishedWork = root.finishedWork;
  root.finishedWork = null;
  let firstEffect;
  // 在开始前，需要将 HostRootFiber 的副作用追加在副作用链表末尾。
  if (finishedWork.flags > PerformedWork) {
    if (finishedWork.lastEffect !== null) {
      finishedWork.lastEffect.nextEffect = finishedWork;
      firstEffect = finishedWork.firstEffect;
    } else {
      firstEffect = finishedWork;
    }
  } else {
    firstEffect = finishedWork.firstEffect;
  }
  // firstEffect不为空，说明存在副作用链表，此时firstEffect指向链表的表头
  if (firstEffect !== null) {
    // commie阶段被划分成多个小阶段。每个阶段都从头开始遍历整个副作用链表
    nextEffect = firstEffect;
    // 第一个阶段，调用getSnapshotBeforeUpdate等生命周期方法
    commitBeforeMutationEffects();
    nextEffect = firstEffect; // 重置 nextEffect，从头开始
    commitMutationEffects(root, renderPriorityLevel);
    root.current = finishedWork;
    nextEffect = firstEffect; // 重置 nextEffect，从头开始
    commitLayoutEffects(root, lanes);
  }
}
```

#### 5.2 commitBeforeMutationEffects

这个函数主要是在 DOM 变更前执行，主要逻辑如下：

- 调用 类组件的 getSnapshotBeforeUpdate 生命周期方法
- 启动一个微任务以刷新 passive effects。passive effects 指的是 useEffect 的清除函数以及监听函数

```js
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    const current = nextEffect.alternate;
    const flags = nextEffect.flags;
    if ((flags & Snapshot) !== NoFlags) {
      commitBeforeMutationLifeCycles(current, nextEffect);
    }
    if ((flags & Passive) !== NoFlags) {
      setTimeout(() => {
        flushPassiveEffects();
      }, 0);
    }
    nextEffect = nextEffect.nextEffect;
  }
}
function commitBeforeMutationLifeCycles(current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      return;
    }
    case ClassComponent: {
      instance.getSnapshotBeforeUpdate(prevProps, prevState);
      return;
    }
    case HostRoot:
      if (finishedWork.flags & Snapshot) {
        var root = finishedWork.stateNode;
        clearContainer(root.containerInfo); // 页面第一次渲染时，清空root的textContent：root.textContent = '';
      }
      return;
    case HostComponent:
    case HostText:
      return;
  }
}
```

#### 5.3 commitMutationEffects

这个函数操作 DOM，主要有三个方法：

- commitPlacement。调用 `parentNode.appendChild(child);` 或者 `container.insertBefore(child, beforeChild)` 插入 DOM 节点
- commitWork。
  - 对于 HostText 节点，直接更新 nodeValue
  - 对于类组件，什么都不做
  - 同步调用函数组件 `useLayoutEffect` 的`清除函数`，这个函数对于类组件没有任何操作
- commitDeletion。主要是删除 DOM 节点，以及调用当前节点以及子节点所有的 `卸载` 相关的生命周期方法
  - 同步调用函数组件的 `useLayoutEffect` 的 `清除函数`，这是同步执行的
  - 将函数组件的 `useEffect` 的 `清除函数` 添加进异步刷新队列，这是异步执行的
  - 同步调用类组件的 `componentWillUnmount` 生命周期方法

```js
function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    // 插入，更新，删除 DOM 节点
    switch (primaryFlags) {
      case PlacementAndUpdate: {
        // 插入
        commitPlacement(nextEffect);
        commitWork(_current, nextEffect);
        break;
      }
      case Deletion: {
        // 删除
        commitDeletion(root, nextEffect);
        break;
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
function commitPlacement(finishedWork) {
  if (isContainer) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
  } else {
    insertOrAppendPlacementNode(finishedWork, before, parent);
  }
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  if (before) {
    insertInContainerBefore(parent, stateNode, before);
  } else {
    appendChildToContainer(parent, stateNode);
  }
}
function commitWork(current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      // 调用函数组件的清除函数
      commitHookEffectListUnmount(Layout | HasEffect, finishedWork);
      return;
    }
    case ClassComponent:
      // 可以看到 类组件 在这里是不执行任何操作的
      return;
  }
}
// 执行函数组件的 useLayoutEffect 监听函数的回调，即清除函数
function commitHookEffectListUnmount(tag, finishedWork) {
  do {
    // Unmount
    var destroy = effect.destroy;
    effect.destroy = undefined;
    destroy(); // 执行 useLayoutEffect 的清除函数
    effect = effect.next;
  } while (effect !== firstEffect);
}
function commitDeletion(finishedRoot, current, renderPriorityLevel) {
  // 调用所有子节点的 componentWillUnmount() 方法
  unmountHostComponents(finishedRoot, current);
}
function unmountHostComponents(finishedRoot, current, renderPriorityLevel) {
  while (true) {
    commitUnmount(finishedRoot, node);
  }
}
function commitUnmount(finishedRoot, current, renderPriorityLevel) {
  switch (current.tag) {
    case FunctionComponent: {
      do {
        if (effect 是 useEffect) {
          // 将 useEffect 的清除函数添加进异步刷新队列，useEffect 的清除函数是异步执行的
          enqueuePendingPassiveHookEffectUnmount(current, effect);
        } else {
          // 调用 useLayoutEffect 的清除函数，同步执行的
          // 其实就是直接调用destroy();
          safelyCallDestroy(current, destroy);
        }
        effect = effect.next;
      } while (effect !== firstEffect);
      return;
    }
    case ClassComponent: {
      // 直接调用类组件的 componentWillUnmount() 生命周期方法，同步执行
      safelyCallComponentWillUnmount(current, instance);
      return;
    }
  }
}
```

#### 5.4 commitLayoutEffects

当执行到这个函数，此时 `useLayoutEffect` 的清除函数已经全部执行完成。

- 对于 HostComponent。判断是否需要聚焦
- 对于 HostText。什么都不做。
- 对于类组件。
  - 执行类组件的 `componentDidMount` 生命周期方法，同步执行
  - 执行类组件的 `componentDidUpdate` 生命周期方法，同步执行
  - 执行类组件 `this.setState(arg, callback)` 中的 `callback` 回调，同步执行
- 调用函数组件的 `useLayoutEffect` 监听函数，同步执行
- 将函数组件的 `useEffect` 监听函数放入异步队列，异步执行

```js
function commitLayoutEffects(root, committedLanes) {
  // 此时所有的 `useLayoutEffect` 的清除函数已经执行完成，在commitMutationEffects阶段执行的
  while (nextEffect !== null) {
    commitLifeCycles(root, current, nextEffect);
    nextEffect = nextEffect.nextEffect;
  }
}
function commitLifeCycles(finishedRoot, current, finishedWork, committedLanes) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      // 同步执行 useLayoutEffect 的监听函数
      commitHookEffectListMount(Layout | HasEffect, finishedWork);
      // 将 useEffect 的监听函数放入异步队列等待执行
      schedulePassiveEffects(finishedWork);
      return;
    }
    case ClassComponent: {
      // 第一次挂载的时候执行类组件的componentDidMount生命周期方法
      instance.componentDidMount();
      // 组件更新的时候执行类组件的 componentDidUpdate 生命周期方法
      instance.componentDidUpdate(prevProps, prevState, snapshotBeforeUpdate);
      // 调用类组件 this.setState(arg, callback) 的callback回调
      commitUpdateQueue(finishedWork, updateQueue, instance);
      return;
    }
  }
}

// 执行useLayoutEffect监听函数
function commitHookEffectListMount(tag, finishedWork) {
  do {
    if ((effect.tag & tag) === tag) {
      // Mount
      var create = effect.create;
      effect.destroy = create();
    }
    effect = effect.next;
  } while (effect !== firstEffect);
}
```
