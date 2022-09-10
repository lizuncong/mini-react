> 本章是手写 React Scheduler 异步任务调度源码系列的第四篇文章，上一篇文章可以查看[【React Scheduler 源码第三篇】React Scheduler 原理及手写源码
> ](https://github.com/lizuncong/mini-react/blob/master/docs/schedule/%E6%89%8B%E5%86%99scheduler%E6%BA%90%E7%A0%81.md)。本章实现 scheduler 中任务优先级、高优先级任务插队相关的源码

## 优先级

以我们平时需求排期为例，优先级高的需求优先开始，在开发的过程中，总是会有更高优先级的需求插队。那怎么衡量需求的优先级呢？一般来说，优先级高的需求都是需要尽快完成尽早上线。因此，高优先级的需求总是比低优先级的需求早点提测，即高优先级的提测日期（deadline）会更早一些。比如，今天(9 月 8 日)在给需求 A、B、C、D 排期时：

- D 的优先级比较高，2 天后提测，提测日期为 9 月 10 日
- 其次是 B，5 天后提测，提测日期为 9 月 13 日
- 然后是 C，10 天后提测，提测日期为 9 月 18 日
- 最后是 A，20 天后提测，提测日期为 9 月 28 日

这些需求在甘特图中，就会标明每个需求的开始日期，截止日期等信息，然后项目管理人员会按照需求优先级(提测的日期)排序，优先级高的先开始执行。在这个过程中，如果有新的优先级高的需求，比如 E 需要 9 月 15 日提测，那么项目管理人员需要重新排序，然后发现需求 E 需要在 C 之前，B 之后执行。

**同理，在 React 调度中，当我们通过 scheduleCallback 添加一个任务时，我们需要记录这个任务的开始时间，截止时间等信息，然后按照任务的截止时间排序，截止时间越小的，优先级越高，需要尽快执行。**

那截止时间该怎么算呢？我们是不是可以调度的时候传入这个任务的截止时间，比如

```js
scheduleCallback(new Date("2022-09-08 18:45: 34"), task);
scheduleCallback(new Date("2022-09-08 19:20: 00"), task);
```

不会真有人这样设计 API 吧？

实际上，类比于需求排期，我们只需要将需求的过期时间标明，比如 2 天后提测，那截止日期不就是当前时间 + 2 天吗？同理，我们在调度任务时，只需要告诉 scheduler 这个任务多久过期，比如 200 毫秒，1000 毫秒，还是 50000 毫秒，就不需要开发者手动计算截止时间：

```js
scheduleCallback(1000ms, task);
scheduleCallback(200ms, task);
scheduleCallback(500ms, task);
scheduleCallback(600ms, task);
scheduleCallback(500ms, task);
```

由于传具体的值不够语义化，因此我们可以定义几个优先级的枚举，这些枚举值代表不同的过期时间，比如：

```js
// 以下过期时间单位都是毫秒
const maxSigned31BitInt = 1073741823; // 最大整数
const IMMEDIATE_PRIORITY_TIMEOUT = -1; // 过期时间-1毫秒，超高优先级，需要立即执行
const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
const NORMAL_PRIORITY_TIMEOUT = 5000;
const LOW_PRIORITY_TIMEOUT = 10000;
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt; // 永不过期，最低优先级
// 优先级
const ImmediatePriority = 1;
const UserBlockingPriority = 2;
const NormalPriority = 3;
const LowPriority = 4;
const IdlePriority = 5;
```

然后我们就可以调用 scheduleCallback 时传入对应的优先级即可

```js
scheduleCallback(NormalPriority, task);
```

现在，让我们开始修改上一节的代码以支持优先级调度

## scheduleCallback 优化

根据我们前面提到的，当调用 scheduleCallback 调度任务 task 时，scheduleCallback 必须进行以下几步操作

- 获取当前 task 调度的时间 startTime
- 根据优先级转换成 timeout
- 根据 startTime 和 timeout 计算 task 的过期时间 expirationTime
- 将 task 添加到队列 taskQueue 中，同时还需要根据任务的优先级排序，即根据 expirationTime 排序
- 触发一个 Message Channel 事件，在异步事件中处理 task

这些步骤中，第四步需要根据 expirationTime 排序，这就要求我们每次通过 scheduleCallback 添加任务时，都需要重新排序。因此我们还需要一个排序算法。这里我简单实现如下：

```js
// 每次插入一个任务，都需要重新排序以确定新的优先级。就像没插入一个需求，都需要重新按照截止日期排期以确定新的优先级
// 高优先级的任务在前面
// 在react scheduler源码中，采用的是最小堆排序算法。这里为了简化，咱就不那么卷了
function push(queue, task) {
  queue.push(task);
  queue.sort((a, b) => {
    return a.sortIndex - b.sortIndex;
  });
}
```

> 在 scheduler 源码中，采用的是最小堆排序算法。这里我就简单通过数组的 sort 方法简单实现了下排序算法

```js
function scheduleCallback(priorityLevel, callback) {
  // 1.获取任务开始调度的时间startTime
  const startTime = new Date().getTime();
  let timeout;
  // 2.根据优先级转换成对应的timeout
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;

    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;

    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;

    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;

    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }
  // 3.根据startTime和timeout计算任务的截止时间
  const expirationTime = startTime + timeout;

  let newTask = {
    callback: callback,
    priorityLevel,
    startTime,
    expirationTime: expirationTime,
    sortIndex: expirationTime,
  };
  // 4.通过push方法往任务队列中添加任务，同时根据expirationTime重新排序
  push(taskQueue, newTask);
  // 5.触发一个Messsage Channel 事件
  if (!isHostCallbackScheduled) {
    isHostCallbackScheduled = true;
    requestHostCallback(flushWork);
  }
  return newTask;
}
```

为什么需要 push 方法？push 方法每次添加一个任务都会进行重新排序，这同时解决了我们高优先级任务插队的问题，比如下面的 demo，一开始我们通过 scheduleCallback 添加了两个相同优先级的任务，当在异步的宏任务事件中执行 printA 时，又添加了一个高优先级的 printE。此时 printE 在 printB 前面执行

```js
function printA() {
  scheduleCallback(ImmediatePriority, printE);
}
scheduleCallback(NormalPriority, printA);
scheduleCallback(NormalPriority, printB);
```

## workLoop

由于我们引入了任务过期时间、优先级相关的东西，那我们在执行每个任务时，需要告诉用户这个任务是否已经过期。如果开始执行这个任务的时间大于任务的过期时间，那说明这个任务已经过期了。
如果任务已经过期，即使当前的宏任务事件执行时间已经超过 5 毫秒，也要在当前事件中执行完这个任务，而不是在下一次事件循环中处理。因此在 workLoop 中需要执行以下操作：

- 判断当前任务是否过期
  - 如果过期了，则一定要在当前宏任务事件中执行完成
  - 如果还没过期，则需要判断当前宏任务事件执行时间是否超过 5 毫秒，如果超过，则退出循环，剩余任务在下一个宏任务事件中处理
- 计算当前任务是否过期

```js
function workLoop(initialTime) {
  let currentTime = initialTime;

  currentTask = taskQueue[0];

  while (currentTask) {
    if (currentTask.expirationTime > currentTime && shouldYield()) {
      // 当前的currentTask还没过期，但是当前宏任务事件已经到达执行的最后期限，即我们需要
      // 将控制权交还给浏览器，剩下的任务在下一个事件循环中再继续执行
      // console.log("yield");
      break;
    }
    const callback = currentTask.callback;
    // 问题1 为什么需要判断callback
    if (typeof callback === "function") {
      // 问题2 为什么需要重置callback为null
      currentTask.callback = null;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      callback(didUserCallbackTimeout);
      currentTime = new Date().getTime();
      // 问题3 为什么需要判断currentTask是否等于taskQueue[0]
      if (currentTask === taskQueue[0]) {
        taskQueue.shift();
      }
    } else {
      taskQueue.shift();
    }
    currentTask = taskQueue[0];
  }
  if (currentTask) {
    // 如果taskQueue中还有剩余工作，则返回true
    return true;
  } else {
    isHostCallbackScheduled = false;
    return false;
  }
}
```

注意上面的问题 1 到 3，实际上这都是为了解决高优先级任务插队的问题。比如下面的测试用例 2 中，如果我们嵌套调用 scheduleCallback 插入更高优先级的任务：

```js
function printA(didTimeout) {
  scheduleCallback(UserBlockingPriority, printC);
  console.log("A didTimeout：", didTimeout);
}
function printB(didTimeout) {
  console.log("B didTimeout：", didTimeout);
}
function printC(didTimeout) {
  console.log("C didTimeout：", didTimeout);
}
scheduleCallback(NormalPriority, printA);
scheduleCallback(NormalPriority, printB);
```

一开始通过 scheduleCallback 添加了两个相同优先级的任务，此时 taskQueue = [taskA, taskB]，然后在宏任务事件中开始调用 workLoop 执行任务。首先执行的是 taskA，执行 taskA 时又通过`scheduleCallback(UserBlockingPriority, printC);`插入了一个更高优先级的任务 taskC，此时 taskQueue=[taskC, taskA, taskB]，因此我们不能简单的通过`taskQueue.shift()`将第一项删除，所以才有下面的判断：

```js
// 问题3 为什么需要判断currentTask是否等于taskQueue[0]
if (currentTask === taskQueue[0]) {
  taskQueue.shift();
}
```

那我们应该要怎么删除已经执行完成的 taskA？这就是问题 2，我们通过在一开始执行 callback 时，就重置 callback 为 null：currentTask.callback = null。等到 while 循环又遍历到 taskA 时，由于 taskA.callback 为 null，因此直接调用 taskQueue.shift()将其删除即可。因为问题 1-3 都是为了解决高优先级任务插队的问题

## 测试用例

### 用例 1：不同优先级的任务

通过 scheduleCallback 调度不同的优先级任务，优先级高的先执行

```js
function printA(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 7) {}
  console.log("A didTimeout：", didTimeout);
}
function printB(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 3) {}
  console.log("B didTimeout：", didTimeout);
}
function printC(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 4) {}
  console.log("C didTimeout：", didTimeout);
}
function printD(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 7) {}
  console.log("D didTimeout：", didTimeout);
}
function printE(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 10) {}
  console.log("E didTimeout：", didTimeout);
}
scheduleCallback(IdlePriority, printA);
scheduleCallback(LowPriority, printB);
scheduleCallback(NormalPriority, printC);
scheduleCallback(UserBlockingPriority, printD);
scheduleCallback(ImmediatePriority, printE);
```

打印：

```js
E didTimeout： true
D didTimeout： false
C didTimeout： false
B didTimeout： false
A didTimeout： false
```

### 用例 2：高优先级任务插队问题

先通过 scheduleCallback 添加两个普通优先级的任务，此时 taskQueue = [taskA,taskB]，然后在执行 printA 时，又嵌套调用了
scheduleCallback 插入一个更高优先级的任务 taskC，此时 taskQueue=[taskC, taskA, taskB]

```js
function printA(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 7) {}
  scheduleCallback(UserBlockingPriority, printC);
  console.log("A didTimeout：", didTimeout);
}
function printB(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 3) {}
  console.log("B didTimeout：", didTimeout);
}
function printC(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 4) {}
  console.log("C didTimeout：", didTimeout);
}
scheduleCallback(NormalPriority, printA);
scheduleCallback(NormalPriority, printB);
```

控制台输出：

```js
A didTimeout： false
C didTimeout： false
B didTimeout： false
```

### 用例 3：任务过期则强制执行

这次我们添加三个执行耗时 1000 毫秒的任务，优先级都是 UserBlockingPriority，因此他们的过期时间 timeout 都是 250 毫秒。同时为了方便我们查看触发了几次宏任务事件，我们在 performWorkUntilDeadline 添加一个 log

```js
function performWorkUntilDeadline() {
  console.log("触发了performWorkUntilDeadline执行");
  // ...
}
```

```js
function printA(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 1000) {}
  console.log("A didTimeout：", didTimeout);
}
function printB(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 1000) {}
  console.log("B didTimeout：", didTimeout);
}
function printC(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 1000) {}
  console.log("C didTimeout：", didTimeout);
}
scheduleCallback(UserBlockingPriority, printA);
scheduleCallback(UserBlockingPriority, printB);
scheduleCallback(UserBlockingPriority, printC);
```

控制台输出：

```js
触发了performWorkUntilDeadline执行
A didTimeout： false
B didTimeout： true
C didTimeout： true
```

因此可以看到，即使三个任务的执行耗时都是 1 秒，远超过 5 毫秒，但由于他们都超时了，因此都在当前的宏任务事件中执行完成

## 小结

至此，我们已经实现了按优先级调度任务以及高优先级任务插队的问题，完整源码可以看[这里](./scheduler_priority.html)。下一篇继续介绍实现延迟任务的问题
