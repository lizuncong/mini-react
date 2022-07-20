> fiber updateQueue 在不同类型的 fiber 节点中含义不同，本节介绍 updateQueue 在不同类型 fiber 中的含义。


- 对于类组件，updateQueue存的是更新队列，即this.setState的队列，是一个环状链表
- 对于函数组件，updateQueue存的是 useEffect的回调，并且是一个环状链表
- 对于原生HTML标签，对应的fiber.updateQueue存的是diffProperties后需要更新的属性键值对，此时updateQueue就是一个数组
## HostRootFiber
在`HostRootFiber`中，`updateQueue`存的是`ReactDOM.render`或者`ReactDOM.hydrate`的第三个参数，是个回调函数
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

### beginWork阶段：updateHostRoot
`processUpdateQueue`方法遍历`updateQueue.shared.pending`中的更新队列，计算state，如果更新的对象`update`的`callback`有值，则将`update`存入`updateQueue.effects`数组中。同时将当前fiber标记为具有`Callback`的副作用
```js
HostRootFiber = {
  type,
  flags,
  stateNode: FiberRootNode,
  updateQueue: {
    baseState: { element },
    effects: [{
        callback: ƒ(),
        payload: { element },
        next: null
    }],
    shared: {
      pending: null,
    },
  },
};
```

## 类组件
applyDerivedStateFromProps

## HostComponent
updateHostComponent$1
```js
 function prepareToHydrateHostInstance(fiber, rootContainerInstance, hostContext) {
   var instance = fiber.stateNode;
   var updatePayload = hydrateInstance(instance, fiber.type, fiber.memoizedProps, rootContainerInstance, hostContext, fiber); 
   fiber.updateQueue = updatePayload; 
   return false;
 }
```
## FunctionComponent
```js
pushEffect
```