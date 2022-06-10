### commitRootImpl

```js
let nextEffect;
function commitRootImpl(root, renderPriorityLevel) {
  const finishedWork = root.finishedWork;
  root.finishedWork = null;
  let firstEffect;
  // firstEffect不为空，说明存在副作用链表
  if (firstEffect !== null) {
    // The commit phase is broken into several sub-phases. We do a separate pass
    // of the effect list for each phase: all mutation effects come before all
    // layout effects, and so on.
    // The first phase a "before mutation" phase. We use this phase to read the
    // state of the host tree right before we mutate it. This is where
    // getSnapshotBeforeUpdate is called.
    // commie阶段被划分成多个小阶段。每个阶段都从头开始遍历整个副作用链表
    nextEffect = firstEffect;
    // 第一个阶段，调用getSnapshotBeforeUpdate等生命周期方法
    commitBeforeMutationEffects();
    // The next phase is the mutation phase, where we mutate the host tree.
    // 重置 nextEffect，从头开始
    nextEffect = firstEffect;
    commitMutationEffects(root, renderPriorityLevel);
    // The work-in-progress tree is now the current tree. This must come after
    // the mutation phase, so that the previous tree is still current during
    // componentWillUnmount, but before the layout phase, so that the finished
    // work is current during componentDidMount/Update.
    root.current = finishedWork;
    // The next phase is the layout phase, where we call effects that read
    // the host tree after it's been mutated. The idiomatic use case for this is
    // layout, but class component lifecycles also fire here for legacy reasons.
    // 重置 nextEffect，从头开始
    nextEffect = firstEffect;
    commitLayoutEffects(root, lanes);
  }
}
```

### commitBeforeMutationEffects

这个函数主要是在 DOM 变更前执行，主要逻辑如下：

- 调用 类组件的 getSnapshotBeforeUpdate 生命周期方法
- 启动一个微任务以刷新 passive effects，即 useEffect 的回调

```js
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    commitBeforeMutationLifeCycles(current, nextEffect);
    // If there are passive effects, schedule a callback to flush at
    // the earliest opportunity.
    scheduleCallback(NormalPriority$1, function () {
      flushPassiveEffects();
      return null;
    });
    nextEffect = nextEffect.nextEffect;
  }
}
function commitBeforeMutationLifeCycles(current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent:
      return;
    case ClassComponent:
      instance.getSnapshotBeforeUpdate(prevProps, prevState);
      return;
    case HostRoot:
      // 这个方法其实也没干啥事
      clearContainer(root.containerInfo);
      return;
    case HostComponent:
    case HostText:
      // Nothing to do for these component types
      return;
  }
}
```

### commitMutationEffects

这个函数操作 DOM，主要有三个方法：

- commitPlacement。调用 `parentNode.appendChild(child);` 或者 `container.insertBefore(child, beforeChild)` 插入 DOM 节点
- commitWork。commitWork 最重要的是里面的 `commitHookEffectListUnmount` 方法，函数组件 `useLayoutEffect` 的`清除函数`就是在这个时候被调用的，这是同步调用的

```js
useLayoutEffect(() => {
  document.getElementById("useLayoutEffect").innerText =
    "useLayoutEffect：" + count;
  const clear = () => {
    console.log("use layout effect 清除 ===========");
  };
  return clear;
});
```

- commitDeletion。主要是删除 DOM 节点，以及调用当前节点以及子节点所有的 `componentWillUnmount` 生命周期方法
  - 同步调用函数组件的 `useLayoutEffect` 的 `清除函数`，这是同步执行的
  - 将函数组件的 `useEffect` 的 `清除函数` 添加进异步刷新队列，这是异步执行的
  - 同步调用类组件的 `componentWillUnmount` 生命周期方法

```js
function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    // The following switch statement is only concerned about placement,
    // updates, and deletions. To avoid needing to add a case for every possible
    // bitmap value, we remove the secondary effects from the effect tag and
    // switch on that value.
    const primaryFlags = flags & (Placement | Update | Deletion | Hydrating);
    switch (primaryFlags) {
      case PlacementAndUpdate: {
        // Placement
        commitPlacement(nextEffect);
        // Clear the "placement" from effect tag so that we know that this is
        // inserted, before any life-cycles like componentDidMount gets called.
        commitWork(_current, nextEffect);
        break;
      }
      case Deletion: {
        commitDeletion(root, nextEffect);
        break;
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
function commitPlacement(finishedWork) {
  var parentFiber = getHostParentFiber(finishedWork);
  // Note: these two variables *must* always be updated together.
  var parent;
  var isContainer;
  var parentStateNode = parentFiber.stateNode;

  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentStateNode;
      isContainer = false;
      break;
  }
  var before = getHostSibling(finishedWork);
  // We only have the top Fiber that was inserted but we need to recurse down its
  // children to find all the terminal nodes.
  if (isContainer) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
  } else {
    insertOrAppendPlacementNode(finishedWork, before, parent);
  }
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  if (before) {
    insertInContainerBefore(parent, stateNode, before);
  } else {
    appendChildToContainer(parent, stateNode);
  }
}
function commitWork(current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      // Layout effects are destroyed during the mutation phase so that all
      // destroy functions for all fibers are called before any create functions.
      // This prevents sibling component effects from interfering with each other,
      // e.g. a destroy function in one component should never override a ref set
      // by a create function in another component during the same commit.
      commitHookEffectListUnmount(Layout | HasEffect, finishedWork);
      return;
    }
    case ClassComponent:
      // 可以看到 类组件 在这里是不执行任何操作的
      return;
  }
}
// 执行函数组件的 useLayoutEffect 监听函数的回调，即清除函数
function commitHookEffectListUnmount(tag, finishedWork) {
  do {
    // Unmount
    var destroy = effect.destroy;
    effect.destroy = undefined;
    destroy(); // 执行 useLayoutEffect 的清除函数
    effect = effect.next;
  } while (effect !== firstEffect);
}
function commitDeletion(finishedRoot, current, renderPriorityLevel) {
  // Recursively delete all host nodes from the parent.
  // Detach refs and call componentWillUnmount() on the whole subtree.
  unmountHostComponents(finishedRoot, current);
}
function unmountHostComponents(finishedRoot, current, renderPriorityLevel) {
  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      commitNestedUnmounts(finishedRoot, node);
      // After all the children have unmounted, it is now safe to remove the
      // node from the tree.
      if (currentParentIsContainer) {
        // 调用 container.parentNode.removeChild(child); 或者 container.removeChild(child); 删除节点
        removeChildFromContainer(currentParent, node.stateNode);
      } else {
        // 内部执行 parentInstance.removeChild(child); 删除节点
        removeChild(currentParent, node.stateNode);
      }
    } else if (node.tag === DehydratedFragment) {
    } else if (node.tag === HostPortal) {
    } else {
      commitUnmount(finishedRoot, node);
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}
function commitUnmount(finishedRoot, current, renderPriorityLevel) {
  switch (current.tag) {
    case FunctionComponent: {
      do {
        if (destroy !== undefined) {
          if ((tag & Passive$1) !== NoFlags$1) {
            // 将 useEffect 的清除函数添加进异步刷新队列，useEffect 的清除函数是异步执行的
            enqueuePendingPassiveHookEffectUnmount(current, effect);
          } else {
            // 调用 useLayoutEffect 的清除函数，同步执行的
            // 其实就是直接调用destroy();
            safelyCallDestroy(current, destroy);
          }
        }
        effect = effect.next;
      } while (effect !== firstEffect);
      return;
    }
    case ClassComponent: {
      if (typeof instance.componentWillUnmount === "function") {
        // 直接调用类组件的 componentWillUnmount() 生命周期方法，同步执行
        safelyCallComponentWillUnmount(current, instance);
      }
      return;
    }
  }
}
```

### commitLayoutEffects

```js
function commitLayoutEffects(root, committedLanes) {
  while (nextEffect !== null) {
    commitLifeCycles(root, current, nextEffect);
    {
      if (flags & Ref) {
        commitAttachRef(nextEffect);
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```
