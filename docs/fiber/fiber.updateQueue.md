> fiber 的 updateQueue 属性在不同类型的 fiber 节点中含义不同，本节主要介绍`HostRoot`、`HostComponent`、`ClassComponent`、`FunctionComponent`这几种类型的 fiber updateQueue 的作用。

## 概述

- 在 HostRoot Fiber 中，`updateQueue`存的是`ReactDOM.render/ReactDOM.hydrate`的第三个回调参数，是个环状链表
- 在 ClassComponent Fiber 中，`updateQueue`存的是`this.setState`的更新队列，是个环状链表
- 在 FunctionComponent Fiber 中，`updateQueue`存的是`useEffect`、`useLayoutEffect`以及`useImperativeHandle`的监听函数，是个环状链表
- 在 HostComponent Fiber 中，`updateQueue`存的是在更新期间有变更的属性的键值对，是个数组

**综上，updateQueue 存的是各类型 fiber 的副作用信息，在 commit 阶段会处理这些副作用信息**

下面我会从`render阶段和`commit 阶段介绍对`updateQueue`的处理。

render 阶段主要是为 updateQueue 赋值，并计算 updateQueue。commit 阶段遍历 updateQueue 执行相应的操作

## HostRootFiber 容器节点

`HostRootFiber`就是`root`容器对应的 fiber 节点。

对于`HostRootFiber`，`updateQueue`用于存储`ReactDOM.render`或者`ReactDOM.hydrate`的第三个参数(回调函数)。

```js
ReactDOM.render(<Home />, document.getElementById("root"), () => {
  console.log("render 回调....");
});
// 或者
ReactDOM.hydrate(<Home />, document.getElementById("root"), () => {
  console.log("hydrate 回调....");
});
```

`HostRootFiber`的`updateQueue`是一个环状链表。

初次渲染时，`updateContainer`方法会为`HostRootFiber`添加一个`update`对象，如下：

```js
var update = {
  eventTime: eventTime,
  lane: lane,
  tag: UpdateState,
  payload: null,
  callback: null, // ReactDOM.render或者ReactDOM.hydrate方法的第三个参数
  next: null,
};
update.next = update; // 环状链表 shared.pending指向最后一个更新的对象
HostRootFiber.updateQueue = {
  baseState: null,
  effects: null,
  firstBaseUpdate: null,
  lastBaseUpdate: null,
  shared: {
    pending: update,
  },
};
```

### render 阶段

beginWork 阶段调用`processUpdateQueue`方法遍历`updateQueue.shared.pending`中的更新队列，计算 state。如果更新的对象`update`的`callback`有值，则将`update`存入`updateQueue.effects`数组中。同时将当前 fiber 标记为具有`Callback`的副作用

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

在`commitLayoutEffects`阶段调用`commitLifeCycles`方法，`commitLifeCycles`方法调用`commitUpdateQueue`执行回调方法。

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

对于类组件，updateQueue 存的是更新队列，即 this.setState 的更新对象链表，是一个环状链表。

`this.setState`实际上会调用`this.enqueueSetState`方法构造一个更新对象，并添加到队列中。`shared.pending`指向最后一个更新。

```js
// 更新对象
var update = {
  callback: null, // this.setState的第二个参数，即回调函数
  eventTime,
  lane: 1,
  next: null,
  payload: { count: 4 }, // this.setState的第一个参数
  tag: 0,
};
update.next = update; // 环状链表
fiber.updateQueue = {
  baseState: { count: 1 },
  effects: null,
  shared: {
    pending: update,
  },
};
```

### render 阶段

beginWork 阶段，`updateClassInstance`调用`processUpdateQueue`遍历更新的队列，计算 state，最终处理后的`updateQueue`如下：

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

### commit 阶段

`commitLayoutEffects`阶段调用`commitUpdateQueue`判断如果`updateQueue`不为 null，则调用`commitUpdateQueue`遍历`updateQueue.effects`，执行`setState`的回调

## HostComponent

`HostComponent` fiber，就是原生的 div、span 等 HTML 标签

`HostComponent` fiber 的`updateQueue`在初次渲染时为 null。只有在更新阶段，dom 的属性发生了变更，才不为 null。

`HostComponent` 的 updateQueue 存的是需要更新的属性键值对，此时 updateQueue 就是一个数组。如果 dom 上的属性没有发生变化，但是事件监听函数引用发生了变化，则 updateQueue 为空数组

### beginWork

`completeUnitOfWork`阶段调用 `updateHostComponent`对比新旧 props 的变化。

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

commitMutationEffects 阶段，如果`updateQueue`不为 null，则调用`commitUpdate`更新 dom 属性

## FunctionComponent 函数组件

函数组件的`updateQueue` 存的是 `useEffect` 以及 `useLayoutEffect` 的监听函数，并且是一个环状链表。`lastEffect`指向最后一个`effect`。函数组件每次执行时，都会重新初始化 `updateQueue`

- tag = 3。对应的是 useLayoutEffect
- tag = 5。对应的是 useEffect

### beginWork 阶段

`renderWithHooks`函数在执行函数组件时，构造 effect 对象，并添加到`updateQueue`队列中

```js
// effect对象
var effect = {
  tag: tag, // useLayoutEffect的tag等于3。useEffect的tag等于5
  create: create, // useEffect或者useLayoutEffect的第一个参数，即监听函数，
  destroy: destroy, // useEffect或者useLayoutEffect的清除函数
  deps: deps, // 依赖。即useEffect或者useLayoutEffect的第二个参数，即依赖
  // Circular
  next: null,
};
effect.next = effect;
fiber.updateQueue = {
  lastEffect: effect,
};
```

### commit 阶段

- `commitMutationEffects`阶段调用`commitHookEffectListUnmount` 执行 `useLayoutEffect`的清除函数
- `commitLayoutEffects` 阶段调用 `commitHookEffectListMount` 执行 `useLayoutEffect`的监听函数。然后调用`schedulePassiveEffects`将`useEffect`的监听函数和清除函数放入微任务队列执行，`useEffect`是异步执行的

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
// 调度useEffect。将useEffect的监听函数以及清除函数放入微任务队列等待异步执行
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
