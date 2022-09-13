## Scheduler 核心源码

### SchedulerMinHeap.js

最小堆排序算法，用于对 taskQueue 和 timerQueue 排序。对于 taskQueue，按照 expirationTime 排序。对于 timerQueue，则按照 startTime 进行排序。

每次从这两个数组中取出或者添加任务时，都会重新排序

```js
function push(heap, node) {
  var index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}
function peek(heap) {
  var first = heap[0];
  return first === undefined ? null : first;
}
function pop(heap) {
  var first = heap[0];

  if (first !== undefined) {
    var last = heap.pop();

    if (last !== first) {
      heap[0] = last;
      siftDown(heap, last, 0);
    }

    return first;
  } else {
    return null;
  }
}

function siftUp(heap, node, i) {
  var index = i;

  while (true) {
    var parentIndex = (index - 1) >>> 1;
    var parent = heap[parentIndex];

    if (parent !== undefined && compare(parent, node) > 0) {
      // The parent is larger. Swap positions.
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      // The parent is smaller. Exit.
      return;
    }
  }
}

function siftDown(heap, node, i) {
  var index = i;
  var length = heap.length;

  while (index < length) {
    var leftIndex = (index + 1) * 2 - 1;
    var left = heap[leftIndex];
    var rightIndex = leftIndex + 1;
    var right = heap[rightIndex]; // If the left or right node is smaller, swap with the smaller of those.

    if (left !== undefined && compare(left, node) < 0) {
      if (right !== undefined && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (right !== undefined && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      // Neither child is smaller. Exit.
      return;
    }
  }
}

function compare(a, b) {
  // Compare sort index first, then task id.
  var diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
```

### SchedulerHostConfig.js

```js
var isMessageLoopRunning = false;
var scheduledHostCallback = null; // 实际上存的就是flushwork
var taskTimeoutID = -1;

// Scheduler程序定期让出控制权，以防主线程还有其他工作，比如用户事件。默认情况下，一帧会让出多次。
// 它不会尝试与帧对齐，因为大多数任务不需要帧对齐。如果需要帧对齐，可以使用requestAnimationFrame
// 把控制权交给浏览器绘制页面
var yieldInterval = 5;
var deadline = 0;

function unstable_shouldYield() {
  return performance.now() >= deadline;
}

// 所有的任务调度都是由MessageChannel的第二个端口port2通过调用postMessage发起的。
function performWorkUntilDeadline() {
  // scheduledHostCallback 保存的是flushwork的引用
  if (scheduledHostCallback !== null) {
    var currentTime = performance.now();
    console.log("message channel start...", currentTime);
    // 在 yieldInterval 毫秒后让出控制权
    deadline = currentTime + yieldInterval;
    var hasTimeRemaining = true;

    try {
      var hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
      //console.log("message channel end...hasMoreWork：", hasMoreWork);
      if (!hasMoreWork) {
        // 没有任务需要执行
        isMessageLoopRunning = false;
        scheduledHostCallback = null;
      } else {
        // 如果还有任务，则触发下一个事件
        port.postMessage(null);
      }
    } catch (error) {
      // If a scheduler task throws, exit the current browser task so the
      // error can be observed.
      port.postMessage(null);
      throw error;
    }
  } else {
    isMessageLoopRunning = false;
  }
}

var channel = new MessageChannel();
var port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

// 使用 messagechannel触发一个宏任务，异步执行scheduledHostCallback，即callback回调
// 引入isMessageLoopRunning的一个重要原因是，假设执行完一次performWorkUntilDeadline，还有剩余的工作没完成，
// 那么performWorkUntilDeadline内部会通过port.postMessage(null);启动下一个宏任务事件。此时如果刚好用户又调用了
// unstable_scheduleCallback添加任务，就会导致又触发了一个宏任务事件，就会出现问题。因此引入isMessageLoopRunning开关
// 如果所有任务都已经执行完成，这个开关才会关闭。如果还有任务需要执行，则不允许重复触发宏任务事件
function requestHostCallback(callback) {
  scheduledHostCallback = callback;

  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null);
  }
}

// 实际上，在这里callback永远都是handleTimeout，也就是将handletimeout放入定时器，ms毫秒后执行
// 如果有延迟执行的任务，需要放在handleTimeout中调度执行
function requestHostTimeout(callback, ms) {
  taskTimeoutID = setTimeout(function () {
    callback(performance.now());
  }, ms);
}

function cancelHostTimeout() {
  clearTimeout(taskTimeoutID);

  taskTimeoutID = -1;
}
```

### SchedulerPriorities.js

```js
var ImmediatePriority = 1;
var UserBlockingPriority = 2;
var NormalPriority = 3;
var LowPriority = 4;
var IdlePriority = 5;
```

### Scheduler.js

```js
// Math.pow(2, 30) - 1
// 0b111111111111111111111111111111

var maxSigned31BitInt = 1073741823;
// 过期时间，单位毫秒
var IMMEDIATE_PRIORITY_TIMEOUT = -1; // Times out immediately

var USER_BLOCKING_PRIORITY_TIMEOUT = 250; // Eventually times out
var NORMAL_PRIORITY_TIMEOUT = 5000;
var LOW_PRIORITY_TIMEOUT = 10000; // Never times out

var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

// Tasks are stored on a min heap
var taskQueue = []; // 存储的是立即执行的任务，根据expirationTime排序，expirationTime最小的任务在第一位
var timerQueue = []; // 存储的是延迟执行的任务。根据任务开始时间startTime排序，startTime最小的任务在第一位

var taskIdCounter = 1; // Incrementing id counter. Used to maintain insertion order.

var currentTask = null;
var currentPriorityLevel = NormalPriority;

var isPerformingWork = false; // This is set while performing work, to prevent re-entrancy.
var isHostCallbackScheduled = false;
var isHostTimeoutScheduled = false;

// 找出那些到时的不需要再延迟执行的任务，添加到taskQueue中
function advanceTimers(currentTime) {
  var timer = peek(timerQueue);

  while (timer !== null) {
    if (timer.callback === null) {
      // 任务被取消了
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      // 任务到时了，需要执行，添加到taskQueue调度执行
      pop(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else {
      // 如果第一个任务都还没到时，说明剩下的都还需要延迟
      return;
    }

    timer = peek(timerQueue);
  }
}

function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);

  // 如果已经触发了一个message channel事件，但是事件还没执行。刚好定时器这时候执行了，就会
  // 存在isHostCallbackScheduled为true的情况，此时就没必要再继续里面的逻辑了。因为
  // message channel中就会执行这些操作
  if (!isHostCallbackScheduled) {
    // 如果timerQueue的第一个任务被取消了，则taskQueue可能为null，此时timerQueue后面的任务还是需要延迟执行
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      var firstTimer = peek(timerQueue);

      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}

// 这里需要isHostCallbackScheduled和isPerformingWork两个开关的原因是，防止在
// 正在工作中的task中又调度了unstable_scheduleCallback添加任务
function flushWork(hasTimeRemaining, initialTime) {
  isHostCallbackScheduled = false;

  if (isHostTimeoutScheduled) {
    // 如果之前启动过定时器，则取消。因为在workLoop内部每执行一个任务，都会调用advanceTimers将
    // timerQueue中到期执行的任务加入到taskQueue中去执行。但taskQueue全部执行完成，
    // 如果timerQueue还有工作，此时就会重新启动定时器延迟执行timerQueue中的任务
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }

  isPerformingWork = true;
  var previousPriorityLevel = currentPriorityLevel;

  try {
    return workLoop(hasTimeRemaining, initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
    console.log("flushwork...");
  }
}

function workLoop(hasTimeRemaining, initialTime) {
  var currentTime = initialTime;
  advanceTimers(currentTime);
  currentTask = peek(taskQueue);

  while (currentTask !== null) {
    if (
      currentTask.expirationTime > currentTime &&
      (!hasTimeRemaining || unstable_shouldYield())
    ) {
      // 当前的currentTask还没过期，但是当前宏任务事件已经到达执行的最后期限，即我们需要
      // 将控制权交还给浏览器，剩下的任务在下一个事件循环中再继续执行
      console.log("yield");
      break;
    }

    var callback = currentTask.callback;

    if (typeof callback === "function") {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      var continuationCallback = callback(didUserCallbackTimeout);
      currentTime = performance.now();

      if (typeof continuationCallback === "function") {
        // 当前任务还没全部执行完成，需要继续执行，不能从taskQueue中pop掉
        currentTask.callback = continuationCallback;
      } else {
        // 为什么需要做这个判断？这是因为，当我们在callback(didUserCallbackTimeout)这个任务里面
        // 再次调用了unstable_scheduleCallback添加一个更高优先级的任务，此时这个任务会排在taskQueue的第一位
        // 需要立即执行，也就是插队了。这种情况我们不能简单的使用pop(taskQueue)将其删除

        // 如果currentTask === peek(taskQueue)相等，说明没有更高优先级的任务插队
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }

      advanceTimers(currentTime);
    } else {
      pop(taskQueue);
    }

    currentTask = peek(taskQueue);
  }
  if (currentTask !== null) {
    // 如果taskQueue中还有剩余工作，则返回true
    return true;
  } else {
    // 如果taskQueue已经没有工作，同时timerQueue还有工作，则需要启用一个定时器延迟执行
    var firstTimer = peek(timerQueue);

    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }

    return false;
  }
}
// 根据currentTime和options.delay计算任务开始调度的时间startTime
// 根据调度优先级priorityLevel以及startTime计算任务的过期时间expirationTime
// 生成一个task任务对象，将callback、startTime、expirationTime等存储起来
// 判断task是否是延迟任务，如果是延迟执行任务，则加入timerQueue，否则加入
function unstable_scheduleCallback(priorityLevel, callback, options) {
  var currentTime = performance.now();
  var startTime;

  if (typeof options === "object" && options !== null) {
    var delay = options.delay;

    if (typeof delay === "number" && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
  } else {
    startTime = currentTime;
  }

  var timeout;

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

  var expirationTime = startTime + timeout;
  var newTask = {
    id: taskIdCounter++,
    callback: callback,
    priorityLevel: priorityLevel,
    startTime: startTime,
    expirationTime: expirationTime,
    sortIndex: -1,
  };

  if (startTime > currentTime) {
    // This is a delayed task.
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);

    // 如果taskQueue为空，同时新添加的newTask是最早需要执行的延迟任务，则我们需要取消之前的定时器
    // 启动一个更早的定时器
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      // 所有的任务都需要执行，但是新添加的这个newTask是最早需要执行的任务，因此我们需要取消之前的定时器
      // 重新启动一个更早的定时器
      if (isHostTimeoutScheduled) {
        // 取消之前的定时器
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      // 启动一个更早的定时器
      // 开启一个settimeout定时器，startTime - currentTime，其实就是options.delay毫秒后执行handleTimeout
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    // 这里需要isHostCallbackScheduled和isPerformingWork两个开关的原因是，防止在
    // 正在工作中的task中又调度了unstable_scheduleCallback添加任务，而这个任务可能是添加到taskQueue中的，
    // 也可能是添加到timerQueue中延迟执行的
    // 但会存在一种情况，flushwork执行完成，但是还有剩余的任务需要在下一个事件循环中执行。此时的isHostCallbackScheduled
    // 和isPerformingWork都为false，然后再调用unstable_scheduleCallback继续添加一个任务时，就会重新执行
    // requestHostCallback，但是requestHostCallback使用isMessageLoopRunning开关，如果任务还没全部完成
    // 即使再调用requestHostCallback，也不会再开启下一个宏任务事件
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      // 将flushWork保存到scheduledHostCallback
      // 如果isMessageLoopRunning为false，则使用messagechannel的端口2通过postMessage触发一个宏任务，
      // 同时设置isMessageLoopRunning为true
      requestHostCallback(flushWork);
    }
  }

  return newTask;
}
```
