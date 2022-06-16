## React 支持的所有 flags

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

### processUpdateQueue

在 `getStateFromUpdate` 方法中计算 state 时， 如果 update.tag === CaptureUpdate，则更新 flags：

```js
workInProgress.flags = (workInProgress.flags & ~ShouldCapture) | DidCapture; // ShouldCapture 4096 DidCapture 64
```

同时，如果 update.callback 不为空，说明我们在调用 `this.setState(arg, callback)` 时，传了第二个参数 `callback`。因此需要在 `processUpdateQueue` 中更新 flags：

```js
workInProgress.flags |= Callback; // Callback 32
```

#### this.setState 的回调函数，值 32

当调用类组件的 `this.setState(arg, callback)` 传递了回调函数 `callback` 时，就会改变 fiber 的 flags。

```js
var callback = update.callback;
if (callback !== null) {
  workInProgress.flags |= Callback; // Callback对应的值是32
}
```

此时 `workInProgress.flags = 32`

#### componentDidUpdate

如果类组件实现了 `componentDidUpdate` 生命周期方法：

```js
if (typeof instance.componentDidUpdate === "function") {
  workInProgress.flags |= Update; // Update对应的值是4
}
```

此时 `workInProgress.flags = 36`

#### getSnapshotBeforeUpdate

如果类组件实现了 `getSnapshotBeforeUpdate` 生命周期方法：

```js
if (typeof instance.getSnapshotBeforeUpdate === "function") {
  workInProgress.flags |= Snapshot; // Snapshot对应的值是256
}
```

此时 `workInProgress.flags = 292`

#### finishClassComponent

在 `finishClassComponent` 函数中，调用完类组件实例的 `render` 方法后：

```js
workInProgress.flags |= PerformedWork; // PerformedWork 对应的值为1
```

此时 `workInProgress.flags = 293`

### 函数组件

#### updateFunctionComponent

在 `updateFunctionComponent` 函数中，当调用完成函数组件获取新的 react element 子元素以后，改变 fiber flags 的值：

```js
workInProgress.flags |= PerformedWork; // PerformedWork对应的值为1
```

此时 `workInProgress.flags = 1`

### 原生的 HTML 标签

#### prepareUpdate

在 completeUnitOfWork 阶段，调用 prepareUpdate 方法比较 fiber 节点的 oldProps 和 newProps，收集变更的属性的 `键值对` 存储在 fiber.updateQueue 中。如果 fiber.updateQueue 不为 null，则需要更新 fiber.flags：

```js
workInProgress.flags |= Update; // Update对应的值是4
```

此时 `workInProgress.flags = 4`

### 文本节点

在 completeUnitOfWork 阶段，调用 updateHostText，比较新旧文本是否相同，如果不同，则更新 fiber.flags：

```js
workInProgress.flags |= Update; // Update对应的值是4
```

此时 `workInProgress.flags = 4`
