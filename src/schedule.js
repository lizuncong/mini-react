/***************** debugger packages/scheduler/SchedulerMinHeap.js start *****************/
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
/***************** debugger packages/scheduler/SchedulerMinHeap.js end *****************/

/***************** debugger packages/scheduler/SchedulerHostConfig.js start *****************/

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
    // 在 yieldInterval 毫秒后让出控制权
    deadline = currentTime + yieldInterval;
    var hasTimeRemaining = true;

    try {
      var hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);

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
function requestHostCallback(callback) {
  scheduledHostCallback = callback;

  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null);
  }
}

// 实际上，在这里callback永远都是handleTimeout，也就是将handletimeout放入定时器，ms毫秒后执行
function requestHostTimeout(callback, ms) {
  taskTimeoutID = setTimeout(function () {
    callback(performance.now());
  }, ms);
}

function cancelHostTimeout() {
  clearTimeout(taskTimeoutID);

  taskTimeoutID = -1;
}

/***************** debugger packages/scheduler/SchedulerHostConfig.js end *****************/

/***************** debugger packages/scheduler/SchedulerPriorities.js start *****************/
// Scheduler调度优先级
var ImmediatePriority = 1;
var UserBlockingPriority = 2;
var NormalPriority = 3;
var LowPriority = 4;
var IdlePriority = 5;
/***************** debugger packages/scheduler/SchedulerPriorities.js end *****************/

/***************** debugger packages/scheduler/Scheduler.js start *****************/

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

function advanceTimers(currentTime) {
  // Check for tasks that are no longer delayed and add them to the queue.
  var timer = peek(timerQueue);

  while (timer !== null) {
    if (timer.callback === null) {
      // Timer was cancelled.
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      // Timer fired. Transfer to the task queue.
      pop(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else {
      // Remaining timers are pending.
      return;
    }

    timer = peek(timerQueue);
  }
}

function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);

  if (!isHostCallbackScheduled) {
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

function flushWork(hasTimeRemaining, initialTime) {
  isHostCallbackScheduled = false;

  if (isHostTimeoutScheduled) {
    // We scheduled a timeout but it's no longer needed. Cancel it.
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
      // This currentTask hasn't expired, and we've reached the deadline.
      console.log('yield')
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
        currentTask.callback = continuationCallback;
      } else {
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }

      advanceTimers(currentTime);
    } else {
      pop(taskQueue);
    }

    currentTask = peek(taskQueue);
  } // Return whether there's additional work

  if (currentTask !== null) {
    return true;
  } else {
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

    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      // All tasks are delayed, and this is the task with the earliest delay.
      if (isHostTimeoutScheduled) {
        // Cancel an existing timeout.
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }

      // 开启一个settimeout定时器，startTime - currentTime，其实就是options.delay毫秒后执行handleTimeout
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    // wait until the next time we yield.

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

/***************** debugger packages/scheduler/Scheduler.js end *****************/
