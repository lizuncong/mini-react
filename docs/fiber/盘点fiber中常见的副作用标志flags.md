> 在 React 的渲染流程中，render 阶段从根节点开始处理所有的 fiber 节点，收集有副作用的 fiber 节点(即 fiber.flags 大于 1 的节点)，并构建副作用链表。commit 阶段并不会处理所有的 fiber 节点，而是遍历副作用链表，根据 fiber.flags 的标志进行对应的处理。

## 位操作

在开始介绍 fiber flags 前，先来看下位操作

### 按位非(~)

按位非运算符（~），反转操作数的位。

```js
const a = 5; // 00000000000000000000000000000101
const b = -3; // 11111111111111111111111111111101

console.log(~a); // 11111111111111111111111111111010，即-6

console.log(~b); // 00000000000000000000000000000010， 即2
```

按位非运算时，任何数字 x 的运算结果都是 -(x + 1)。例如，〜-5 运算结果为 4。

### 按位与(&)

按位与运算符 (&) 在两个操作数对应的二进位都为 1 时，该位的结果值才为 1，否则为 0。

### 按位或(|)

按位或运算符 (|) 在两个操作数对应的二进位只要有一个为 1 时，该位的结果值为 1，否则为 0。

### 按位异或(^)

有且仅有一个为 1 时，结果才为 1，否则为 0:

```js
const a = 5; // 00000000000000000000000000000101
const b = 3; // 00000000000000000000000000000011

console.log(a ^ b); // 00000000000000000000000000000110，即6
```

## React 为什么采用二进制表示副作用

原因可以归类为以下两点：

- 位运算快速
- 可以方便的给一个 fiber 节点添加多个副作用，同时内存开销小。

我们先来看下使用其他方式表示副作用会有什么问题。假设我们使用 2 表示插入，在 render 阶段，如果这个 fiber 节点是新的，我们就给这个 fiber 节点添加一个副作用：`fiber.flags = 2`。然后在 commit 阶段使用 `fiber.flags === 2` 判断节点是否需要插入。

**这会带来一个问题，React 中一个 fiber 节点会有多个副作用，比如，既可以是插入，又可以是更新(类组件实现了 componentDidMount 方法，就是更新的副作用)**，如果使用十进制，我们可以很容易想到这样实现：

```js
fiber.flags = [];
fiber.flags.push(2); // 插入
fiber.flags.push(4); // 更新，此时 fiber.flags有两个副作用：[2, 4]
```

在 commit 阶段就可以这样判断：

```js
if (fiber.flags.includes(2)) {
  // 执行插入的逻辑
}
if (fiber.flags.includes(4)) {
  // 执行更新的逻辑
}
```

这样做理论上是可以的，但是数组操作比较麻烦，还会冗余，比如，如果多次 `fiber.flags.push(2)` 就会有多个重复的 2。同时如果需要先删除插入的副作用，并添加一个更新的副作用，操作起来较繁琐

因此 React 采用了二进制标记这些副作用。不仅占用内存小，运算迅速，同时还能表示多个副作用

如果一个 fiber 节点，既要插入又要更新，可以这样标记：

```js
fiber.flags |= Placement | Update; // Placement 0b000000000000000010  Update  0b000000000000000100
```

如果需要删除一个插入的副作用，并且添加一个更新的副作用，那么可以这样标记：

```js
fiber.flags = (fiber.flags & ~Placement) | Update;
```

可以说是相当的方便了

## React Fiber 支持的所有 flags

`PerformedWork` 是专门提供给 React Dev Tools 读取的。fiber 节点的副作用从 2 开始。0 表示没有副作用。

```js
// 下面两个运用于 React Dev Tools，不能更改他们的值
const NoFlags = 0b000000000000000000;
const PerformedWork = 0b000000000000000001;

// 下面的 flags 用于标记副作用
const Placement = 0b000000000000000010; // 2 移动，插入
const Update = 0b000000000000000100; // 4
const PlacementAndUpdate = 0b000000000000000110; // 6
const Deletion = 0b000000000000001000; // 8
const ContentReset = 0b000000000000010000; // 16
const Callback = 0b000000000000100000; // 32 类组件的 update.callback
const DidCapture = 0b000000000001000000; // 64
const Ref = 0b000000000010000000; // 128
const Snapshot = 0b000000000100000000; // 256
const Passive = 0b000000001000000000; // 512
const Hydrating = 0b000000010000000000; // 1024

const HydratingAndUpdate = 0b000000010000000100; // 1028 Hydrating | Update

// 这是所有的生命周期方法(lifecycle methods)以及回调(callbacks)相关的副作用标志，其中 callbacks 指的是 update 的回调，比如调用this.setState(arg, callback)的第二个参数
// const LifecycleEffectMask = 0b000000001110100100; // 932 Passive | Update | Callback | Ref | Snapshot

// Union of all host effects
// const HostEffectMask = 0b000000011111111111; // 2047

// These are not really side effects, but we still reuse this field.
// const Incomplete = 0b000000100000000000; // 2048
const ShouldCapture = 0b000001000000000000; // 4096
// const ForceUpdateForLegacySuspense = 0b000100000000000000; // 16384
```

## Placement

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
