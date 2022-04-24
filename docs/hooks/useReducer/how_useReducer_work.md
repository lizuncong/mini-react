### 前言

阅读完本章，可以收获下面几点知识

- 认识什么是更新队列，什么是 hook 链表
- 如何查看 fiber 节点中真实的 hook 链表
- hook 的主流程以及源码剖析

建议在阅读主流程源码时，在主流程函数各个入口打个断点，走一遍主流程的源码会更有感觉

本章节所有案例都基于以下示例代码：

```jsx
import React, { useReducer, useEffect, useState } from "react";
import { render } from "react-dom";

function reducer(state, action) {
  return state + 1;
}

const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0);
  return (
    <div
      onClick={() => {
        debugger;
        setCount(1);
        setCount(2);
      }}
    >
      {count}
    </div>
  );
};

render(<Counter />, document.getElementById("root"));
```

### 第一节 环状链表

`React` 使用环状链表保存更新队列 `queue={ pending: null }`，其中 `pending` 永远指向最后一个更新。比如多次调用 `setState` 时：

```js
const [count, setCount] = useReducer(reducer, 0);
setCount(1); // 生成一个更新对象：update1 = { action: 1, next: update1 }
setCount(2); // 生成一个更新对象：update2 = { action: 2, next: update1 }
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/queue-01.jpg)

`fiber` 中存储的 `queue` 队列如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/queue-02.jpg)

环状链表简单实现如下，这个可以动手写一下，找找感觉

```js
const queue = { pending: null }; // queue.pending永远指向最后一个更新

function dispatchAction(action) {
  const update = { action, next: null };
  const pending = queue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;
}

// 队列
dispatchAction(1);
dispatchAction(2);
```

### 第二节 什么是 hook 链表

假设我们有下面这段代码，`React` 每次执行到 `hook` 函数时，都会构造一个 `hook` 对象，并连接成一个链表

```js
const [count, setCount] = useReducer(reducer, 0); // 构造一个hook对象 hook1 = { memoizedState: 0, queue: { pending: null }, next: hook2 }
const [count2, setCount2] = useReducer(reducer, 1000); // 构造一个hook对象 hook2 = { memoizedState: 1000, queue: { pending: null }, next: hook3 }
useEffect(() => {
  // 构造一个hook对象，hook3 = { memoizedState: { create: callback }, next: null}
  console.log("useEffect");
}, []);
```

在 `hook` 对象中，`hook.memoizedState` 属性用于保存当前状态，比如 `hook1.memoizedState` 对应的就是 `count`。`hook1.next` 指向 `hook2`。`hook1.queue`保存的是调用 `setCount` 后的更新队列。

每个 `hook` 都会维护自己的更新队列 `queue`

**_注意！！！函数组件中，组件对应的 fiber 节点也有一个 memoizedState 属性，fiber.memoizedState 用于保存组件的 hook 链表_**

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-02.jpg)

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-01.jpg)

#### 如何查看真实的 hook 链表？

这里有两种方法，一种是通过容器节点`root`，一种是在源码中打断点

通过容器节点 `root` 查找对应的 `fiber` 节点
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-03.jpg)

另一种方法是在源码中打断点，这个需要了解源码。在`react-dom.development.js`中搜索`renderWithHooks`方法，在 `var children = Component(props, secondArg)` 处打一个断点，然后在它下面一行再打一个断点，等 `Component(props, secondArg)` 函数执行完成，则 `hook` 链表构造完成，此时可以在控制台打印`console.log(workInProgress)`即可看到当前 `fiber` 节点的信息

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-04.jpg)

### 第三节 hook 源码流程

经过前面两小节的铺垫，我们对 `hook.queue` 以及 `hook` 有了初步印象。本节开始介绍 `hook` 源码主流程。

`React` 对于初次挂载阶段和更新阶段，`hook` 的流程处理不同。因此这里我分为三个阶段来介绍：

- 初次挂载阶段。即函数组件第一次执行。
- 触发更新阶段。比如点击按钮触发 `setState` 执行，这个阶段就是构造 `hook` 更新队列 `queue` 的阶段
- 更新阶段。即函数组件第二次或者第 n 次执行。

`React` 内部通过提供各个阶段的 `HooksDispatcher` 对象，抹平了 API 差异。比如 当我们调用 `useReducer(reducer, 0)` 时，我们不需要关心函数组件是第一次执行还是第 n 次执行。

`React` 源码内部维护一个全局变量 `ReactCurrentDispatcher`。在调用函数组件前，`React`会判断如果是第一次执行组件，即挂载阶段，则将
`ReactCurrentDispatcher` 变量设置为 `HooksDispatcherOnMount`，如果是更新阶段，则设置为 `HooksDispatcherOnUpdate`。这样当我们调用 `useReducer(reducer, 0)`时，实际上调用的是 `HooksDispatcherOnMount.useReducer` 或者 `HooksDispatcherOnUpdate.useReducer`

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-05.jpg)

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-06.jpg)

#### 初次挂载阶段

这个阶段，函数组件第一次执行。这个阶段源码主流程图如下，建议在流程图中每个函数的入口处各打一个断点，并根据流程图走一遍 `React` 源码流程。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-07.jpg)

在整个流程中，最关键的是 `renderWithHooks` 方法，**不管是初次挂载阶段还是更新阶段，都会走这个方法！！！**。该方法最最最主要做了以下几件事情：

- 将全局的 `currentlyRenderingFiber` 变量指向当前工作的 `fiber` 节点。
- 重置 `fiber` 的 `hook` 链表为 `null`。`workInProgress.memoizedState = null`。更新阶段一样会重置 `hook` 链表并重新生成
- 设置 ReactCurrentDispatcher。如果是初次挂载阶段，则设置为 `HooksDispatcherOnMount`，更新阶段则设置为 `HooksDispatcherOnUpdate`。以此决定是调用 `mountReducer` 还是 `updateReducer`
- 调用我们的函数组件 `Counter`，并将结果 `children` 返回。并重置 `currentlyRenderingFiber`、`currentHook`、`workInProgressHook` 为 `null`

`mountWorkInProgressHook` 方法主要就是构造 `hook` 链表

#### 触发更新阶段

```jsx
const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0);
  return (
    <div
      onClick={() => {
        debugger;
        setCount(1);
        setCount(2);
      }}
    >
      {count}
    </div>
  );
};
```

当我们点击按钮时，调用 `setCount` 方法，实际上调用的是 `dispatchAction` 方法，主要逻辑如下：

- 构造更新队列。生成一个更新对象 `update`，并加入 `hook` 的更新队列 `queue`
- 计算新的状态值并缓存起来。通过 `update.eagerState` 缓存，这是 `React` 的一种优化手段，当我们多次调用 `setCount(2)`，传的是相同的值时，`React` 不会再触发更新。
- 如果判断 `update.eagerState` 和上一次的 `currentState` 相同，则不触发更新。否则调用 `scheduleUpdateOnFiber` 触发更新

#### 更新阶段

这个阶段，函数组件第 2 次执行或者第 n(n > 2)次执行，这个阶段也是从 `performUnitOfWork` 开始。主流程如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-08.jpg)

### 第四节 hook 主流程源码实现

ReactFiberBeginWork.js

```js
import {
  IndeterminateComponent,
  FunctionComponent,
  HostComponent,
} from "./ReactWorkTags";
import { renderWithHooks } from "./ReactFiberHooks";
export function beginWork(current, workInProgress) {
  if (current) {
    switch (workInProgress.tag) {
      case FunctionComponent:
        return updateFunctionComponent(
          current,
          workInProgress,
          workInProgress.type
        );
      default:
        break;
    }
  } else {
    switch (workInProgress.tag) {
      case IndeterminateComponent:
        return mountIndeterminateComponent(
          current,
          workInProgress,
          workInProgress.type
        );
      default:
        break;
    }
  }
}

function updateFunctionComponent(current, workInProgress, Component) {
  const newChildren = renderWithHooks(current, workInProgress, Component);
  reconcileChildren(null, workInProgress, newChildren);
  return workInProgress.child;
}

function mountIndeterminateComponent(current, workInProgress, Component) {
  const children = renderWithHooks(current, workInProgress, Component);
  workInProgress.tag = FunctionComponent; // 初次渲染后，此时组件类型已经明确，因此需要修改tag
  reconcileChildren(null, workInProgress, children);
  return workInProgress.child; // null
}
```

ReactFiberHooks.js，最主要的逻辑都在这个文件里面

```js
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
const ReactCurrentDispatcher = {
  current: null,
};
let workInProgressHook = null; // 当前工作中的新的hook指针
let currentHook = null; // 当前的旧的hook指针
let currentlyRenderingFiber; // 当前正在工作的fiber
const HooksDispatcherOnMount = {
  useReducer: mountReducer,
};
const HooksDispatcherOnUpdate = {
  useReducer: updateReducer,
};

function updateReducer(reducer, initialState) {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue; // 更新队列
  const lastRenderedReducer = queue.lastRenderedReducer; // 上一次reducer方法

  const current = currentHook;
  const pendingQueue = queue.pending;
  if (pendingQueue !== null) {
    // 根据旧的状态和更新队列里的更新对象计算新的状态
    const first = pendingQueue.next; // 第一个更新对象
    let newState = current.memoizedState; // 旧的状态
    let update = first;
    do {
      const action = update.action;
      newState = reducer(newState, action);
      update = update.next;
    } while (update !== null && update !== first);
    queue.pending = null; // 更新完成，清空链表
    hook.memoizedState = newState; // 让新的hook对象的memoizedState等于计算的新状态
    queue.lastRenderState = newState;
  }
  const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
  return [hook.memoizedState, dispatch];
}
function updateWorkInProgressHook() {
  let nextCurrentHook;
  if (currentHook === null) {
    // 如果currentHook为null，说明这是第一个hook
    const current = currentlyRenderingFiber.alternate; // 旧的fiber节点
    nextCurrentHook = current.memoizedState; // 旧的fiber的memoizedState指向旧的hook链表的第一个节点
  } else {
    nextCurrentHook = currentHook.next;
  }

  currentHook = nextCurrentHook;

  const newHook = {
    memoizedState: currentHook.memoizedState,
    queue: currentHook.queue,
    next: null,
  };

  if (workInProgressHook === null) {
    // 说明这是第一个hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
  } else {
    workInProgressHook.next = newHook;
    workInProgressHook = workInProgressHook.next = newHook;
  }
  return workInProgressHook;
}
function mountReducer(reducer, initialState) {
  // 构建hooks单向链表
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialState;
  const queue = (hook.queue = { pending: null }); // 更新队列
  const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
  return [hook.memoizedState, dispatch];
}
function mountWorkInProgressHook() {
  const hook = {
    // 创建一个hook对象
    memoizedState: null, // 自己的状态
    queue: null, // 自己的更新队列，环形列表
    next: null, // 下一个更新
  };
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }

  return workInProgressHook;
}

// 不同的阶段useReducer有不同的实现
export function renderWithHooks(current, workInProgress, Component) {
  currentlyRenderingFiber = workInProgress;
  currentlyRenderingFiber.memoizedState = null;
  ReactCurrentDispatcher.current =
    current !== null ? HooksDispatcherOnUpdate : HooksDispatcherOnMount;
  const children = Component();
  currentlyRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null;
  return children;
}

function dispatchAction(currentlyRenderingFiber, queue, action) {
  const update = { action, next: null };
  const pending = queue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;
  const lastRenderedReducer = queue.lastRenderedReducer; // 上一次的reducer
  const lastRenderState = queue.lastRenderState; // 上一次的state
  const eagerState = lastRenderedReducer(lastRenderState, action); // 计算新的state
  // 如果新的state和旧的state相同，则跳过更新
  if (Object.is(eagerState, lastRenderState)) {
    return;
  }
  scheduleUpdateOnFiber(currentlyRenderingFiber);
}

export function useReducer(reducer, initialState) {
  return ReactCurrentDispatcher.current.useReducer(reducer, initialState);
}
```
