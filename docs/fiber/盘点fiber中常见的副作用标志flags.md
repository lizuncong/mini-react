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

当然，代价是代码可读性差，谨慎在业务代码中使用此类操作

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

// 4.添加一个 “更新” 副作用，注意和第3点保留 “插入” 副作用的区别
fiber.flags |= Update;

// 5.移除 "插入" 副作用，添加 "更新" 副作用
fiber.flags = (fiber.flags & ~Placement) | Update;
```

**下面会详细介绍常见的 fiber flags 在 render 阶段是如何被标记的，在 commit 阶段又执行了哪些对应的操作**

## Placement 副作用

Placement 用于标记新的节点创建并插入，旧的节点移动。这个标记作用于所有类型的 fiber 节点

### render 阶段

- 新的节点插入，旧的节点移动都属于 Placement 副作用。`reconcile children` 过程中，如果节点需要移动，插入，则在 `placeChild` 或者 `placeSingleChild` 方法中将 fiber 标记为 `Placement`

```js
newFiber.flags = Placement;
```

- 创建新的 fiber 节点，本质上也是属于新的节点插入，因此也属于 Placement 副作用。在类组件第一次渲染时执行的 `updateClassComponent` 方法、懒加载组件第一次渲染时执行的 `mountLazyComponent` 方法、函数组件第一次渲染时执行的 `mountIndeterminateComponent` 方法中，判断 fiber 节点如果是新创建的，则标记为 `Placement`。当然还有 Suspense 组件相关的方法执行时也会判断，不在本次讨论的范围

```js
if (instance === null) {
  if (current !== null) {
    // Since this is conceptually a new fiber, schedule a Placement effect
    workInProgress.flags |= Placement;
  }
}
```

### commit 阶段

commit 阶段执行 Placement 副作用对应的操作：`commitPlacement`。commitPlacement 负责插入新节点以及移动旧的 DOM 节点。`commitMutationEffects` 是一个基于 fiber flags 的 switch 语句，根据 fiber flags 执行对应的操作

```js
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
function commitPlacement(finishedWork) {
  // 执行节点的插入逻辑
  if (isContainer) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
  } else {
    insertOrAppendPlacementNode(finishedWork, before, parent);
  }
}
```

## Update 副作用

Update 副作用主要用来标记某些生命周期方法，DOM 属性及文本内容变更等。这个标记作用于所有类型的 fiber 节点

### render 阶段

- `mountClassInstance`、`resumeMountClassInstance` 方法中判断类组件如果实现了 componentDidMount 方法
- `updateClassInstance` 方法中判断如果类组件实现了 `componentDidUpdate`方法
- `updateHostComponent` 方法中调用 `prepareUpdate` 方法判断 HostComponent 的属性如果发生了变更
- `updateHostText` 方法中判断如果新旧文本不同
- `completeWork` 方法中，判断如果 HostComponent 需要聚焦
- 函数组件如果调用了 `useEffect`、 `useLayoutEffect`、`useImperativeHandle` 这几个 hook
- beginWork 方法中的 `updateProfiler`，以及 completeWork 方法中与 `hydrated` 有关的，也会被标记为 Update 副作用，不在本次讨论范围

```js
workInProgress.flags |= Update;
```

### commit 阶段

- 在 `commitMutationEffects` 阶段，如果 fiber 节点具有 Update 副作用，则调用 `commitWork` 方法执行对应的操作
  - 调用函数组件 useLayoutEffect 的清除函数
  - 更新真实的 DOM 节点的属性
  - 更新真实 DOM 节点的文本内容。textInstance.nodeValue = newText
- 在 `commitLayoutEffects` 阶段，如果 fiber 节点具有 Update 副作用，则调用 commitLifeCycles 执行对应的操作。
  - 调用类组件的生命周期方法 `componentDidMount` 以及 `componentDidUpdate`
  - 调用函数组件 useLayoutEffect 的监听函数，同时将函数组件的 useEffect 的监听函数放入微任务队列执行
  - 判断 HostComponent 元素是否需要自动聚焦，如果元素需要自动聚焦，则调用 dom.focus()方法实现自动聚焦

commitMutationEffects 阶段

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
      // 更新文本内容。textInstance.nodeValue = newText
      commitTextUpdate(textInstance, oldText, newText);
      return;
    }
  }
}
```

commitLayoutEffects 阶段

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
    case FunctionComponent: {
      // 调用函数组件 useLayoutEffect 的监听函数
      commitHookEffectListMount(Layout | HasEffect, finishedWork);
      // 将函数组件的 useEffect 的监听函数放入微任务队列执行
      schedulePassiveEffects(finishedWork);
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
    case HostComponent: {
      if (current === null && finishedWork.flags & Update) {
        // commitMount方法用于判断元素是否需要自动聚焦，如果元素需要自动聚焦，则调用dom.focus()方法实现自动聚焦
        commitMount(_instance2, type, props);
      }
      return;
    }
  }
}
```

## Deletion 副作用

Deletion 主要用于标记需要被删除的节点。这个标记作用于所有类型的 fiber 节点

### render 阶段

- 在 `reconcile children` 过程中， `deleteChild` 方法判断节点如果需要被删除，则标记为 Deletion

```js
childToDelete.flags = Deletion;
```

### commit 阶段

commit 阶段，如果节点具有 Deletion 副作用，则删除节点，并释放节点的引用属性，比如重置 fiber.sibling，fiber.stateNode 等属性为空，方便垃圾回收，否则会有内存泄漏的风险。

- commitMutationEffects 阶段，删除 fiber 节点，释放引用属性。
- 在 `commitLayoutEffects` 阶段执行完成后，需要判断如果 fiber 包含 Deletion 副作用，说明需要删除。调用 `detachFiberAfterEffects` 重置 fiber.sibling 以及 fiber.stateNode

```js
function commitRootImpl(root, renderPriorityLevel) {
  commitBeforeMutationEffects();
  commitMutationEffects(root, renderPriorityLevel);
  commitLayoutEffects(root, lanes);
  nextEffect = firstEffect;

  while (nextEffect !== null) {
    if (nextEffect.flags & Deletion) {
      detachFiberAfterEffects(nextEffect);
    }
    nextEffect = nextNextEffect;
  }
}
function detachFiberAfterEffects(fiber) {
  fiber.sibling = null;
  fiber.stateNode = null;
}

function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    var current = nextEffect.alternate;
    if (!shouldFireAfterActiveInstanceBlur && focusedInstanceHandle !== null) {
      // 这里面Deletion没做啥操作
      if ((nextEffect.flags & Deletion) !== NoFlags) {
        if (doesFiberContain(nextEffect, focusedInstanceHandle)) {
          shouldFireAfterActiveInstanceBlur = true;
        }
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
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
function commitDeletion(finishedRoot, current, renderPriorityLevel) {
  // 从当前节点开始，递归删除其所有的子节点，并调用 componentWillUnmount 生命周期方法
  unmountHostComponents(finishedRoot, current);
  // 释放引用
  var alternate = current.alternate;
  detachFiberMutation(current);
  if (alternate !== null) {
    detachFiberMutation(alternate);
  }
}

function detachFiberMutation(fiber) {
  // Cut off the return pointers to disconnect it from the tree. Ideally, we
  // should clear the child pointer of the parent alternate to let this
  // get GC:ed but we don't know which for sure which parent is the current
  // one so we'll settle for GC:ing the subtree of this child. This child
  // itself will be GC:ed when the parent updates the next time.
  // Note: we cannot null out sibling here, otherwise it can cause issues
  // with findDOMNode and how it requires the sibling field to carry out
  // traversal in a later effect. See PR #16820. We now clear the sibling
  // field after effects, see: detachFiberAfterEffects.
  //
  // Don't disconnect stateNode now; it will be detached in detachFiberAfterEffects.
  // It may be required if the current component is an error boundary,
  // and one of its descendants throws while unmounting a passive effect.
  // 重置 fiber.return 断开与父节点的联系。本来应该要同时重置parentFiber.child属性，以断开父节点和当前节点的联系。但由于还不确定当前的父节点，因此只需要释放当前节点的子节点。注意这里并没有继续遍历当前节点的所有子节点并释放这些引用。
  // 注意，这里目前还不能释放 sibling 以及 stateNode，这两个属性都是在最后的detachFiberAfterEffects方法中释放
  fiber.alternate = null;
  fiber.child = null;
  fiber.dependencies = null;
  fiber.firstEffect = null;
  fiber.lastEffect = null;
  fiber.memoizedProps = null;
  fiber.memoizedState = null;
  fiber.pendingProps = null;
  fiber.return = null;
  fiber.updateQueue = null;
}
```

## ContentReset 副作用

ContentReset 用于标记需要重置文本的 HostComponent 节点。这个标记只作用于 HostComponent

### render 阶段

- updateHostComponent 方法判断是否需要重置 HostComponent 文本内容为空字符串，即在下面的情况下，需要清空节点的文本内容。这也是需要清空文本内容的唯一情况

```js
// 旧的节点，只包含一个子节点，并且是文本内容
<div id="test">this is old text</div>
// 新的子节点，子节点不再是单一的文本内容，因此需要复用div#test这个DOM节点，但是前提是需要先清空它旧的文本内容
<div id="test">
  <span>new</span>
  <span>text</span>
</div>
```

```js
function shouldSetTextContent(type, props) {
  return (
    type === "textarea" ||
    type === "option" ||
    type === "noscript" ||
    typeof props.children === "string" ||
    typeof props.children === "number" ||
    (typeof props.dangerouslySetInnerHTML === "object" &&
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html != null)
  );
}
function updateHostComponent(current, workInProgress, renderLanes) {
  var prevProps = current !== null ? current.memoizedProps : null;
  var isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    // We special case a direct text child of a host node. This is a common
    // case. We won't handle it as a reified child. We will instead handle
    // this in the host environment that also has access to this prop. That
    // avoids allocating another HostText fiber and traversing it.
    nextChildren = null;
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    // If we're switching from a direct text child to a normal child, or to
    // empty, we need to schedule the text content to be reset.
    workInProgress.flags |= ContentReset;
  }
  return workInProgress.child;
}
```

### commit 阶段

重置 DOM 节点的 nodeValue 或者 textContent 属性为空字符串

```js
function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    if (flags & ContentReset) {
      // 重置当前DOM节点文本内容为空字符串
      commitResetTextContent(nextEffect);
    }
    nextEffect = nextEffect.nextEffect;
  }
}

function commitPlacement(finishedWork) {
  if (parentFiber.flags & ContentReset) {
    // Reset the text content of the parent before doing any insertions
    // 重置 父节点的 文本内容为空字符串：parent.textContent = '' 或者 parent.firstChild.nodeValue = ''
    resetTextContent(parent);
    // Clear ContentReset from the effect tag
    parentFiber.flags &= ~ContentReset;
  }
}
```

## Callback 副作用

Callback 用于标记创建了更新对象并且更新对象有 callback 回调的类组件或者 HostRoot。这个标记只作用于类组件和 HostRoot 节点(即容器 root 节点)

### render 阶段

对于类组件，如果我们调用了 `this.setState(arg, callback)` 传递了第二个参数 callback，则创建的更新对象 update 就会有 update.callback 回调，对应的 fiber flags 就需要被标记为有 Callback 副作用

对于 HostRoot，即容器节点，如果我们调用的 `ReactDOM.render(element, container, callback)` 传递了第三个参数 callback，那么在创建更新对象时，update.callback 就有回调，HostRoot 就需要被标记为有 Callback 副作用

- `processUpdateQueue` 方法中判断如果 update.callback 不为 null。类组件以及 HostRoot 都会调用 processUpdateQueue 方法。

```js
function processUpdateQueue(workInProgress, props, instance, renderLanes) {
  if (callback !== null) {
    workInProgress.flags |= Callback;
  }
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
        // 执行update.callback，其实就是执行我们调用this.setState(arg, callback)传递的第二个回调参数
        commitUpdateQueue(finishedWork, updateQueue, instance);
      }
      return;
    }
    case HostRoot: {
      if (_updateQueue !== null) {
        // 执行update.callback，其实就是执行的 ReactDOM.render(element,root, callback) 第三个参数传递的callback回调
        commitUpdateQueue(finishedWork, _updateQueue, _instance);
      }
      return;
    }
  }
}
```

## Snapshot 副作用

Snapshot 用于标记实现了 getSnapshotBeforeUpdate 方法的类组件对应的 fiber 节点。这个标记只作用于类组件以及 HostRoot(即容器 root 节点)

### render 阶段

- updateClassInstance 方法判断类组件实例如果实现了 getSnapshotBeforeUpdate 方法
- completeWork 方法中，对于 HostRoot，如果是页面第一次渲染，则给 HostRoot 添加一个 Snapshot 副作用

```js
workInProgress.flags |= Snapshot;
```

### commit 阶段

- 类组件对应的 fiber flag 有 Snapshot 标记，说明需要调用 getSnapshotBeforeUpdate 生命周期方法。
- 对于 HostRoot，如果 HostRootFiber 带有 Snapshot 标记，说明是页面第一次渲染，需要先清空 root： root.textContent = ''

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
        // 在插入我们的页面内容之前，先清空root容器 root.textContent = ''
        clearContainer(root.containerInfo);
      }
      return;
    }
  }
}
```

## Passive 副作用

Passive 用于标记调用了 useEffect 的函数组件。这个标记只作用于函数组件。

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
