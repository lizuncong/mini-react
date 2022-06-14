> 本章主要介绍 `ReactDOM.render` 初次渲染以及 `setState` 手动触发更新的主流程。学习 `React` 渲染的两个阶段：`render` 和 `commit` 阶段。了解 `React` 合成事件注册时机、类组件生命周期方法、函数组件 `hook` 调用时机、reconcile(dom diff)算法等。

## 深入概述 ReactDOM.render 初次渲染 以及 setState 手动触发状态更新主流程

### 前置知识

在阅读本文时，假设你已经有一些 fiber 的基础知识。

#### 容器 root 节点

我们传递给 `ReactDOM.render(element, root)` 的第二个参数 `root`

#### fiber 类型

`fiber` 节点的类型通过 `fiber.tag` 标识，称为 `React work tag`。我们重点关注以下几个类型：

- HostRoot。容器 root 节点对应的 fiber 类型。一般来说，一个 React 应用程序只会有一个 HostRoot 类型的 fiber 节点。
- ClassComponent。类组件对应的 fiber 类型。
- FunctionComponent。函数组件对应的 fiber 类型。
- IndeterminateComponen。函数组件第一次渲染时对应的 fiber 类型
- HostComponent。原生的 HTML 标签(比如 <div>)对应的 fiber 类型

记住这几个 fiber 类型，会贯穿整篇文章。在整个 react 渲染阶段，react 基于 fiber.tag 执行不同的操作。因此你会看到大量的基于 fiber.tag 的 switch 语句。

#### 副作用

副作用通过 `fiber.flags` 标记。对于不同的 fiber 类型，副作用含义不同

- HostRoot。
- ClassComponent。类组件如果实现了 componentDidMount 等生命周期方法，则对应的 fiber 节点包含副作用
- FunctionComponent。函数组件如果调用了 useEffect、useLayoutEffect，则对应的 fiber 节点包含副作用
- HostComponent。原生的 HTML 标签如果属性，比如 style 等发生了变更，则对应的 fiber 节点包含副作用。

在 render 阶段，react 会找出有副作用的 fiber 节点，并构建单向的`副作用链表`

#### React 渲染流程

React 渲染主要分为两个阶段：`render` 阶段 和 `commit` 阶段。

##### render 阶段

`render` 阶段支持异步并发渲染，可中断。分为 beginWork 以及 completeUnitOfWork 两个子阶段：

- beginWork。
  - reconcileChildren。根据当前工作的 fiber 节点最新的 react element 子元素和旧的 fiber 子元素进行比较以决定是否复用旧的 fiber 节点，并标记 fiber 节点是否有副作用。注意这里如果是类组件或者函数组件，则需要调用类组件实例的 render 方法或者执行函数组件获取最新的 react element 子元素
- completeUnitOfWork。
  - 对于 HostComponent。比较 newProps 和 oldProps，收集发生变更的属性键值对，并存储在 fiber.updateQueue 中
  - 构建副作用链表。自底向上找出有副作用的 fiber 节点，并构建单向链表

render 阶段的结果是一个副作用链表以及一棵 finishedWork 树。

##### commit 阶段

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

### ReactDOM.render 初次渲染

初次渲染的入口。初次渲染主要逻辑在 `createRootImpl` 以及 `updateContainer` 这两个函数中，主要工作：

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

### 调度更新

#### scheduleUpdateOnFiber

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

#### performSyncWorkOnRoot

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

### render 阶段

#### renderRootSync

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

#### performUnitOfWork

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

#### beginWork

`beginWork` 就是一个简单的基于 `fiber.tag` 的 switch 语句。`beginWork` 最主要的工作：

- 协调。根据最新的 react element 子元素和旧的 fiber 子节点 对比，生成新的 fiber 子节点
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
  }
}
```

TODO：需要更新 flags 的场景：

- `processUpdateQueue` 根据 `fiber.updateQueue` 计算最新的状态 `newState`，并赋值给 `fiber.memoizedState`。在 `processUpdateQueue` 方法中，会判断 `update` 对象是否有 callback，如果有 callback，则改变 fiber.flags：

```js
workInProgress.flags |= Callback; // Callback对应的值是32
```

- HostRoot。如果新的 fiber 子节点需要插入，则更新 fiber.flags：

```js
newFiber.flags = Placement; // Placement对应的值是2
```

- ClassComponent。如果类组件实例实现了 componentDidMount 生命周期方法，则更新 flags：

```js
workInProgress.flags |= Update; // Update对应的值是4
```

同时，在 finishClassComponent 中，更新 flags：

```js
workInProgress.flags |= PerformedWork; // PerformedWork对应的值为1，提供给 React DevTools读取的
```

##### HostRootFiber：updateHostRoot

`updateHostRoot` 函数执行完，由于 HostRootFiber 没有副作用，因此 HostRootFiber.flags 依然是 0

```js
function updateHostRoot(current, workInProgress, renderLanes) {
  cloneUpdateQueue(current, workInProgress);
  processUpdateQueue(workInProgress, nextProps, null, renderLanes);
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```

##### 类组件： updateClassComponent

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
- 更新阶段。逻辑主要在 `updateClassInstance` 函数中
  - TODO

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

##### 函数组件：mountIndeterminateComponent

函数组件在第一次渲染时，会走 `IndeterminateComponent` 分支，执行 `mountIndeterminateComponent` 方法

```js
function mountIndeterminateComponent(_current, workInProgress) {
  const props = workInProgress.pendingProps;
  const context = {};
  let value;
  value = renderWithHooks(
    null,
    workInProgress,
    Component,
    props,
    context,
    renderLanes
  );

  workInProgress.flags |= PerformedWork;

  workInProgress.tag = FunctionComponent;

  reconcileChildren(null, workInProgress, value, renderLanes);
  return workInProgress.child;
}
```
