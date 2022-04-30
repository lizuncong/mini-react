> React 更新过程相关的代码都在 ReactFiberWorkLoop.js 文件中

## 批处理（异步更新）机制简述

在 `React` 源码中，通过全局变量 `executionContext` 控制 `React` 执行上下文，指示 `React` 开启同步或者异步更新。`executionContext` 一开始被初始化为 `NoContext`，因此 `React` 默认是同步更新的。

当我们在合成事件中调用 `setState` 时：

```jsx
const onBtnClick = () => {
  debugger;
  setCount(1);
  setCount(2);
};
<button onClick={onBtnClick}>{count}</button>;
```

实际上合成事件会调用 `batchedEventUpdates(onBtnClick)`，将我们的函数 `onBtnClick` 拦截一层。`batchedEventUpdates` 实现如下：

```js
function batchedUpdates(fn, a) {
  var prevExecutionContext = executionContext; // 保存原来的值
  executionContext |= EventContext;
  try {
    return fn(a); // 调用我们的合成事件逻辑onBtnClick
  } finally {
    executionContext = prevExecutionContext; // 函数执行完成恢复成原来的值

    if (executionContext === NoContext) {
      // Flush the immediate callbacks that were scheduled during this batch
      resetRenderTimer();
      flushSyncCallbackQueue();
    }
  }
}

const batchedEventUpdates = batchedUpdates;
```

可以看出该方法在执行时会更改 `executionContext` 指示 `React` 异步更新。这也是为什么我们在合成事件中多次调用 `setState`，而 `React` 只会更新一次的原因。函数执行完成，`executionContext` 又会恢复成原来的值。如果我们的 `setState` 逻辑是在 `setTimeout` 中，当合成事件执行完毕，此时 `executionContext` 恢复成原来的值， `setTimeout` 中的 `setState` 就变成了同步更新

在 `React17` 版本中提供了一个 `unstable_batchedUpdates` API，如果我们希望在 `setTimeout` 等异步任务中开启批量更新，则可以使用这个方法包裹一下我们的业务代码。

```js
exports.unstable_batchedUpdates = batchedUpdates;
```

## 更新队列 syncQueue

`React` 使用 `syncQueue` 维护一个更新队列。`syncQueue` 数组存的是 `performSyncWorkOnRoot`，`performSyncWorkOnRoot` 这个方法从根节点开始更新

```js
function scheduleSyncCallback(callback) {
  if (syncQueue === null) {
    syncQueue = [callback];

    // 开始调度，其实这部分逻辑相当于queueMicrotask(flushSyncCallbackQueueImpl)，让更新在
    // 下一个微任务中执行
    immediateQueueCallbackNode = Scheduler_scheduleCallback(
      Scheduler_ImmediatePriority,
      flushSyncCallbackQueueImpl
    );
  } else {
    // 注意这里不需要再开启一个新的微任务！！
    syncQueue.push(callback);
  }

  return fakeCallbackNode;
}
// flushSyncCallbackQueueImpl简单实现如下：
function flushSyncCallbackQueueImpl() {
  syncQueue.forEach((cb) => cb());
  syncQueue = null;
}
```

在 `scheduleSyncCallback` 函数中如果 `syncQueue` 为 `null`，则初始化一个数组，开启一个微任务调度。而如果 `syncQueue` 不为 `null`，则添加进更新队列，此时不需要再重新开启一个微任务调度

如果 `executionContext === NoContext` 则直接刷新 `syncQueue`

```js
function scheduleUpdateOnFiber(fiber, lane, eventTime) {
  // 省略前面的代码
  if (executionContext === NoContext) {
    resetRenderTimer();
    flushSyncCallbackQueue();
  }
  // 省略后面的代码
}
```

## 批量更新场景

在合成事件等 `React` 能够接管的场景中，`setState` 是**批量更新**的。点击按钮，查看控制台可以发现只打印了一次：

render====== 2

```jsx
const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0);
  console.log("render======", count);
  return (
    <button
      onClick={() => {
        debugger;
        setCount(1);
        setCount(2);
      }}
    >
      {count}
    </button>
  );
};
```

## 同步更新场景

在 `setTimeout`、`Promise回调` 等 `异步任务` 场景中，`setState` 是**同步更新**的。点击按钮，查看控制台可以发现打印了两句话：

render====== 1

render====== 2

```jsx
const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0);
  console.log("render======", count);
  return (
    <button
      onClick={() => {
        setTimeout(() => {
          debugger;
          setCount(1);
          setCount(2);
        }, 0);
      }}
    >
      {count}
    </button>
  );
};
```

### 批量更新机制主流程源码

在 `onClick` 函数里加一行 `debugger`。点击按钮，开始 debug。首先执行的是 `dispatchAction` 函数，但是如果我们追溯函数调用栈，可以发现实际上是会先执行合成事件相关的函数：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/batchupdate-01.jpg)

合成事件调用了 `batchedEventUpdates`，此时 `executionContext` 已经被设置为**批量更新**了

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/batchupdate-02.jpg)

回到 `dispatchAction` 方法中，这个方法主要是构造更新队列，然后调用 `scheduleUpdateOnFiber` 开始调度更新，异步 or 同步更新的逻辑主要在这个函数的流程中！！`scheduleUpdateOnFiber` 主要流程如下：

```js
const SyncLane = 1;
const SyncLanePriority = 15;
const NoContext = 0;
let executionContext = NoContext;
let syncQueue = [];
const scheduleUpdateOnFiber = (fiber, lane, eventTime) => {
  const root = markUpdateLaneFromFiberToRoot(fiber);
  if (lane === SyncLane) {
    // 开始创建一个任务，从根节点开始进行更新
    ensureRootIsScheduled(root);
    // 如果当前的executionContext执行上下文环境是NoContext(非批量)
    if (executionContext === NoContext) {
      // 需要注意，我们在ensureRootIsScheduled函数中，将flushSyncCallbackQueue放在了微任务中去执行，
      // 但是如果executionContext是同步更新的话，这里会直接调用flushSyncCallbackQueue开始更新任务，更新完成后
      // flushSyncCallbackQueue会清空syncQueue

      flushSyncCallbackQueue();
    }
  }
};
function ensureRootIsScheduled(root) {
  const newCallbackPriority = returnNextLanesPriority();
  const existingCallbackPriority = root.callbackPriority;

  if (existingCallbackPriority === newCallbackPriority) {
    // The priority hasn't changed. We can reuse the)
    return;
  }

  if (newCallbackPriority === SyncLanePriority) {
    newCallbackNode = scheduleSyncCallback(
      performSyncWorkOnRoot.bind(null, root)
    );
  }
  root.callbackPriority = newCallbackPriority;
}

// 其实就是把performSyncWorkOnRoot函数添加到队列里，在下一个微任务里面执行
function scheduleSyncCallback(callback) {
  if (syncQueue === null) {
    syncQueue = [callback]; // Flush the queue in the next tick, at the earliest.

    immediateQueueCallbackNode = Scheduler_scheduleCallback(
      Scheduler_ImmediatePriority,
      flushSyncCallbackQueue
    );
  } else {
    syncQueue.push(callback);
  }
}
// flushSyncCallbackQueue简单实现如下：
function flushSyncCallbackQueue() {
  syncQueue.forEach((cb) => cb());
  syncQueue = null;
}
```

`performSyncWorkOnRoot` 从根节点开始更新，这个不属于本节内容。

当我们点击按钮，从合成事件派发到 `React` 从当前 `fiber` 节点开始调度更新，并且决定是异步或者同步更新的主要流程如下图：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/batchupdate-03.jpg)
