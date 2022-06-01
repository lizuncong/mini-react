以下是根据 react16 整理的 render 阶段和 commit 阶段涉及的主要函数。在阅读源码的过程中，可以在这些函数的入口处打断点调试。
接下来会根据 react17 整理 render 阶段和 commit 阶段主流程的主要函数


react-dom/client/ReactDOMHostConfig.js是react-dom和react-reconciler的桥梁。react-reconciler中
使用的很多dom相关的api都是从ReactDOMHostConfig.js文件中暴露出来。
```js
// render阶段总是从 renderRoot 函数开始
// render阶段的目标是根据新的 react element tree 和当前页面对应的旧的fiber tree进行dom diff，找出
// 有副作用的节点，并构建副作用链表
function workLoop(isYieldy) {
  if (!isYieldy) {
    while (nextUnitOfWork !== null) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  } else {
  }
}

function performUnitOfWork(workInProgress) {
  let next = beginWork(workInProgress);
  workInProgress.memoizedProps = workInProgress.pendingProps;
  if (next === null) {
    next = completeUnitOfWork(workInProgress);
  }
  return next;
}
function beginWork(current$$1, workInProgress) {
  //...
  switch (workInProgress.tag) {
    //...
    case FunctionalComponent: {
      //...
    }
    case ClassComponent: {
      //...
      return updateClassComponent(current$$1, workInProgress);
    }
    case HostComponent: {
      // ...
      return updateHostComponent(current, workInProgress);
    }
    // case ...
  }
}
function updateClassComponent(current, workInProgress, Component) {
  //...
  const instance = workInProgress.stateNode;
  let shouldUpdate;
  if (instance === null) {
    //...
    // In the initial pass we might need to construct the instance.
    constructClassInstance(workInProgress, Component);
    mountClassInstance(workInProgress, Component);
    shouldUpdate = true;
  } else if (current === null) {
    // In a resume, we'll already have an instance we can reuse.
    shouldUpdate = resumeMountClassInstance(workInProgress, Component);
  } else {
    shouldUpdate = updateClassInstance(current, workInProgress);
  }

  // finishClassComponent调用组件实例上的render方法，并协调返回的子元素
  return finishClassComponent(current, workInProgress, Component, shouldUpdate);
}
function updateClassInstance(current, workInProgress, ctor, newProps) {
  const instance = workInProgress.stateNode;

  const oldProps = workInProgress.memoizedProps;
  instance.props = oldProps;
  if (oldProps !== newProps) {
    callComponentWillReceiveProps(workInProgress, instance, newProps);
  }

  let updateQueue = workInProgress.updateQueue;
  if (updateQueue !== null) {
    processUpdateQueue(workInProgress, updateQueue);
    newState = workInProgress.memoizedState;
  }

  applyDerivedStateFromProps(workInProgress);
  newState = workInProgress.memoizedState;

  const shouldUpdate = checkShouldComponentUpdate(workInProgress, ctor);
  if (shouldUpdate) {
    instance.componentWillUpdate(newProps, newState, nextContext);
    workInProgress.effectTag |= Update;
    workInProgress.effectTag |= Snapshot;
  }

  instance.props = newProps;
  instance.state = newState;

  return shouldUpdate;
}

// React 在 completeUnitOfWork 函数中构造副作用链表
function completeUnitOfWork(workInProgress) {
  while (true) {
    let returnFiber = workInProgress.return;
    let siblingFiber = workInProgress.sibling;

    nextUnitOfWork = completeWork(workInProgress);

    if (siblingFiber !== null) {
      // If there is a sibling, return it
      // to perform work for this sibling
      return siblingFiber;
    } else if (returnFiber !== null) {
      // If there's no more work in this returnFiber,
      // continue the loop to complete the parent.
      workInProgress = returnFiber;
      continue;
    } else {
      // We've reached the root.
      return null;
    }
  }
}

// completeWork主要工作：
// 更新组件的state
// 调用render方法获取子元素列表并进行比较
// 更新子元素的props属性
function completeWork(current, workInProgress) {
  //...
  switch (workInProgress.tag) {
    case FunctionComponent: {
      //...
    }
    case ClassComponent: {
      //...
    }
    case HostComponent: {
      //...
      updateHostComponent(current, workInProgress);
    }
    //case ...
  }
}

/************************************** 以下是commit阶段 **************************************/
// commit提交阶段，从completeRoot函数开始。在 commit 阶段运行的主要函数是 commitRoot
// 更新 dom节点
// 调用 生命周期方法
function commitRoot(root, finishedWork) {
  commitBeforeMutationLifecycles();
  commitAllHostEffects();
  root.current = finishedWork;
  commitAllLifeCycles();
}

function commitBeforeMutationLifecycles() {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;
    if (effectTag & Snapshot) {
      const current = nextEffect.alternate;
      commitBeforeMutationLifeCycles(current, nextEffect);
    }
    nextEffect = nextEffect.nextEffect;
  }
}

function commitAllHostEffects() {
  switch (primaryEffectTag) {
    case Placement: {
      commitPlacement(nextEffect);
      // ...
    }
    case PlacementAndUpdate: {
      commitPlacement(nextEffect);
      commitWork(current, nextEffect);
      //...
    }
    case Update: {
      commitWork(current, nextEffect);
      //...
    }
    case Deletion: {
      commitDeletion(nextEffect);
      //...
    }
  }
}

// commitWork函数最终会调用updateDOMProperties
function updateDOMProperties(domElement, updatePayload) {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if (propKey === STYLE) {
      //...
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      //...
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    } else {
      //...
    }
  }
}

function commitAllLifeCycles(finishedRoot) {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;

    if (effectTag & (Update | Callback)) {
      const current = nextEffect.alternate;
      commitLifeCycles(finishedRoot, current, nextEffect);
    }

    if (effectTag & Ref) {
      commitAttachRef(nextEffect);
    }

    nextEffect = nextEffect.nextEffect;
  }
}

function commitLifeCycles(finishedRoot, current) {
  //...
  switch (finishedWork.tag) {
    case FunctionComponent: {
      //...
    }
    case ClassComponent: {
      const instance = finishedWork.stateNode;
      if (finishedWork.effectTag & Update) {
        if (current === null) {
          instance.componentDidMount();
        } else {
          //...
          instance.componentDidUpdate(prevProps, prevState);
        }
      }
    }
    case HostComponent: {
      //...
    }
    // case ...
  }
}
```
