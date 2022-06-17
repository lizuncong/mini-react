## React Fiber 支持的所有 flags

```js
// 下面两个运用于 React Dev Tools，不能更改他们的值
const NoFlags = 0b000000000000000000;
const PerformedWork = 0b000000000000000001;

// 下面的 flags 用于标记副作用
const Placement = 0b000000000000000010; // 2
const Update = 0b000000000000000100; // 4
const PlacementAndUpdate = 0b000000000000000110; // 6
const Deletion = 0b000000000000001000; // 8
//const ContentReset = 0b000000000000010000; // 16
const Callback = 0b000000000000100000; // 32
const DidCapture = 0b000000000001000000; // 64
//const Ref = 0b000000000010000000; // 128
const Snapshot = 0b000000000100000000; // 256
const Passive = 0b000000001000000000; // 512
const Hydrating = 0b000000010000000000; // 1024
//const HydratingAndUpdate =  0b000000010000000100; // 1028

// Passive & Update & Callback & Ref & Snapshot
// const LifecycleEffectMask = 0b000000001110100100; // 932

// Union of all host effects
// const HostEffectMask = 0b000000011111111111; // 2047

// These are not really side effects, but we still reuse this field.
// const Incomplete = 0b000000100000000000; // 2048
const ShouldCapture = 0b000001000000000000; // 4096
// const ForceUpdateForLegacySuspense = 0b000100000000000000; // 16384
```

## 类组件

### this.setState 第二个参数 callback：beginWork 阶段

在 `processUpdateQueue` 方法中，如果 update.callback 不为空，说明我们在调用 `this.setState(arg, callback)` 时，传了第二个参数 `callback`。因此需要在 `processUpdateQueue` 中更新 flags：

```js
workInProgress.flags |= Callback; // Callback 32
```

### componentDidMount：beginWork 阶段

在 `mountClassInstance` 或者 `resumeMountClassInstance` 方法内部，会判断类组件如果实现了 `componentDidMount`，则更新 flags：

```js
if (typeof instance.componentDidMount === "function") {
  workInProgress.flags |= Update; // 4
}
```

### componentDidUpdate：beginWork 阶段

在 `updateClassInstance` 方法内部，会判断类组件如果实现了 `componentDidUpdate`，则更新 flags：

```js
if (typeof instance.componentDidUpdate === "function") {
  workInProgress.flags |= Update; // 4
}
```

### getSnapshotBeforeUpdate：beginWork 阶段

在 `updateClassInstance` 方法内部，会判断类组件如果实现了 `getSnapshotBeforeUpdate`，则更新 flags：

```js
if (typeof instance.getSnapshotBeforeUpdate === "function") {
  workInProgress.flags |= Snapshot; // 256
}
```

### updateClassComponent：beginWork 阶段

在 `updateClassComponent` 方法中，如果 `instance == null` 以及 `current === null`，说明类组件第一次渲染，更新 flags：

```js
if (instance === null) {
  if (current !== null) {
    // Since this is conceptually a new fiber, schedule a Placement effect
    workInProgress.flags |= Placement; // 2
  }
}
```

### finishClassComponent：beginWork 阶段

在 `finishClassComponent` 函数中，调用完类组件实例的 `render` 方法后：

```js
workInProgress.flags |= PerformedWork; // PerformedWork 对应的值为1
```

### mountIncompleteClassComponent：beginWork 阶段

在 `mountIncompleteClassComponent` 方法中，更新 flags：

```js
if (_current !== null) {
  // Since this is conceptually a new fiber, schedule a Placement effect
  workInProgress.flags |= Placement; // 2
}
```

`mountIncompleteClassComponent` 在 `beginWork` 函数中的 `IncompleteClassComponent` 分支调用

## 函数组件

### useEffect：beginWork 阶段

第一次渲染时，调用 `mountEffectImpl` 方法，更新 flags：

```js
const fiberflags = Update | Passive;
currentlyRenderingFiber.flags |= fiberflags; // Update 4 Passive 512
```

更新阶段，调用 `updateEffectImpl` 方法，更新 flags：

```js
const fiberflags = Update | Passive;
currentlyRenderingFiber.flags |= fiberflags;
```

### useLayoutEffect：beginWork 阶段

第一次渲染时，调用 `mountEffectImpl` 方法，更新 flags：

```js
currentlyRenderingFiber.flags |= Update; // Update 4
```

更新阶段，调用 `updateEffectImpl` 方法，更新 flags：

```js
currentlyRenderingFiber.flags |= Update; // Update 4
```

### useImperativeHandle：beginWork 阶段

第一次渲染时，调用 `mountEffectImpl` 方法，更新 flags：

```js
currentlyRenderingFiber.flags |= Update; // Update 4
```

更新阶段，调用 `updateEffectImpl` 方法，更新 flags:

```js
currentlyRenderingFiber.flags |= Update; // Update 4
```

### useOpaqueIdentifier：beginWork 阶段

第一次渲染时，调用 `mountOpaqueIdentifier` 方法，更新 flags：

```js
if ((currentlyRenderingFiber.mode & BlockingMode) === NoMode) {
  currentlyRenderingFiber.flags |= Update | Passive; // Update 4  Passive 512
}
```

### updateFunctionComponent：beginWork 阶段

在 `updateFunctionComponent` 函数中，当调用完成函数组件获取新的 react element 子元素以后，改变 fiber flags 的值：

```js
workInProgress.flags |= PerformedWork; // PerformedWork对应的值为1
```

### mountIndeterminateComponent：beginWork 阶段

```js
if (_current !== null) {
  // Since this is conceptually a new fiber, schedule a Placement effect
  workInProgress.flags |= Placement;
}
```

`mountIndeterminateComponent` 在 `beginWork` 函数中的 `IndeterminateComponent` 分支调用

## HostRoot

### clearContainer: completeUnitOfWork 阶段

在 `completeWork` 函数中的 `HostRoot` 分支，判断如果是第一次渲染，则清空容器：

```js
if (current === null || current.child === null) {
  if (wasHydrated) {
  } else if (!fiberRoot.hydrate) {
    // Schedule an effect to clear this container at the start of the next commit.
    // This handles the case of React rendering into a container with previous children.
    // It's also safe to do for updates too, because current.child would only be null
    // if the previous render was null (so the the container would already be empty).
    workInProgress.flags |= Snapshot; // 256
  }
}
```

## HostComponent

### updateHostComponent：beginWork 阶段

在 `updateHostComponent` 方法中，会判断是否需要重置文本节点：

```js
if (isDirectTextChild) {
} else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
  // If we're switching from a direct text child to a normal child, or to
  // empty, we need to schedule the text content to be reset.
  workInProgress.flags |= ContentReset; // 16
}
```

`updateHostComponent` 在 `beginWork` 函数的 `HostComponent` 分支调用

### updateHostComponent：completeUnitOfWork 阶段

在 completeUnitOfWork 阶段，调用 prepareUpdate 方法比较 fiber 节点的 oldProps 和 newProps，收集变更的属性的 `键值对` 存储在 fiber.updateQueue 中。如果 fiber.updateQueue 不为 null，则需要更新 fiber.flags：

```js
workInProgress.flags |= Update; // Update对应的值是4
```

### shouldAutoFocusHostComponent: completeUnitOfWork 阶段

在 completeWork 的 `HostComponent` 分支中，会判断元素是否需要聚焦：

```js
// Certain renderers require commit-time effects for initial mount.
// (eg DOM renderer supports auto-focus for certain elements).
// Make sure such renderers get scheduled for later work.

if (shouldAutoFocusHostComponent) {
  workInProgress.flags |= Update; // Update对应的值是4
}
```

### markRef: completeUnitOfWork 阶段

在 completeWork 的 `HostComponent` 分支中：

```js
if (current.ref !== workInProgress.ref) {
  workInProgress.flags |= Ref; // 128
}
```

## HostText

### updateHostText: completeUnitOfWork 阶段

在 completeUnitOfWork 阶段，调用 updateHostText，比较新旧文本是否相同，如果不同，则更新 fiber.flags：

```js
workInProgress.flags |= Update; // Update对应的值是4
```

## Reconcile Children: beginWork 阶段

reconcile children 的逻辑都在 `ChildReconciler(shouldTrackSideEffects)` 函数中。

### 删除子节点

在 `deleteChild` 方法中，如果子节点需要被删除，则更新子节点的 flags：

```js
childToDelete.flags = Deletion; // 8
```

### 移动节点

在 `placeChild` 方法中，如果 `oldIndex` 小于 `lastPlacedIndex`，则说明子节点需要移动，更新 flags：

```js
if (oldIndex < lastPlacedIndex) {
  // 这是一个移动
  newFiber.flags = Placement; // 2
  return lastPlacedIndex;
}
```

### 新节点插入

在 `placeChild` 方法中，如果 `current` 为空，说明这是一个新的节点，需要插入，更新 flags：

```js
if (current !== null) {
} else {
  newFiber.flags = Placement; // 2
  return lastPlacedIndex;
}
```

### 单一节点插入

在 `placeSingleChild` 方法中，如果新的子节点 `alternate` 为空，说明是新节点，需要插入，更新 flags：

```js
if (shouldTrackSideEffects && newFiber.alternate === null) {
  newFiber.flags = Placement; // 2
}
```

## fiber flags 的使用场景

上面都是介绍 fiber flags 的更新场景，本节介绍 fiber flags 都在哪些地方使用

### getNearestMountedFiber

```js
function getNearestMountedFiber(fiber) {
  if ((node.flags & (Placement | Hydrating)) !== NoFlags) {
    // This is an insertion or in-progress hydration. The nearest possible
    // mounted fiber is the parent but we need to continue to figure out
    // if that one is still mounted.
    nearestMounted = node.return;
  }
}
```

### commitBeforeMutationEffects

```js
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    var current = nextEffect.alternate;

    if (!shouldFireAfterActiveInstanceBlur && focusedInstanceHandle !== null) {
      if ((nextEffect.flags & Deletion) !== NoFlags) {
        if (doesFiberContain(nextEffect, focusedInstanceHandle)) {
          shouldFireAfterActiveInstanceBlur = true;
        }
      } else {
        // TODO: Move this out of the hot path using a dedicated effect tag.
        if (
          nextEffect.tag === SuspenseComponent &&
          isSuspenseBoundaryBeingHidden(current, nextEffect) &&
          doesFiberContain(nextEffect, focusedInstanceHandle)
        ) {
          shouldFireAfterActiveInstanceBlur = true;
        }
      }
    }

    var flags = nextEffect.flags;

    if ((flags & Snapshot) !== NoFlags) {
      commitBeforeMutationLifeCycles(current, nextEffect);
    }

    if ((flags & Passive) !== NoFlags) {
      // If there are passive effects, schedule a callback to flush at
      // the earliest opportunity.
      if (!rootDoesHavePassiveEffects) {
        rootDoesHavePassiveEffects = true;
        scheduleCallback(NormalPriority$1, function () {
          flushPassiveEffects();
          return null;
        });
      }
    }

    nextEffect = nextEffect.nextEffect;
  }
}
function commitBeforeMutationLifeCycles(current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      return;
    }
    case ClassComponent: {
      if (finishedWork.flags & Snapshot) {
        var snapshot = instance.getSnapshotBeforeUpdate(prevProps, prevState);
      }
      return;
    }
    case HostRoot:
      if (finishedWork.flags & Snapshot) {
        clearContainer(root.containerInfo);
      }
      return;
    case HostComponent:
    case HostText:
      return;
  }
}
```

### commitLayoutEffects

```js
function commitLayoutEffects(root, committedLanes) {
  while (nextEffect !== null) {
    var flags = nextEffect.flags;
    if (flags & (Update | Callback)) {
      commitLifeCycles(root, current, nextEffect);
    }
    if (flags & Ref) {
      commitAttachRef(nextEffect);
    }
    nextEffect = nextEffect.nextEffect;
  }
}
function commitLifeCycles(finishedRoot, current, finishedWork, committedLanes) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      return;
    }

    case ClassComponent: {
      if (finishedWork.flags & Update) {
        if (current === null) {
          instance.componentDidMount();
        } else {
          instance.componentDidUpdate(
            prevProps,
            prevState,
            instance.__reactInternalSnapshotBeforeUpdate
          );
        }
      }
      return;
    }

    case HostRoot: {
      return;
    }
    case HostComponent: {
      if (current === null && finishedWork.flags & Update) {
        commitMount(_instance2, type, props); // 判断元素是否需要聚焦
      }
      return;
    }
    case HostText: {
      return;
    }
  }
}
```

### commitMutationEffects

```js
function commitMutationEffects(root, renderPriorityLevel) {
  // TODO: Should probably move the bulk of this function to commitWork.
  while (nextEffect !== null) {
    var flags = nextEffect.flags;

    if (flags & ContentReset) {
      commitResetTextContent(nextEffect);
    }

    if (flags & Ref) {
      var current = nextEffect.alternate;

      if (current !== null) {
        commitDetachRef(current);
      }
    } // The following switch statement is only concerned about placement,
    // updates, and deletions. To avoid needing to add a case for every possible
    // bitmap value, we remove the secondary effects from the effect tag and
    // switch on that value.

    var primaryFlags = flags & (Placement | Update | Deletion | Hydrating);

    switch (primaryFlags) {
      case Placement: {
        commitPlacement(nextEffect); // Clear the "placement" from effect tag so that we know that this is
        // inserted, before any life-cycles like componentDidMount gets called.
        // TODO: findDOMNode doesn't rely on this any more but isMounted does
        // and isMounted is deprecated anyway so we should be able to kill this.

        nextEffect.flags &= ~Placement;
        break;
      }

      case PlacementAndUpdate: {
        // Placement
        commitPlacement(nextEffect); // Clear the "placement" from effect tag so that we know that this is
        // inserted, before any life-cycles like componentDidMount gets called.

        nextEffect.flags &= ~Placement; // Update

        var _current = nextEffect.alternate;
        commitWork(_current, nextEffect);
        break;
      }

      case Hydrating: {
        nextEffect.flags &= ~Hydrating;
        break;
      }

      case HydratingAndUpdate: {
        nextEffect.flags &= ~Hydrating; // Update

        var _current2 = nextEffect.alternate;
        commitWork(_current2, nextEffect);
        break;
      }

      case Update: {
        var _current3 = nextEffect.alternate;
        commitWork(_current3, nextEffect);
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
```

### 杂记

```js
(workInProgress.flags & DidCapture) === NoFlags;
```
