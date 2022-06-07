## ReactDOM.render 以及 setState 触发状态更新主流程

本节主要介绍 react 渲染过程中最主要的两个阶段，即：render 阶段(render phase) 以及 commit 阶段 (commit phase)，这两个阶段的主流程。

render 阶段，通过 setState 或者 ReactDOM.render 触发，主要是调用类组件实例的 render 方法或者执行函数组件获取子元素并进行协调(reconcile or dom diff)，然后找出有副作用的节点，构建副作用链表。render 阶段的结果是一个副作用链表以及一棵 finishedWork 树。这个阶段可以是异步的

commit 阶段，遍历副作用链表并执行真实的 DOM 操作，对真实的 DOM 节点进行增删改移。这个阶段是同步的，一旦开始就不能再中断。

### 主流程源码

```js
/************************************ ReactDOM.render入口 ************************************/
// 1.创建 fiber tree 的容器，即 #root._reactRootContainer._internalRoot，FiberRootNode类型。
// 2.在 #root 上绑定所有支持的原生事件，这也是合成事件的入口
// 3. 调用scheduleUpdateOnFiber开始调度更新。
function render(element, container, callback) {
  return legacyRenderSubtreeIntoContainer(
    null,
    element,
    container,
    false,
    callback
  );
}
// container = document.getElementById('root')
function legacyRenderSubtreeIntoContainer(
  parentComponent,
  children,
  container,
  forceHydrate,
  callback
) {
  let root = (container._reactRootContainer = legacyCreateRootFromDOMContainer(
    container,
    forceHydrate
  ));
  // container._reactRootContainer._internalRoot 就是整个fiber tree的容器。里面包含
  // current和finishedWork属性
  let fiberRoot = root._internalRoot;
  updateContainer(children, fiberRoot, parentComponent, callback);
}
function legacyCreateRootFromDOMContainer(container, forceHydrate) {
  return createLegacyRoot(container, undefined);
}

function createLegacyRoot(container, options) {
  return new ReactDOMBlockingRoot(container, LegacyRoot, options);
}
function ReactDOMBlockingRoot(container, tag, options) {
  this._internalRoot = createRootImpl(container, tag, options);
}

function createRootImpl(container, tag, options) {
  // 创建FiberRootNode节点，注意这并不是一个fiber
  const root = createContainer(container, tag, hydrate);
  // 在根容器上注册所有支持的事件监听器，合成事件的入口
  listenToAllSupportedEvents(container);
  return root;
}

// ReactFiberReconciler的入口
function updateContainer(element, container, parentComponent, callback) {
  const update = createUpdate(eventTime, lane);
  update.payload = {
    element: element, // 根节点的 update.payload存的是整棵 virtual dom 树
  };
  enqueueUpdate(current, update);
  scheduleUpdateOnFiber(current, lane, eventTime);
}

// ReactFiberWorkLoop的入口
// 从当前调度的fiber开始，向上找到根节点，从根节点开始更新
// 任何触发更新的方法，都需要调用 scheduleUpdateOnFiber 开始调度更新，比如 setState
function scheduleUpdateOnFiber(fiber, lane, eventTime) {
  // 找到容器，从根节点开始更新
  const root = markUpdateLaneFromFiberToRoot(fiber, lane); //返回的是FiberRootNode，即 fiber 树的容器
  performSyncWorkOnRoot(root);
}

function performSyncWorkOnRoot(root) {
  // render阶段的入口
  renderRootSync(root, lanes);
  // render阶段完成后得到一棵finishedWork tree以及副作用链表(effect list)
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  // commit阶段开始
  commitRoot(root);
}

/************************************ render phase(render阶段) ************************************/
function renderRootSync(root, lanes) {
  prepareFreshStack(root, lanes);
  workLoopSync();
}
function prepareFreshStack(root, lanes) {
  root.finishedWork = null;
  workInProgressRoot = root;
  workInProgress = createWorkInProgress(root.current, null);
}
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
function performUnitOfWork(unitOfWork) {
  // The current, flushed, state of this fiber is the alternate. Ideally
  // nothing should rely on this, but relying on it here means that we don't
  // need an additional field on the work in progress.
  let current = unitOfWork.alternate;
  const next = beginWork(current, unitOfWork, subtreeRenderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    // If this doesn't spawn new work, complete the current work.
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ClassComponent: {
      return updateClassComponent(current, workInProgress);
    }
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
  }
}
function updateClassComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes
) {
  const instance = workInProgress.stateNode;
  if (instance === null) {
    // 1.初始化类组件实例instance
    // 2.初始化实例的instance.updater = classComponentUpdater，包含enqueueSetState等更新方法
    // 3.关联fiber和实例：workInprogress.stateNode = instance。instances._reactInternals = workInprogress
    constructClassInstance(workInProgress, Component, nextProps);
    // 1.initializeUpdateQueue初始化更新队列updateQueue
    // 2.processUpdateQueue计算更新队列，获取最新的state
    // 3.根据最新的state调用getDerivedStateFromProps静态生命周期方法
    // 4.调用componentWillMount生命周期方法
    // 5.如果类组件实现了 componentDidMount 生命周期方法，则更新flags： workInProgress.flags |= Update = 6
    mountClassInstance(workInProgress, Component, nextProps);
  } else if (current === null) {
  } else {
    shouldUpdate = updateClassInstance(
      current,
      workInProgress,
      Component,
      nextProps,
      renderLanes
    );
  }
  // 1.调用类组件实例的render方法获取子元素：instance.render()
  // 2.更新flags：workInProgress.flags |= PerformedWork = 7
  // 3. 协调子元素reconcileChildren
  return finishClassComponent(
    current,
    workInProgress,
    Component,
    shouldUpdate,
    hasContext,
    renderLanes
  );
}
function finishClassComponent(
  current,
  workInProgress,
  Component,
  shouldUpdate,
  hasContext,
  renderLanes
) {
  nextChildren = instance.render();
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  workInProgress.memoizedState = instance.state;
  return workInProgress.child;
}
function updateHostRoot(current, workInProgress, renderLanes) {
  cloneUpdateQueue(current, workInProgress);
  processUpdateQueue(workInProgress, nextProps, null, renderLanes);
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```
