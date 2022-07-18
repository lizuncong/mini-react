> [深入概述 React 初次渲染及状态更新主流程](https://github.com/lizuncong/mini-react/blob/master/docs/render/%E6%B7%B1%E5%85%A5%E6%A6%82%E8%BF%B0%20React%E5%88%9D%E6%AC%A1%E6%B8%B2%E6%9F%93%E5%8F%8A%E7%8A%B6%E6%80%81%E6%9B%B4%E6%96%B0%E4%B8%BB%E6%B5%81%E7%A8%8B.md)一文中介绍过 React 渲染过程，即`ReactDOM.render`执行过程分为两个大的阶段：`render` 阶段以及 `commit` 阶段。`React.hydrate`渲染过程和`ReactDOM.render`差不多，两者之间最大的区别就是，`ReactDOM.hydrate` 在 `render` 阶段，会尝试复用(hydrate)浏览器现有的 dom 节点，并相互关联 dom 实例和 fiber，以及找出 dom 属性和 fiber 属性之间的差异。

## Demo

这里，我们在 `index.html` 中直接返回一段 html，以模拟服务端渲染生成的 html

```js
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Mini React</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="root"><div id="container"><div id="text">hello world</div><div id="count">0</div></div>
    </div>
  </body>
</html>
```

注意，`root` 里面的内容不能换行，不然客户端`hydrate`的时候会提示服务端和客户端的模版不一致。

新建 index.jsx：

```js
import React, { useState } from "react";
import ReactDOM from "react-dom";

const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div id="count" onClick={() => setCount(count + 1)}>
      {count}
    </div>
  );
};

class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="container">
        <div id="text">hello world</div>
        <Counter />
      </div>
    );
  }
}

ReactDOM.hydrate(<Home />, document.getElementById("root"));
```

在客户端开始执行之前，即 `ReactDOM.hydrate` 开始执行前，由于服务端已经返回了 html 内容，浏览器会立马显示内容。对应的真实 DOM 树如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hydrate-01.jpg)

注意，这不是 fiber 树！！

## ReactDOM.render

先来回顾一下 React 渲染更新过程，分为两大阶段，五小阶段：

- render 阶段
  - beginWork
  - completeUnitOfWork
- commit 阶段。
  - commitBeforeMutationEffects
  - commitMutationEffects
  - commitLayoutEffects

当我们调用`ReactDOM.render`函数在客户端进行第一次渲染时，`render`阶段的`completeUnitOfWork`函数针对`HostComponent`以及`HostText`类型的 fiber 执行以下 dom 相关的操作：

- 1. 调用`document.createElement`为`HostComponent`类型的 fiber 节点创建真实的 DOM 实例。或者调用`document.createTextNode`为`HostText`类型的 fiber 节点创建真实的 DOM 实例
- 2. 将 fiber 节点关联到真实 dom 的`__reactFiber$rsdw3t27flk`(后面是随机数)属性上。
- 3. 将 fiber 节点的`pendingProps` 属性关联到真实 dom 的`__reactProps$rsdw3t27flk`(后面是随机数)属性上
- 4. 将真实的 dom 实例关联到`fiber.stateNode`属性上：`fiber.stateNode = dom`。
- 5. 遍历 `pendingProps`，给真实的`dom`设置属性，比如设置 id、textContent 等

**React 渲染更新完成后，React 会为每个真实的 dom 实例挂载两个私有的属性：`__reactFiber$`和`__reactProps$`**，以`div#container`为例：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hydrate-02.jpg)

## ReactDOM.hydrate

`hydrate`中文意思是`水合物`，这样理解有点抽象。实际上，`hydrate`就是 React 在 render 阶段边构造 workInProgress 树，边遍历浏览器真实的 DOM 树，然后判断两棵树的节点是否满足`hydrate`的条件：

- 对于 nodeType 为 ELEMENT_NODE 的 DOM 实例，如果当前真实的 DOM 树上的节点和当前的 fiber 节点的`type`相同，即`fiber.type === dom.nodeName.toLowerCase()`，那么说明当前的 dom 可以`hydrate`

**`hydrate`的终极目标就是，在构造 workInProgress 树的过程中，尽可能的复用当前浏览器已经存在的 DOM 实例以及 DOM 上的属性，这样就无需再为 fiber 节点创建 DOM 实例，同时对比现有的 DOM 的`attribute`以及 fiber 的`pendingProps`，找出差异的属性。然后将 dom 实例和 fiber 节点相互关联(通过 dom 实例的`__reactFiber$`以及`__reactProps$`，fiber 的 stateNode 相互关联)**

`hydrate`过程只针对两类 fiber 节点：`HostComponent` 以及 `HostText`。在 render 阶段为这两类型的 fiber 节点协调子元素时，首先会调用`tryToClaimNextHydratableInstance`尝试着`hydrate`。

## hydrate 源码剖析

### beginWork

和 `hydrate` 有关的只有 `HostRoot(root节点)`、`HostComponent`、`HostText` 三种类型的节点。

```js
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostText:
      return updateHostText(current, workInProgress);
  }
}
function completeUnitOfWork(unitOfWork) {
  var completedWork = unitOfWork;
  do {
    var current = completedWork.alternate;
    var returnFiber = completedWork.return;
    next = completeWork(current, completedWork, subtreeRenderLanes);
    var siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;
      return;
    }
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}
function completeWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case HostComponent:
      // 第一次渲染
      if (current === null) {
        var _wasHydrated = popHydrationState(workInProgress);
        if (_wasHydrated) {
          // 如果存在差异的属性，则将fiber副作用标记为更新
          if (
            prepareToHydrateHostInstance(
              workInProgress,
              rootContainerInstance,
              currentHostContext
            )
          ) {
            markUpdate(workInProgress);
          }
        } else {
        }
      }
  }
}
function popHydrationState(fiber) {
  if (fiber !== hydrationParentFiber) {
    return false;
  }

  if (!isHydrating) {
    return false;
  }

  var type = fiber.type;
  popToNextHostParent(fiber);

  nextHydratableInstance = hydrationParentFiber
    ? getNextHydratableSibling(fiber.stateNode)
    : null;

  return true;
}
function popToNextHostParent(fiber) {
  var parent = fiber.return;

  while (
    parent !== null &&
    parent.tag !== HostComponent &&
    parent.tag !== HostRoot
  ) {
    parent = parent.return;
  }

  hydrationParentFiber = parent;
}
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
  ); // TODO: Type this specific to this type of component.

  fiber.updateQueue = updatePayload; // If the update payload indicates that there is a change or if there
  // is a new ref we mark this as an update.

  if (updatePayload !== null) {
    return true;
  }

  return false;
}
function hydrateInstance(
  instance,
  type,
  props,
  rootContainerInstance,
  hostContext,
  internalInstanceHandle
) {
  instance.__reactFiber$vhm3qckg74k = internalInstanceHandle;
  instance.__reactProps$vhm3qckg74k = props;

  // 比较 domElement.attributes以及props的属性差异，特别是，在比较 children 属性时，会用domElement.textContent和props.children进行全等判断，如果不匹配，则控制台提示：Text content did not match. Server: "%s" Client: "%s"'。当然还有其他属性的比较。如果客户端和服务端的属性不匹配，就提示对应的内容。
  // 有差异的属性会被保存到updatePayload =[key，value]数组中并返回
  return diffHydratedProperties(instance, type, props, parentNamespace);
}
```

### updateHostRoot

`enterHydrationState` 初始化三个全局变量，表明当前第一次渲染处于`hydrating`的过程

- isHydrating。布尔值，全局变量。指示当前第一次渲染处于`hydrating`过程
- nextHydratableInstance。dom 实例，全局变量。保存的是下一个可以被混合(hydrate)的 dom 实例，只有`nodeType`为`ELEMENT_NODE`或者`TEXT_NODE`的真实 dom 实例才可以被混合
- hydrationParentFiber。fiber 实例，全局变量。保存的是当前正在混合的 fiber

```js
function updateHostRoot(current, workInProgress, renderLanes) {
  if (root.hydrate && enterHydrationState(workInProgress)) {
    var child = mountChildFibers(workInProgress, null, nextChildren);
    workInProgress.child = child;
    var node = child;

    while (node) {
      node.flags = (node.flags & ~Placement) | Hydrating;
      node = node.sibling;
    }
  }
  return workInProgress.child;
}
// 初始化三个全局的变量，其中isHydrating指示当前处于`hydrating`的过程
// hydrationParentFiber保存的是当前正在工作的fiber节点
// nextHydratableInstance保存的是下一个可以hydrate的dom实例
function enterHydrationState() {
  var parentInstance = fiber.stateNode.containerInfo;
  nextHydratableInstance = getNextHydratable(parentInstance.firstChild);
  hydrationParentFiber = fiber;
  isHydrating = true;
}
```

### updateHostComponent

```js
function updateHostComponent(current, workInProgress, renderLanes) {
  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```

### updateHostText

```js
function updateHostText(current, workInProgress) {
  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }
  return null;
}
```

### tryToClaimNextHydratableInstance

`tryToClaimNextHydratableInstance` 主要做了几件事：

- 调用 `tryHydrate` 为当前正在工作的 `fiber` 尝试`hydrate`，如果满足`hydrate`的条件，则将 dom 实例赋值给`fiber.stateNode`

```js
function tryToClaimNextHydratableInstance(fiber) {
  if (!isHydrating) {
    return;
  }

  var nextInstance = nextHydratableInstance;

  var firstAttemptedInstance = nextInstance;
  tryHydrate(fiber, nextInstance);
  hydrationParentFiber = fiber;
  nextHydratableInstance = getNextHydratable(nextInstance.firstChild);
}

// 将dom实例保存在 fiber.stateNode上
function tryHydrate(fiber, nextInstance) {
  switch (fiber.tag) {
    case HostComponent: {
      if (
        nextInstance.nodeType === ELEMENT_NODE &&
        fiber.type.toLowerCase() === nextInstance.nodeName.toLowerCase()
      ) {
        fiber.stateNode = nextInstance;
        return true;
      }
      return false;
    }
    case HostText: {
      var text = fiber.pendingProps;
      if (text !== "" && nextInstance.nodeType === TEXT_NODE) {
        fiber.stateNode = nextInstance;
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}
function getNextHydratable(node) {
  // Skip non-hydratable nodes.
  for (; node != null; node = node.nextSibling) {
    var nodeType = node.nodeType;

    if (nodeType === ELEMENT_NODE || nodeType === TEXT_NODE) {
      break;
    }
  }

  return node;
}
```
