/***************** debugger packages/scheduler/SchedulerHostConfig.js start *****************/

var requestHostCallback;
var requestHostTimeout;
var cancelHostTimeout;
var requestPaint;

var unstable_now = function () {
    return performance.now();
};

var _setTimeout = window.setTimeout;
var _clearTimeout = window.clearTimeout;
var requestAnimationFrame = window.requestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame;

var isMessageLoopRunning = false;
var scheduledHostCallback = null;
var taskTimeoutID = -1;
// Scheduler periodically yields in case there is other work on the main
// thread, like user events. By default, it yields multiple times per frame.
// It does not attempt to align with frame boundaries, since most tasks don't
// need to be frame aligned; for those that do, use requestAnimationFrame.

var yieldInterval = 5;
var deadline = 0; // TODO: Make this configurable

// `isInputPending` is not available. Since we have no way of knowing if
// there's pending input, always yield at the end of the frame.
var unstable_shouldYield = function () {
    return unstable_now() >= deadline;
}; // Since we yield every frame regardless, `requestPaint` has no effect.

requestPaint = function () { };

var unstable_forceFrameRate = function (fps) {
    if (fps < 0 || fps > 125) {
        // Using console['error'] to evade Babel and ESLint
        console["error"](
            "forceFrameRate takes a positive int between 0 and 125, " +
            "forcing frame rates higher than 125 fps is not supported"
        );
        return;
    }

    if (fps > 0) {
        yieldInterval = Math.floor(1000 / fps);
    } else {
        // reset the framerate
        yieldInterval = 5;
    }
};

var performWorkUntilDeadline = function () {
    if (scheduledHostCallback !== null) {
        var currentTime = unstable_now();
        // Yield after `yieldInterval` ms, regardless of where we are in the vsync
        // cycle. This means there's always time remaining at the beginning of
        // the message event.

        deadline = currentTime + yieldInterval;
        var hasTimeRemaining = true;

        try {
            var hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);

            if (!hasMoreWork) {
                isMessageLoopRunning = false;
                scheduledHostCallback = null;
            } else {
                // If there's more work, schedule the next message event at the end
                // of the preceding one.
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
    } // Yielding to the browser will give it a chance to paint, so we can
};

var channel = new MessageChannel();
var port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

requestHostCallback = function (callback) {
    scheduledHostCallback = callback;

    if (!isMessageLoopRunning) {
        isMessageLoopRunning = true;
        port.postMessage(null);
    }
};

requestHostTimeout = function (callback, ms) {
    taskTimeoutID = _setTimeout(function () {
        callback(unstable_now());
    }, ms);
};

cancelHostTimeout = function () {
    _clearTimeout(taskTimeoutID);

    taskTimeoutID = -1;
};

/***************** debugger packages/scheduler/SchedulerHostConfig.js end *****************/

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

/***************** debugger packages/scheduler/SchedulerPriorities.js start *****************/
// TODO: Use symbols?
var ImmediatePriority = 1;
var UserBlockingPriority = 2;
var NormalPriority = 3;
var LowPriority = 4;
var IdlePriority = 5;
/***************** debugger packages/scheduler/SchedulerPriorities.js end *****************/
/***************** debugger packages/scheduler/SchedulerProfiling.js start *****************/

function markTaskErrored(task, ms) { }
/***************** debugger packages/scheduler/SchedulerProfiling.js end *****************/
/***************** debugger packages/scheduler/Scheduler.js start *****************/

/* eslint-disable no-var */
// Math.pow(2, 30) - 1
// 0b111111111111111111111111111111

var maxSigned31BitInt = 1073741823; // Times out immediately

var IMMEDIATE_PRIORITY_TIMEOUT = -1; // Eventually times out

var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
var NORMAL_PRIORITY_TIMEOUT = 5000;
var LOW_PRIORITY_TIMEOUT = 10000; // Never times out

var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt; // Tasks are stored on a min heap

var taskQueue = [];
var timerQueue = []; // Incrementing id counter. Used to maintain insertion order.

var taskIdCounter = 1; // Pausing the scheduler is useful for debugging.
var currentTask = null;
var currentPriorityLevel = NormalPriority; // This is set while performing work, to prevent re-entrancy.

var isPerformingWork = false;
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
            break;
        }

        var callback = currentTask.callback;

        if (typeof callback === "function") {
            currentTask.callback = null;
            currentPriorityLevel = currentTask.priorityLevel;
            var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;

            var continuationCallback = callback(didUserCallbackTimeout);
            currentTime = unstable_now();

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

function unstable_runWithPriority(priorityLevel, eventHandler) {
    switch (priorityLevel) {
        case ImmediatePriority:
        case UserBlockingPriority:
        case NormalPriority:
        case LowPriority:
        case IdlePriority:
            break;

        default:
            priorityLevel = NormalPriority;
    }

    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = priorityLevel;

    try {
        return eventHandler();
    } finally {
        currentPriorityLevel = previousPriorityLevel;
    }
}

function unstable_next(eventHandler) {
    var priorityLevel;

    switch (currentPriorityLevel) {
        case ImmediatePriority:
        case UserBlockingPriority:
        case NormalPriority:
            // Shift down to normal priority
            priorityLevel = NormalPriority;
            break;

        default:
            // Anything lower than normal priority should remain at the current level.
            priorityLevel = currentPriorityLevel;
            break;
    }

    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = priorityLevel;

    try {
        return eventHandler();
    } finally {
        currentPriorityLevel = previousPriorityLevel;
    }
}

function unstable_wrapCallback(callback) {
    var parentPriorityLevel = currentPriorityLevel;
    return function () {
        // This is a fork of runWithPriority, inlined for performance.
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = parentPriorityLevel;

        try {
            return callback.apply(this, arguments);
        } finally {
            currentPriorityLevel = previousPriorityLevel;
        }
    };
}

function unstable_scheduleCallback(priorityLevel, callback, options) {
    var currentTime = unstable_now();
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
            } // Schedule a timeout.

            requestHostTimeout(handleTimeout, startTime - currentTime);
        }
    } else {
        newTask.sortIndex = expirationTime;
        push(taskQueue, newTask);
        // wait until the next time we yield.

        if (!isHostCallbackScheduled && !isPerformingWork) {
            isHostCallbackScheduled = true;
            requestHostCallback(flushWork);
        }
    }

    return newTask;
}

function unstable_pauseExecution() { }

function unstable_continueExecution() {
    if (!isHostCallbackScheduled && !isPerformingWork) {
        isHostCallbackScheduled = true;
        requestHostCallback(flushWork);
    }
}

function unstable_getFirstCallbackNode() {
    return peek(taskQueue);
}

function unstable_cancelCallback(task) {
    // remove from the queue because you can't remove arbitrary nodes from an
    // array based heap, only the first one.)

    task.callback = null;
}

function unstable_getCurrentPriorityLevel() {
    return currentPriorityLevel;
}

var unstable_requestPaint = requestPaint;
var unstable_Profiling = null;

var unstable_IdlePriority = IdlePriority;
var unstable_ImmediatePriority = ImmediatePriority;
var unstable_LowPriority = LowPriority;
// var unstable_NormalPriority = NormalPriority;
var unstable_Profiling = unstable_Profiling;
var unstable_UserBlockingPriority = UserBlockingPriority;
var unstable_cancelCallback = unstable_cancelCallback;
var unstable_continueExecution = unstable_continueExecution;
var unstable_getCurrentPriorityLevel = unstable_getCurrentPriorityLevel;
var unstable_getFirstCallbackNode = unstable_getFirstCallbackNode;
var unstable_next = unstable_next;
var unstable_pauseExecution = unstable_pauseExecution;
var unstable_requestPaint = unstable_requestPaint;
var unstable_runWithPriority = unstable_runWithPriority;
// var unstable_scheduleCallback = unstable_scheduleCallback;
var unstable_wrapCallback = unstable_wrapCallback;
/***************** debugger packages/scheduler/Scheduler.js end *****************/
