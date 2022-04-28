>React更新过程相关的代码都在 ReactFiberWorkLoop.js 文件中
## 批处理（异步更新）机制简述
在 `React` 源码中，通过全局变量 `executionContext` 控制 `React` 执行上下文，指示 `React` 开启同步或者异步更新。`executionContext` 一开始被初始化为 `NoContext`，因此 `React` 默认是同步更新的。

当我们在合成事件中调用 `setState` 时，实际上合成事件会调用 `batchedEventUpdates`：
```js
function batchedEventUpdates$1(fn, a) {
   var prevExecutionContext = executionContext; // 保存原来的值
   executionContext |= EventContext;
   try {
     return fn(a);
   } finally {
     executionContext = prevExecutionContext; // 函数执行完成恢复成原来的值
 
     if (executionContext === NoContext) {
       // Flush the immediate callbacks that were scheduled during this batch
       resetRenderTimer();
       flushSyncCallbackQueue();
     }
   }
}
```
可以看出该方法在执行时会更改 `executionContext` 指示 `React` 异步更新。这也是为什么我们在合成事件中多次调用 `setState`，而 `React` 只会更新一次的原因。

在 `React17` 版本中提供了一个 `unstable_batchedUpdates` API，如果我们希望在 `setTimeout` 等异步任务中开启批量更新，则可以使用这个方法包裹一下我们的业务代码。
```js
function batchedUpdates(fn, a) {
  var prevExecutionContext = executionContext;
  executionContext |= BatchedContext;

  try {
    return fn(a);
  } finally {
    executionContext = prevExecutionContext;

    if (executionContext === NoContext) {
      // Flush the immediate callbacks that were scheduled during this batch
      resetRenderTimer();
      flushSyncCallbackQueue();
    }
  }
 }
exports.unstable_batchedUpdates = batchedUpdates;
```


## 批量更新机制
在合成事件等 `React` 能够接管的场景中，`setState` 是**批量更新**的。点击按钮，查看控制台可以发现只打印了一次：

render====== 2

```jsx
const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0);
  console.log('render======', count)
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

### 批量更新机制主流程
在 `onClick` 函数里加一行 `debugger`。点击按钮，开始debug。首先执行的是 `dispatchAction` 函数，但是如果我们追溯函数调用栈，可以发现实际上是会先执行合成事件相关的函数：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/batchupdate-01.jpg)

合成事件调用了 `batchedEventUpdates`，此时 `executionContext` 已经被设置为**批量更新**了
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/batchupdate-02.jpg)

回到 `dispatchAction` 方法中，这个方法主要是构造更新队列，然后调用 `scheduleUpdateOnFiber` 开始调度更新！！主要逻辑如下：

```js
const scheduleUpdateOnFiber = (fiber) => {
  const root = markUpdateLaneFromFiberToRoot(fiber)
  // 开始创建一个任务，从根节点开始进行更新
  ensureRootIsScheduled(root)
  // 如果当前的执行上下文环境是NoContext(非批量)并且mode不是并发模式
  if(executionContext === NoContext && (fiber.mode & ConcurrentMode) === NoMode){
      flushSyncCallbackQueue()
  }
}
function ensureRootIsScheduled(root){
  const nextLanes = SyncLane
  const newCallbackPriority = SyncLanePriority // 按理说应该等于最高级别赛道的优先级
  const existingCallbackPriority = root.callbackPriority;// 当前根节点上正在执行的更新任务的优先级
  if(existingCallbackPriority === newCallbackPriority){
      // 在并发模式下，即使在setTimeout里也是批量的
      return // 如果这个新的更新和当前根节点的已经调度的更新相等，那就直接返回，复用上次的更新。不再创建新的更新
  }
  scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root))
  queueMicrotask(flushSyncCallbackQueue)
  root.callbackPriority = newCallbackPriority
}
```




## 同步更新场景
在 `setTimeout`、`Promise回调` 等 `异步任务` 场景中，`setState` 是**同步更新**的。点击按钮，查看控制台可以发现打印了两句话：

render====== 1

render====== 2

```jsx
const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0);
  console.log('render======', count)
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