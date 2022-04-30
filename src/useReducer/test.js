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

const SyncLanePriority = 12;
const NoLanePriority = 0;
const NoContext = 0;
const BatchedContext = 1;
let executionContext = NoContext;
let syncQueue = [];

function ensureRootIsScheduled(root) {
  // const nextLanes = SyncLane
  // const newCallbackPriority = SyncLanePriority // 按理说应该等于最高级别赛道的优先级
  const existingCallbackPriority = root.callbackPriority; // 当前根节点上正在执行的更新任务的优先级
  if (existingCallbackPriority === newCallbackPriority) {
    // 在并发模式下，即使在setTimeout里也是批量的
    return; // 如果这个新的更新和当前根节点的已经调度的更新相等，那就直接返回，复用上次的更新。不再创建新的更新
  }
  // scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root))
  // queueMicrotask(flushSyncCallbackQueue)
  // root.callbackPriority = newCallbackPriority
  newCallbackNode = scheduleSyncCallback(
    performSyncWorkOnRoot.bind(null, root)
  );
}

function flushSyncCallbackQueue() {
  syncQueue.forEach((cb) => cb());
  syncQueue = null;
}

// 真正的渲染任务
function performSyncWorkOnRoot(workInProgress) {
  let root = workInProgress;
  while (workInProgress) {
    if (workInProgress.tag === ClassComponent) {
      const inst = workInProgress.stateNode; // 获取此Fiber对应的类组件的实例
      inst.state = processUpdateQueue(inst, workInProgress);
      inst.render(); // 得到新状态后，就可以调用render方法得到新的虚拟dom，进行dom diff，更新dom
    }
    workInProgress = workInProgress.child;
  }
  commitRoot(root);
}

function commitRoot(root) {
  root.callbackPriority = NoLanePriority;
}

// 根据老状态和更新队列计算新状态
function processUpdateQueue(inst, fiber) {
  return fiber.updateQueue.reduce((state, { payload }) => {
    if (typeof payload === "function") {
      payload = payload(state);
    }
    return { ...state, ...payload };
  }, inst.state);
}

function markUpdateLaneFromFiberToRoot(sourceFiber, lane) {
  var node = sourceFiber;
  var parent = sourceFiber.return;

  while (parent !== null) {
    node = parent;
    parent = parent.return;
  }

  if (node.tag === HostRoot) {
    var root = node.stateNode;
    return root;
  } else {
    return null;
  }
}
