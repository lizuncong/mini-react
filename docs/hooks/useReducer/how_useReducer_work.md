### 示例代码

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

### 环状链表

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

### 什么是 hook 链表

假设我们有下面这段代码，`React` 每次执行到 `hook` 函数时，都会构造一个 `hook` 对象，并连接成一个链表

```js
const [count, setCount] = useReducer(reducer, 0); // 构造一个hook对象 hook1 = { memoizedState: 0, next: hook2 }
const [count2, setCount2] = useReducer(reducer, 1000); // 构造一个hook对象 hook2 = { memoizedState: 1000, hook3 }
useEffect(() => {
  // 构造一个hook对象，hook3 = { memoizedState: { create: callback }, next: null}
  console.log("useEffect");
}, []);
```

在 `hook` 对象中，`hook.memoizedState` 属性用于保存当前状态，比如 `hook1.memoizedState` 对应的就是 `count`。`hook1.next` 指向 `hook2`。`hook1.queue`保存的是调用 `setCount` 后的更新队列。

**_注意！！！函数组件中，组件对应的 fiber 节点也有一个 memoizedState 属性，fiber.memoizedState 用于保存组件的 hook 链表_**

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-02.jpg)

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-01.jpg)

#### 如何查看真实的 hook 链表？

这里有两种方法，一种是通过容器节点`root`，一种是在源码中打断点

通过容器节点 `root` 查找对应的 `fiber` 节点
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-03.jpg)

另一种方法是在源码中打断点，这个需要了解源码。在`react-dom.development.js`中搜索`renderWithHooks`方法，在 `var children = Component(props, secondArg)` 处打一个断点，然后在它下面一行再打一个断点，等 `Component(props, secondArg)` 函数执行完成，则 `hook` 链表构造完成，此时可以在控制台打印`console.log(workInProgress)`即可看到当前 `fiber` 节点的信息

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-04.jpg)

### 流程

- 初次挂载，即第一次执行
- 点击按钮触发 setState 执行，构造 updateQueue 链表
- 更新流程

- performUnitOfWork。fiber 节点开始工作的入口。
- performUnitOfWork 调用 beginWork
- beginWork 里面会根据 workInProgress.tag 判断应该是调用 mountIndeterminateComponent 还是 updateFunctionComponent。这两个方法里面都会调用 renderWithHooks 方法以及 reconcileChildren 方法

- renderWithHooks 方法是组件执行逻辑的关键，这个方法的逻辑如下：

  - 三件关键的准备工作：
    - 将全局的 currentlyRenderingFiber 指针指向当前工作的 fiber 节点：currentlyRenderingFiber = workInProgress
    - 重置 fiber 的 hook 链表：currentlyRenderingFiber.memoizedState = null;
    - 设置 ReactCurrentDispatcher.current = current === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate。这个对象里面包含了 React 提供的所有 hook。当我们在组件中调用 useReducer 时，实际上就是通过这个对象调用的。
  - 调用组件方法 children = Component(props, secondArg)，实际上就是执行的我们的函数组件。hook 的逻辑就从这里开始。初次挂载组件和更新组件逻辑不一样，初次挂载组件时，需要为组件对应的 fiber 节点初始化 hook 链表
    - mountState(initialState)。如果是初次挂载，则调用 mountState
      - 调用 mountWorkInProgressHook 初始化 hook 链表以及 hook 指针。 currentlyRenderingFiber.memoizedState = workInProgressHook = hook = { memoizedState: null, baseState: null,baseQueue: null, queue: null, next: null }。注意，hook 中也有一个 memoizedState，这个 hook.memoizedState 是 hook 的 state 值，即 const [count, setCount] = useState(0)中的 count.memoizedState 指向的却是函数组件的 hook 链表的第一个 hook 节点。hook.next 指向下一个 hook。
    - 初始化 hook.queue，这就是 hook 更新队列，即多次调用 setCount，会往队列里添加更新。hook.queue = {pending: null, dispatch: null,lastRenderedReducer: basicStateReducer,lastRenderedState: initialState};
  - 函数组件执行完成。重置指针 currentlyRenderingFiber = null;currentHook = null;workInProgressHook = null;
  - 将函数组件执行结果，即 children 返回

- updateFunctionComponent。调用 renderWithHooks 方法，然后调用 updateState 方法走更新的逻辑，updateState 调用 updateReducer，实际上 updateReducer 是更新阶段 useState hook 的主要逻辑
  - updateWorkInProgressHook。需要注意，在根据 react element 节点创建新的 fiber 节点时，此时的 fiber 节点复用了旧的 fiber 节点的 hook 链表。但是在 renderWithHooks 方法中，新的 fiber 节点的 workInProgress.memoizedState = null 被重置为 null。然后在 updateWorkInProgressHook 重新生成 hook 链表。因此不管是初次挂载阶段还是更新阶段，都要重新生成 hook 链表
