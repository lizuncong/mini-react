> fiber 的 updateQueue 属性在不同类型的 fiber 节点中含义不同，本节主要介绍`HostRoot`、`HostComponent`、`ClassComponent`、`FunctionComponent`这几种类型的 fiber updateQueue的作用。

## 概述

- 在 HostRoot Fiber 中，`updateQueue`存的是`ReactDOM.render/ReactDOM.hydrate`的第三个回调参数，是个环状链表
- 在 ClassComponent Fiber 中，`updateQueue`存的是`this.setState`的更新队列，是个环状链表
- 在 FunctionComponent Fiber 中，`updateQueue`存的是`useEffect`或者`useLayoutEffect`的监听函数，是个环状链表
- 在 HostComponent Fiber 中，`updateQueue`存的是在更新期间有变更的属性的键值对，是个数组

## HostRootFiber 容器节点

`HostRootFiber`就是`root`容器对应的 fiber 节点。

对于`HostRootFiber`，`updateQueue`存的是`ReactDOM.render`或者`ReactDOM.hydrate`的第三个参数(回调函数)。

```js
ReactDOM.render(<Home />, document.getElementById("root"), () => {
  console.log("render 回调....");
});
// 或者
ReactDOM.hydrate(<Home />, document.getElementById("root"), () => {
  console.log("hydrate 回调....");
});
```

`HostRootFiber`的`updateQueue`是一个环状链表，在`updateContainer`方法中会为`HostRootFiber`添加一个`update`，如下：

```js
HostRootFiber.updateQueue = {
  effects: null,
  shared: {
    pending: {
      callback: ƒ(), // ReactDOM.render方法的第三个参数，是个回调函数
      next: {},
      payload: { element },
    },
  },
};
```

### beginWork 阶段：updateHostRoot

`processUpdateQueue`方法遍历`updateQueue.shared.pending`中的更新队列，计算 state，如果更新的对象`update`的`callback`有值，则将`update`存入`updateQueue.effects`数组中。同时将当前 fiber 标记为具有`Callback`的副作用

```js
HostRootFiber.updateQueue = {
  baseState: { element },
  effects: [
    {
      callback: ƒ(),
      payload: { element },
      next: null,
    },
  ],
  shared: {
    pending: null,
  },
};
```

### commit 阶段

在`commitLayoutEffects`中调用`commitLifeCycles`方法，`commitLifeCycles`方法调用`commitUpdateQueue`执行回调方法。

```js
function commitUpdateQueue(finishedWork, finishedQueue, instance) {
  // 遍历effects，执行callback回调
  var effects = finishedQueue.effects;
  finishedQueue.effects = null; // effects重置为null

  if (effects !== null) {
    for (var i = 0; i < effects.length; i++) {
      var effect = effects[i];
      var callback = effect.callback;

      if (callback !== null) {
        effect.callback = null;
        callback(instance);
      }
    }
  }
}
```

## 类组件

对于类组件，updateQueue 存的是更新队列，即 this.setState 的队列，是一个环状链表。

`this.setState`实际上会调用`this.enqueueSetState`，React 构造一个更新对象，并添加到`updateQueue`中。`shared.pending`指向最后一个更新。

```js
fiber.updateQueue = {
  baseState: { count: 1 },
  effects: null,
  shared: {
    pending: {
      callback, // callback存的是this.setState的第二个参数，即回调函数
      next: {},
      payload: { count: 2 },
      tag: 0,
    },
  },
};
```

### beginWork 阶段：updateClassInstance

`updateClassInstance`调用`processUpdateQueue`遍历更新的队列，最终处理后的`updateQueue`如下：

```js
fiber.updateQueue = {
  baseState: { count: 2 },
  effects: [
    {
      callback, // callback存的是this.setState的第二个参数，即回调函数
      next: null,
      payload: { count: 2 },
      tag: 0,
    },
  ],
  firstBaseUpdate: null,
  lastBaseUpdate: null,
  shared: { pending: null },
};
```

### commit 阶段： commitUpdateQueue

`commitLayoutEffects`判断如果`updateQueue`不为 null，则调用`commitUpdateQueue`遍历`updateQueue.effects`，执行`setState`的回调

## HostComponent

`HostComponent` fiber 的`updateQueue`只在初次渲染阶段是为 null 的。只有在更新阶段，dom 的属性发生了变更，才有意义。

对于原生的 div、span 等 HTML 标签，对应的 updateQueue 存的是需要更新的属性键值对。此时 updateQueue 就是一个数组

### beginWork: completeUnitOfWork

`completeUnitOfWork`阶段，调用 `updateHostComponent`

```js
function updateHostComponent() {
  var updatePayload = prepareUpdate(instance, type, oldProps, newProps);

  workInProgress.updateQueue = updatePayload;

  if (updatePayload) {
    markUpdate(workInProgress);
  }
}
function prepareUpdate() {
  return diffProperties(domElement, type, oldProps, newProps);
}
```

`updateHostComponent`主要逻辑如下：

- 调用`prepareUpdate`比较属性，找出有差异的属性键值对存储在 `updatePayload`中
- 如果 `updatePayload` 不为 null，则将当前 fiber 标记为具有更新的副作用

`diffProperties`会比较 `oldProps` 和 `newProps`，找出有差异的属性，比如：

```js
// 更新前
<div id="1" test1="2">1</div>
// 更新后
<div id="2" test1="3" test2="4">2</div>
```

旧的 `id = 1`，而新的`id = 2`，则`id`发生了变更，因此需要添加到`updatePayload`中，此时`updatePayload = ['id', 2]`。

这里需要注意，如果我们的属性没有变更，但是 onClick 等监听函数的引用发生了变更，则`diffProperties`会返回一个空数组以标记该节点需要更新

```js
// 更新前
<div onClick={() => { console.log('onclick')}}>1</div>
// 更新后
<div onClick={() => { console.log('onclick')}}>1</div>
```

虽然 `div` 节点更新前后属性没有发生变化，但是 `onClick` 的引用发生了变化，则 `updatePayload = []`

### commit 阶段

如果`updateQueue`不为 null，则调用`commitUpdate`更新 dom 属性

## FunctionComponent 函数组件

函数组件的`updateQueue` 存的是 `useEffect` 以及 `useLayoutEffect` 的监听函数，并且是一个环状链表。`lastEffect`指向最后一个`effect`。函数组件每次执行时，都会重新初始化 `updateQueue`

- tag = 3。对应的是 useLayoutEffect
- tag = 5。对应的是 useEffect

### beginWork 阶段

`renderWithHooks`函数在执行函数组件时，构造`updateQueue`

```js
fiber.updateQueue = {
  lastEffect: {
    create: () => {}, // useEffect或者useLayoutEffect的监听函数
    deps: null,
    destroy: undefined, // useEffect或者useLayoutEffect的清除函数
    next: {
      tag: 5, // useEffect的tag为5
      destroy: undefined,
      deps: null,
      next: {},
      create: ƒ,
    },
    tag: 3, // useLayoutEffect的tag 为3
  },
};
```

### commit 阶段

- `commitMutationEffects`函数调用`commitHookEffectListUnmount` 执行 `useLayoutEffect`的清除函数
- `commitLayoutEffects` 函数调用 `commitHookEffectListMount` 执行 `useLayoutEffect`的监听函数。然后调用`schedulePassiveEffects`将`useEffect`的监听函数和清除函数放入微任务队列执行，`useEffect`是异步执行的

```js
// 执行useLayoutEffect的清除函数
function commitHookEffectListUnmount(tag, finishedWork) {
  var updateQueue = finishedWork.updateQueue;
  var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    var firstEffect = lastEffect.next;
    var effect = firstEffect;

    do {
      // useLayoutEffect
      if ((effect.tag & 3) === 3) {
        var destroy = effect.destroy; // 清除函数
        effect.destroy = undefined;

        if (destroy !== undefined) {
          destroy();
        }
      }

      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

```js
// 执行useLayoutEffect的监听函数
function commitHookEffectListMount(tag, finishedWork) {
  var updateQueue = finishedWork.updateQueue;
  var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    var firstEffect = lastEffect.next;
    var effect = firstEffect;

    do {
      if ((effect.tag & 3) === 3) {
        // useLayoutEffect的监听函数
        var create = effect.create;
        effect.destroy = create();
      }

      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

```js
function schedulePassiveEffects(finishedWork) {
  var updateQueue = finishedWork.updateQueue;
  var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    var firstEffect = lastEffect.next;
    var effect = firstEffect;

    do {
      const { next, tag } = effect;
      if ((tag & 5) === 5) {
        enqueuePendingPassiveHookEffectUnmount(finishedWork, effect); // 将useEffect的清除函数放入微任务队列
        enqueuePendingPassiveHookEffectMount(finishedWork, effect); // 将useEffect的监听函数放入微任务队列
      }

      effect = next;
    } while (effect !== firstEffect);
  }
}
```
