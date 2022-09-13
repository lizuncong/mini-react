> 本章是手写 React Scheduler 异步任务调度源码系列的第五篇文章，在上一篇文章我们已经实现了按优先级调度任务，可以查看[手写 scheduler 源码之优先级](https://github.com/lizuncong/mini-react/blob/master/docs/schedule/%E6%89%8B%E5%86%99scheduler%E6%BA%90%E7%A0%81%E4%B9%8B%E4%BC%98%E5%85%88%E7%BA%A7.md)。本章我们继续实现延迟任务

## 延迟任务

前面几节介绍的任务是普通任务，需要添加到 taskQueue 中按优先级尽快执行。但有些任务是需要到一定时间后才能执行的。以需求排期类比，需求 A 需要依赖于需求 B，那需求 A 只能等到需求 B 完成后才能开始，如果需求 B 需要 3 天才能完成，那么需求 A 就需要 3 天后才能开始。我们将这类到达一定时间才能执行的任务称为延迟任务，延迟任务存储在 timerQueue 中，并且按照开始时间排序。

延迟任务的开始时间等于当前调度的时间加上 delay，然后我们可以启用定时器 `setTimeout(handleDelayTask, delay)`处理延迟任务

> 注意，taskQueue 中的普通任务是按照过期时间 expirationTime 排序的，而 timerQueue 中的延迟任务是按照开始时间 startTime 排序的

### 如何处理延迟任务

在 scheduler 中，延迟任务到期后会被添加到 taskQueue 中按过期时间重新排序处理。在处理 taskQueue 时，每执行完一次普通任务，都会检查 timerQueue 中是否有延迟任务到期了，如果有，则添加进 taskQueue 中。

以下面的 demo 为例

```js
function printA(didTimeout) {
  sleep(7);
  console.log("A didTimeout：", didTimeout);
}
function printB(didTimeout) {
  sleep(120);
  console.log("B didTimeout：", didTimeout);
}
function printC(didTimeout) {
  sleep(7);
  console.log("C didTimeout：", didTimeout);
}
scheduleCallback(UserBlockingPriority, printA, { delay: 100 });
scheduleCallback(NormalPriority, printB);
scheduleCallback(NormalPriority, printC);
```

我们通过`scheduleCallback`添加了一个延迟任务，两个普通任务，此时 timerQueue 和 taskQueue 值如下：

```js
timerQueue = [taskA];
taskQueue = [taskB, taskC];
```

通过 `scheduleCallback` 添加延迟任务 A 时，会启动一个定时器，间隔为 100 毫秒。通过`scheduleCallback`添加任务 B 时，会触发一个 Message Channel 事件。

可想而知，Message Channel 事件先触发，开始处理 taskQueue 中的任务。**在处理前，sheduler 会先取消延迟任务的定时器**，因为在处理 taskQueue 时，每执行完一个普通任务，都会判断 timerQueue 中的任务是否到时了，如果到时，就添加到 taskQueue 中重新排序。

首先处理的是 taskB，taskB 执行耗时 120 毫秒，taskB 执行完成，判断 timerQueue 中是否有任务到期了，可以发现，taskA 到期了，则添加到 taskQueue 中重新按照过期时间排序，由于 taskA 优先级比 taskC 高，因此 taskQueue=[taskA, taskC]。

如果执行完 taskQueue 中所有的任务，然后 timerQueue 中的任务还没到期，又该如何处理？比如将 printB 的执行时间`sleep(120)`改成`sleep(7)`。那么当执行完 taskB 时，发现 taskA 还没到期，则不做处理，继续执行 taskC，执行完 taskC 发现 taskA 还是没到期，这时候，就需要重新启动一个 setTimeout 定时器，定时器到期执行后，将 timerQueue 中的 taskA 取出添加到 taskQueue 中。

### 为什么延迟任务需要取出并添加到 taskQueue 中处理

延迟任务存储在 timerQueue 中，按 startTime 排序，到期后会被取出添加到 taskQueue 中，重新按照 expirationTime 进行排序。

我们知道 Scheduler 的主要目的是时间切片，即处理任务的时间控制在 5ms 内，不管是延迟任务还是普通任务，都是如此。延迟任务到期后就是普通任务，大可不必针对延迟任务又设计一套时间切片的 API。只需要将到期的延迟任务添加到 taskQueue 中，然后触发一个 messageChannel 事件即可，降低 API 复杂度。

## 源码实现

### scheduleCallback

```js
function scheduleCallback(priorityLevel, callback, options) {
  let delay = 0;
  if (typeof options === "object" && options !== null) {
    delay = options.delay || 0;
  }
  const startTime = new Date().getTime() + delay;
  let timeout;
  // 不同优先级代表不同的过期时间
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
  // 计算任务的截止时间
  const expirationTime = startTime + timeout;

  let newTask = {
    callback: callback,
    priorityLevel,
    startTime,
    expirationTime: expirationTime,
    sortIndex: -1,
  };
  if (delay) {
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    // 【问题1：为什么需要这个判断？】
    // 如果taskQueue为空，同时新添加的newTask是最早需要执行的延迟任务，则我们需要取消之前的定时器
    // 启动一个更早的定时器
    if (!taskQueue.length && newTask === timerQueue[0]) {
      // 所有的任务都需要执行，但是新添加的这个newTask是最早需要执行的任务，因此我们需要取消之前的定时器
      // 重新启动一个更早的定时器
      if (isHostTimeoutScheduled) {
        // 取消之前的定时器
        console.log("取消之前的定时器");
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      // 启动一个更早的定时器
      // 开启一个settimeout定时器，startTime - currentTime，其实就是options.delay毫秒后执行handleTimeout
      console.log("启动一个定时器，delay：", delay);
      requestHostTimeout(handleTimeout, delay);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    if (!isHostCallbackScheduled) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }

  return newTask;
}
```

scheduler 方法增加了 options 参数，支持传递 delay 表示这是一个需要延迟执行的任务。

注意上面代码中的【问题 1：为什么需要这个判断？】。

在 scheduler 中，并不会为每个延迟任务开启一个定时器，不管添加多少个延迟任务，最多启动一个定时器，时间间隔为所有延迟任务中 delay 最小的那个值，可以查看下面的测试用例 1。

如果添加延迟任务时，taskQueue 已经有任务，则不会再启动一个定时器，因为 scheduler 在处理 taskQueue 时，每执行完一个普通任务，都会检查 timerQueue 中是否有延迟任务到期了，这也就没必要再在定时器中检查。但有一种情况例外，如果 taskQueue 都执行完成了，而 timerQueue 中还有延迟任务，则需要重新启动一个定时器，可以查看下面的测试用例 2。

这里的 requestHostTimeout 和 cancelHostTimeout 实现都比较简单

```js
let taskTimeoutID = -1;
function requestHostTimeout(callback, ms) {
  taskTimeoutID = setTimeout(function () {
    callback(new Date().getTime());
  }, ms);
}

function cancelHostTimeout() {
  clearTimeout(taskTimeoutID);

  taskTimeoutID = -1;
}
```

handleTimeout 实现如下：

```js
function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);

  // 如果已经触发了一个message channel事件，但是事件还没执行。刚好定时器这时候执行了，就会
  // 存在isHostCallbackScheduled为true的情况，此时就没必要再继续里面的逻辑了。因为
  // message channel中就会执行这些操作
  // 【问题2:为什么需要判断是否调度了Message Channel】
  if (!isHostCallbackScheduled) {
    // 如果timerQueue的第一个任务被取消了，则taskQueue可能为null，此时timerQueue后面的任务还是需要延迟执行
    if (taskQueue[0]) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      // 【问题3：taskQueue什么时候会为空】
      var firstTimer = timerQueue[0];

      if (firstTimer) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}
```

handleTimeout 主要逻辑就是，定时器到期执行时，将到期的延迟任务从 timerQueue 取出，添加到 taskQueue 中。

对于问题 2，如果 taskQueue 不为空，则触发一个 message channel 处理 taskQueue，但是如果已经触发了 message channel，就没必要再重复触发了。

对于问题 3，如果 taskQueue 为空，说明延迟任务被取消了，重新启动一个 setTimeout 定时器，具体可以查看下面的测试用例 3

### advanceTimers

advanceTimers 主要的逻辑如下：

取出 timerQueue 中到期了的任务，即 startTime < currentTime 的任务，然后添加到 taskQueue 中重新按照过期时间排序。由于 timerQueue 已经按照 startTime 从小到大排好序了，因此在和 currentTime 的比较中，如果前面的任务(比如第一个)的 startTime 都大于 currentTime，就无需继续比较后面的任务了，因为后面的任务 startTime 更大。

```js
// 找出那些到时的不需要再延迟执行的任务，添加到taskQueue中
function advanceTimers(currentTime) {
  var timer = timerQueue[0];

  while (timer) {
    if (timer.callback === null) {
      // 任务被取消了
      timerQueue.shift();
    } else if (timer.startTime <= currentTime) {
      // 任务到时了，需要执行，添加到taskQueue调度执行
      timerQueue.shift();
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else {
      // 如果第一个任务都还没到时，说明剩下的都还需要延迟
      return;
    }

    timer = timerQueue[0];
  }
}
```

### workLoop

在 workLoop 中，每执行完一次普通任务，都会调用 advanceTimers 处理 timerQueue 中的延迟任务，将到期的延迟任务取出并添加到 taskQueue 中

```js
function flushWork(initialTime) {
  // 【问题1：取消延迟任务的定时器】
  if (isHostTimeoutScheduled) {
    // 如果之前启动过定时器，则取消。因为在workLoop内部每执行一个任务，都会调用advanceTimers将
    // timerQueue中到期执行的任务加入到taskQueue中去执行。但taskQueue全部执行完成，
    // 如果timerQueue还有工作，此时就会重新启动定时器延迟执行timerQueue中的任务
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }
  return workLoop(initialTime);
}
function workLoop(initialTime) {
  let currentTime = initialTime;
  // 【问题2：开始执行时先检查下timerQueue是否有到期任务】
  advanceTimers(currentTime);

  currentTask = taskQueue[0];

  while (currentTask) {
    if (currentTask.expirationTime > currentTime && shouldYield()) {
      // 当前的currentTask还没过期，但是当前宏任务事件已经到达执行的最后期限，即我们需要
      // 将控制权交还给浏览器，剩下的任务在下一个事件循环中再继续执行
      // console.log("yield");
      break;
    }
    const callback = currentTask.callback;
    if (typeof callback === "function") {
      currentTask.callback = null;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      callback(didUserCallbackTimeout);
      currentTime = new Date().getTime();
      if (currentTask === taskQueue[0]) {
        taskQueue.shift();
      }
      // 【问题3：每执行完一次普通任务，都检查timerQueue是否有到期任务】
      advanceTimers(currentTime);
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
    // 如果taskQueue已经没有工作，同时timerQueue还有工作，则需要启用一个定时器延迟执行
    var firstTimer = timerQueue[0];
    // 【问题4：如果所有的普通任务都已经执行完成，timerQueue还有延迟任务，则需要启动一个定时器】
    if (firstTimer) {
      console.log(
        "taskQueue全部执行完成了，但是timerQueue还有任务，因此启动一个定时器"
      );
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }

    return false;
  }
}
```

对于问题 1-4，可以查看下面的测试用例 4

## 测试用例

### 测试用例 1：只添加多个延迟任务

即使添加多个延迟任务，最多只会启动一个 setTimeout 定时器，定时器的间隔以 delay 最小的为主。本例中，首先添加的是 taskA，启动一个定时器`setTimeout(handleTimeout, 2000)`。然后又添加的是 taskB，scheduler 会先取消之前的 taskA 的定时器，然后再启动一个更早的定时器`setTimeout(handleTimeout, 1000)`。

```js
btn.onclick = () => {
  function sleep(ms) {
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
  }
  function printA(didTimeout) {
    sleep(7);
    console.log("A didTimeout：", didTimeout);
  }
  function printB(didTimeout) {
    sleep(7);
    console.log("B didTimeout：", didTimeout);
  }
  scheduleCallback(UserBlockingPriority, printA, { delay: 2000 });
  scheduleCallback(UserBlockingPriority, printB, { delay: 1000 });
};
```

### 测试用例 2：先添加普通任务，再添加延迟任务

先添加一个普通任务 A，再添加一个延迟任务 B，由于 taskQueue 有任务，则 scheduler 不会为延迟任务 B 启动一个 setTimeout 定时器。执行完任务 A 后，再判断是否需要为任务 B 启动 setTimeout 定时器

本例中，taskB 延迟 10 毫秒执行，当执行完 taskA 时，taskB 还没到期，此时 taskQueue 为空，需要重新启动一个定时器`setTimeout(handleTimeout, 3)`，可以思考下为啥是 3 毫秒

如果将`printA`的`sleep(7)`改成`sleep(20)`，那么当 printA 执行完成，此时 taskB 已经到期，直接添加到 taskQueue 中处理，而不用重新启动一个定时器

```js
btn.onclick = () => {
  function sleep(ms) {
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
  }
  function printA(didTimeout) {
    sleep(7);
    console.log("A didTimeout：", didTimeout);
  }
  function printB(didTimeout) {
    sleep(7);
    console.log("B didTimeout：", didTimeout);
  }
  scheduleCallback(UserBlockingPriority, printA);
  scheduleCallback(UserBlockingPriority, printB, { delay: 10 });
};
```

### 测试用例 3：延迟任务被取消

本例中，添加了两个延迟任务，scheduler 会启动一个定时器`setTimeout(handleTimeout, 100)`，但紧接着 taskA 取消了。100 毫秒后，handleTimeout 检查 timerQueue 中到期的任务，发现 taskA 被取消了，因此会为 taskB 再重新启动一个定时器

```js
btn.onclick = () => {
  function sleep(ms) {
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
  }
  function printA(didTimeout) {
    sleep(7);
    console.log("A didTimeout：", didTimeout);
  }
  function printB(didTimeout) {
    sleep(7);
    console.log("B didTimeout：", didTimeout);
  }
  const taskA = scheduleCallback(UserBlockingPriority, printA, { delay: 100 });
  scheduleCallback(UserBlockingPriority, printB, { delay: 200 });
  // 取消taskA
  taskA.callback = null;
};
```

### 测试用例 4：普通任务执行完成，启动定时器处理剩余的延迟任务

首先添加两个延迟任务，并启动一个定时器`setTimeout(handleTimeout, 10)`。然后添加两个普通任务 C 和 D。然后触发一个 message channel 事件。在 message channel 事件中，我们先取消延迟任务的定时器，因为在对普通任务的处理时，会检查 timerQueue 中是否有到期的延迟任务，就不必在定时器中检查了。执行完所有的普通任务后，发现 timerQueue 中还有一个 taskB，因此再触发一个定时器处理剩余的 timerQueue

```js
btn.onclick = () => {
  function sleep(ms) {
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
  }
  function printA(didTimeout) {
    sleep(2);
    console.log("A didTimeout：", didTimeout);
  }
  function printB(didTimeout) {
    sleep(3);
    console.log("B didTimeout：", didTimeout);
  }
  function printC(didTimeout) {
    sleep(12);
    console.log("C didTimeout：", didTimeout);
  }
  function printD(didTimeout) {
    sleep(3);
    console.log("D didTimeout：", didTimeout);
  }
  scheduleCallback(UserBlockingPriority, printA, { delay: 10 });
  scheduleCallback(UserBlockingPriority, printB, { delay: 1000 });
  scheduleCallback(UserBlockingPriority, printC);
  scheduleCallback(UserBlockingPriority, printD);
};
```


## 小结

至此，我们已经实现延迟任务的问题，完整源码可以看[这里](./schedule_delay.html)。
