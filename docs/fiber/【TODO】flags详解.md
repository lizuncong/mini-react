### 类组件

一开始 `workInProgress.flags = 0`

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


### 原生的HTML标签

#### prepareUpdate
在 completeUnitOfWork 阶段，调用 prepareUpdate 方法比较fiber节点的oldProps和newProps，收集变更的属性的 `键值对` 存储在 fiber.updateQueue 中。如果 fiber.updateQueue 不为 null，则需要更新 fiber.flags：

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
