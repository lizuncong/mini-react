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

## Fiber flags

`PerformedWork` 是专门提供给 React Dev Tools 读取的。fiber 节点的副作用从 2 开始。0 表示没有副作用。

对于原生的 HTML 标签，如果需要修改属性，文本等，就视为有副作用。对于类组件，如果类实例实现了 `componentDidMount`、`componentDidUpdate` 等生命周期方法，则视为有副作用。对于函数组件，如果实现了 `useEffect`、`useLayoutEffect` 等 hook，则视为有副作用。以上这些都是副作用的例子。

React 在 render 阶段给有副作用的节点添加标志，并在 commit 阶段根据 fiber flags 执行对应的副作用操作，比如调用生命周期方法，或者操作真实的 DOM 节点。

### React 支持的所有 flags

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
const LifecycleEffectMask = 0b000000001110100100; // 932 Passive | Update | Callback | Ref | Snapshot

// 所有 host effects 的集合
const HostEffectMask = 0b000000011111111111; // 2047

// 下面这些并不是真正的副作用标志
const Incomplete = 0b000000100000000000; // 2048
const ShouldCapture = 0b000001000000000000; // 4096
const ForceUpdateForLegacySuspense = 0b000100000000000000; // 16384
```

### flags 位操作

这里简单列举一下 fiber flags 中一些位操作的含义。

```js
// 1.移除所有的生命周期相关的 flags
fiber.flags &= ~LifecycleEffectMask;

// 2.只保留 host effect 相关的副作用，移除其他的副作用位
fiber.flags &= HostEffectMask;

// 3.只保留 "插入" 副作用
fiber.flags &= Placement;

// 4.移除 "插入" 副作用，添加 "更新" 副作用
fiber.flags = (fiber.flags & ~Placement) | Update;
```

## Placement

### render 阶段

`reconcile children` 过程中，如果节点需要移动，插入，则在 `placeChild` 以及 `placeSingleChild` 方法中将 fiber 标记为 `Placement`：

```js
newFiber.flags = Placement;
```

本质上，创建新的 fiber 节点，也是一种 Placement 的副作用，即在 commit 阶段需要插入。因此，在类组件的 `updateClassComponent` 方法中判断 fiber 节点如果是新创建的，则标记为 `Placement`

```js
if (instance === null) {
  if (current !== null) {
    // Since this is conceptually a new fiber, schedule a Placement effect
    workInProgress.flags |= Placement;
  }
}
```

在懒加载的 `mountLazyComponent` 方法中，以及在函数组件第一次执行的 `mountIndeterminateComponent` 方法中，判断 fiber 节点如果是新创建的，则标记为 `Placement`

```js
if (_current !== null) {
  // Since this is conceptually a new fiber, schedule a Placement effect
  workInProgress.flags |= Placement;
}
```

### commit 阶段

commit 阶段执行 Placement 副作用操作。Placement 对应的副作用操作是插入新的 DOM 节点。插入节点的逻辑都在 `commitMutationEffects` 方法以及 `commitPlacement` 方法中

```js
function commitPlacement(finishedWork) {
  // 执行节点的插入逻辑
  if (isContainer) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
  } else {
    insertOrAppendPlacementNode(finishedWork, before, parent);
  }
}
function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    var primaryFlags = flags & (Placement | Update | Deletion | Hydrating);
    switch (primaryFlags) {
      case Placement: {
        commitPlacement(nextEffect);
        // 插入逻辑执行完成后，移除 Placement 副作用标记
        nextEffect.flags &= ~Placement;
        break;
      }

      case PlacementAndUpdate: {
        // Placement
        commitPlacement(nextEffect);
        nextEffect.flags &= ~Placement;
        // Update
        commitWork(_current, nextEffect);
        break;
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```

## Update

### render 阶段

- `mountClassInstance` 方法中判断类组件如果实现了 componentDidMount 方法
- `updateClassInstance` 方法中判断如果类组件实现了 `componentDidUpdate`方法
- `updateHostComponent` 方法中调用 `prepareUpdate` 方法判断 HostComponent 的属性如果发生了变更
- `updateHostText` 方法中判断如果新旧文本不同
- `completeWork` 方法中，判断如果 HostComponent 需要聚焦
- 函数组件如果调用了 `useEffect`、 `useLayoutEffect` 这两个 hook

```js
workInProgress.flags |= Update;
```

### commit 阶段

Update 副作用执行的逻辑在 `commitMutationEffects` 以及 `commitLayoutEffects` 两个方法中：

commitMutationEffects 方法，用于执行 commitWork：

```js
function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    var primaryFlags = flags & (Placement | Update | Deletion | Hydrating);
    switch (primaryFlags) {
      case PlacementAndUpdate: {
        // Placement
        commitPlacement(nextEffect);
        // Clear the "placement" from effect tag so that we know that this is
        // inserted, before any life-cycles like componentDidMount gets called.
        nextEffect.flags &= ~Placement; // Update
        var _current = nextEffect.alternate;
        commitWork(_current, nextEffect);
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
    }
    nextEffect = nextEffect.nextEffect;
  }
}
function commitWork(current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      // 调用函数组件 useLayoutEffect 的清除函数
      commitHookEffectListUnmount(Layout | HasEffect, finishedWork);
      return;
    }
    case HostComponent: {
      if (instance != null) {
        var updatePayload = finishedWork.updateQueue;
        if (updatePayload !== null) {
          // 更新真实的DOM节点的属性
          commitUpdate(instance, updatePayload, type, oldProps, newProps);
        }
      }
      return;
    }
    case HostText: {
      var oldText = current !== null ? current.memoizedProps : newText;
      commitTextUpdate(textInstance, oldText, newText); // 更新 textInstance.nodeValue = newText
      return;
    }
  }
}
```

```js
function commitLayoutEffects(root, committedLanes) {
  while (nextEffect !== null) {
    if (flags & (Update | Callback)) {
      var current = nextEffect.alternate;
      commitLifeCycles(root, current, nextEffect);
    }
    nextEffect = nextEffect.nextEffect;
  }
}
function commitLifeCycles(finishedRoot, current, finishedWork, committedLanes) {
  switch (finishedWork.tag) {
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
    case HostComponent: {
      if (current === null && finishedWork.flags & Update) {
        commitMount(_instance2, type, props); // commitMount用于判断元素是否需要自动聚焦
      }
      return;
    }
  }
}
```

## Deletion

### render 阶段

- 在 `reconcile children` 过程中， `deleteChild` 判断节点如果需要被删除

```js
childToDelete.flags = Deletion;
```

### commit 阶段

```js
function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    var primaryFlags = flags & (Placement | Update | Deletion | Hydrating);

    switch (primaryFlags) {
      case Deletion: {
        commitDeletion(root, nextEffect); // 删除节点
        break;
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```

## ContentReset

### render 阶段

- updateHostComponent 方法判断是否需要重置文本

```js
workInProgress.flags |= ContentReset;
```

### commit 阶段

```js
function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    if (flags & ContentReset) {
      commitResetTextContent(nextEffect);
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```

## Callback

### render 阶段

- `processUpdateQueue` 判断如果 update.callback 不为 null

```js
if (callback !== null) {
  workInProgress.flags |= Callback;
}
```

### commit 阶段

```js
function commitLayoutEffects(root, committedLanes) {
  while (nextEffect !== null) {
    if (flags & (Update | Callback)) {
      commitLifeCycles(root, current, nextEffect);
    }
    nextEffect = nextEffect.nextEffect;
  }
}
function commitLifeCycles(finishedRoot, current, finishedWork, committedLanes) {
  switch (finishedWork.tag) {
    case ClassComponent: {
      var updateQueue = finishedWork.updateQueue;
      if (updateQueue !== null) {
        commitUpdateQueue(finishedWork, updateQueue, instance); // 执行update.callback
      }
      return;
    }
    case HostRoot: {
      if (_updateQueue !== null) {
        commitUpdateQueue(finishedWork, _updateQueue, _instance); // 执行update.callback
      }
      return;
    }
  }
}
```

## Snapshot

### render 阶段

- updateClassInstance 方法判断类组件实例如果实现了 getSnapshotBeforeUpdate 方法

```js
workInProgress.flags |= Snapshot;
```

### commit 阶段

```js
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    if ((flags & Snapshot) !== NoFlags) {
      commitBeforeMutationLifeCycles(current, nextEffect);
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
        if (current !== null) {
          var snapshot = instance.getSnapshotBeforeUpdate(prevProps, prevState);
        }
      }
      return;
    }
    case HostRoot: {
      if (finishedWork.flags & Snapshot) {
        var root = finishedWork.stateNode;
        clearContainer(root.containerInfo);
      }
      return;
    }
  }
}
```

## Passive

### render 阶段

- 函数组件如果实现了 `useEffect`(注意，useLayoutEffect 并不属于 Passive 的副作用)

```js
fiber.flags |= Passive;
```

### commit 阶段

```js
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    var flags = nextEffect.flags;
    if ((flags & Passive) !== NoFlags) {
      // 启动一个微任务刷新 useEffect 的监听函数以及清除函数
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
```
