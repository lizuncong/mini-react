> fiber updateQueue 在不同类型的 fiber 节点中含义不同，本节介绍 updateQueue 在不同类型 fiber 中的含义。

## HostRootFiber 容器节点

`HostRootFiber`就是`root`容器对应的 fiber 节点。

对于`HostRootFiber`，`updateQueue`存的是`ReactDOM.render`或者`ReactDOM.hydrate`的第三个参数，是个回调函数。

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
HostRootFiber = {
  type,
  flags,
  stateNode: FiberRootNode,
  updateQueue: {
    effects: null,
    shared: {
      pending: {
        callback: ƒ(), // ReactDOM.render方法的第三个参数，是个回调函数
        next: {},
        payload: { element },
      },
    },
  },
};
```

### beginWork 阶段：updateHostRoot

`processUpdateQueue`方法遍历`updateQueue.shared.pending`中的更新队列，计算 state，如果更新的对象`update`的`callback`有值，则将`update`存入`updateQueue.effects`数组中。同时将当前 fiber 标记为具有`Callback`的副作用

```js
HostRootFiber = {
  type,
  flags,
  stateNode: FiberRootNode,
  updateQueue: {
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

当我们调用`this.setState`是，React 构造一个更新对象，并添加到`updateQueue`中。`shared.pending`指向最后一个更新。

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

## HostComponent

对于原生的 div、span 等 HTML 标签，对应的 updateQueue 存的是需要更新的属性键值对。此时 updateQueue 就是一个数组

```js
function prepareToHydrateHostInstance(
  fiber,
  rootContainerInstance,
  hostContext
) {
  var instance = fiber.stateNode;
  var updatePayload = hydrateInstance(
    instance,
    fiber.type,
    fiber.memoizedProps,
    rootContainerInstance,
    hostContext,
    fiber
  );
  fiber.updateQueue = updatePayload;
  return false;
}
```

## FunctionComponent 函数组件

函数组件的`updateQueue` 存的是 `useEffect` 以及 `useLayoutEffect` 的监听函数，并且是一个环状链表。`lastEffect`指向最后一个`effect`。

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
