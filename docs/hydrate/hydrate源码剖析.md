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
    <div id="root"><div id="root"><div id="container"><h1 id="A">1<div id="A2">A2</div></h1><p id="B"><span id="B1">B1</span></p><span id="C">C</span></div></div></div>
  </body>
</html>
```

注意，`root` 里面的内容不能换行，不然客户端`hydrate`的时候会提示服务端和客户端的模版不一致。

新建 index.jsx：

```js
import React from "react";
import ReactDOM from "react-dom";
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 1,
    };
  }

  render() {
    const { count } = this.state;
    return (
      <div id="container">
        <div id="A">
          {count}
          <div id="A2">A2</div>
        </div>
        <p id="B">
          <span id="B1">B1</span>
        </p>
      </div>
    );
  }
}

ReactDOM.hydrate(<Home />, document.getElementById("root"));
```
对比服务端和客户端的内容可知，服务端`h1#A`和客户端的`div#A`不同，同时服务端比客户端多了一个`span#C`


在客户端开始执行之前，即 `ReactDOM.hydrate` 开始执行前，由于服务端已经返回了 html 内容，浏览器会立马显示内容。对应的真实 DOM 树如下：

TODO：图需要重新画
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

React在render阶段会根据新的element tree构建workInProgress树，收集具有副作用的fiber节点，构建副作用链表。

特别是，当我们调用`ReactDOM.render`函数在客户端进行第一次渲染时，`render`阶段的`completeUnitOfWork`函数针对`HostComponent`以及`HostText`类型的 fiber 执行以下 dom 相关的操作：

- 1. 调用`document.createElement`为`HostComponent`类型的 fiber 节点创建真实的 DOM 实例。或者调用`document.createTextNode`为`HostText`类型的 fiber 节点创建真实的 DOM 实例
- 2. 将 fiber 节点关联到真实 dom 的`__reactFiber$rsdw3t27flk`(后面是随机数)属性上。
- 3. 将 fiber 节点的`pendingProps` 属性关联到真实 dom 的`__reactProps$rsdw3t27flk`(后面是随机数)属性上
- 4. 将真实的 dom 实例关联到`fiber.stateNode`属性上：`fiber.stateNode = dom`。
- 5. 遍历 `pendingProps`，给真实的`dom`设置属性，比如设置 id、textContent 等

**React 渲染更新完成后，React 会为每个真实的 dom 实例挂载两个私有的属性：`__reactFiber$`和`__reactProps$`**，以`div#container`为例：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hydrate-02.jpg)

## ReactDOM.hydrate

`hydrate`中文意思是`水合物`，这样理解有点抽象。根据源码，我更乐意将`hydrate`的过程描述为：React在render阶段，构造workInProgress树时，同时**按相同的顺序**遍历真实的DOM树，判断当前的workInProgress fiber节点和同一位置的dom实例是否满足`hydrate`的条件，如果满足，则直接复用当前位置的DOM实例，并相互关联workInProgress fiber节点和真实的dom实例，比如：
```js
fiber.stateNode = dom
dom.__reactProps$ = fiber.pendingProps
dom.__reactFiber$ = fiber
```
如果fiber和dom满足`hydrate`的条件，则还需要找出`dom.attributes`和`fiber.pendingProps`之间的属性差异。

遍历真实DOM树的顺序和构建workInProgress树的顺序是一致的。都是深度优先遍历，先遍历当前节点的子节点，子节点都遍历完了以后，再遍历当前节点的兄弟节点。因为只有按相同的顺序，fiber树同一位置的fiber节点和dom树同一位置的dom节点才能保持一致

只有类型为`HostComponent`或者`HostText`类型的fiber节点才能`hydrate`。这一点也很好理解，React在commit阶段，也就只有这两个类型的fiber节点才需要执行dom操作。

fiber节点和dom实例是否满足`hydrate`的条件：

- 对于类型为`HostComponent`的fiber节点，如果当前位置对应的DOM实例`nodeType`为`ELEMENT_NODE`，并且`fiber.type === dom.nodeName`，那么当前的fiber可以混合(hydrate)

- 对于类型为`HostText`的fiber节点，如果当前位置对应的DOM实例`nodeType`为`TEXT_NODE`，同时`fiber.pendingProps`不为空，那么当前的fiber可以混合(hydrate)

**`hydrate`的终极目标就是，在构造 workInProgress 树的过程中，尽可能的复用当前浏览器已经存在的 DOM 实例以及 DOM 上的属性，这样就无需再为 fiber 节点创建 DOM 实例，同时对比现有的 DOM 的`attribute`以及 fiber 的`pendingProps`，找出差异的属性。然后将 dom 实例和 fiber 节点相互关联(通过 dom 实例的`__reactFiber$`以及`__reactProps$`，fiber 的 stateNode 相互关联)**

### fiber节点和DOM实例对比规则
React在render阶段构造`HostComponent`或者`HostText`类型的fiber节点时，会首先调用`    tryToClaimNextHydratableInstance(workInProgress)` 方法尝试给当前fiber混合(hydrate)DOM实例。如果当前fiber不能被混合，那当前节点的所有子节点在后续的render过程中都不再进行`hydrate`，而是直接创建dom实例。等到当前节点所有子节点都调用`completeUnitOfWork`完成工作后，又会从当前节点的兄弟节点开始尝试混合。

以下面的demo为例
```js
// 服务端返回的DOM结构，这里为了直观，我格式化了一下，按理服务端返回的内容，是不允许换行或者有空字符串的
<body>
  <div id="root">
    <div id="container">
      <h1 id="A">
        1
        <div id="A2">A2</div>
      </h1>
      <p id="B">
        <span id="B1">B1</span>
      </p>
      <span id="C">C</span>
    </div>
  </div>
</body>
// 客户端生成的内容
<div id="container">
  <div id="A">
    1
    <div id="A2">A2</div>
  </div>
  <p id="B">
    <span id="B1">B1</span>
  </p>
</div>
```
render阶段，按以下顺序：
- 1. `div#container` 满足`hydrate`的条件，因此关联dom，`fiber.stateNode = div#container`。然后使用`hydrationParentFiber`记录当前混合的fiber节点：`hydrationParentFiber = fiber`。获取下一个DOM实例，这里是`h1#A`，保存在变量`nextHydratableInstance`中，`nextHydratableInstance = h1#A`。

这里，`hydrationParentFiber` 和 `nextHydratableInstance` 都是全局变量。

- 2. `div#A` 和 `h1#A` 不能混合，这时并不会立即结束混合的过程，React继续对比`h1#A`的兄弟节点，即`p#B`，发现`div#A`还是不能和`p#B`混合，经过**最多两次对比**，React认为dom树中已经没有dom实例满足和`div#A`这个fiber混合的条件，于是`div#A`节点及其所有子孙节点都不再进行混合的过程，此时将`isHydrating`设置为false表明`div#A`这棵子树都不再走混合的过程，直接走创建dom实例。同时控制台提示：`Expected server HTML to contain a matching..` 之类的错误。

- 3. beginWork执行到文本节点 `1` 时，发现 `isHydrating = false`，因此直接跳过混合的过程，在`completeUnitOfWork`阶段直接调用`document.createTextNode`直接为其创建文本节点

- 4. 同样的，beginWork执行到节点`div#A2`时，发现`isHydrating = false`，因此直接跳过混合的过程，在`completeUnitOfWork`阶段直接调用`document.createElement`直接为其创建真实dom实例，并设置属性

- 5. 由于`div#A`的子节点都已经`completeUnitWork`了，轮到`div#A`调用`completeUnitWork`完成工作，将`hydrationParentFiber`指向其父节点，即`div#container`这个dom实例。设置`isHydrating = true`表明可以为当前节点的兄弟节点继续混合的过程了。`div#A`没有混合的dom实例，因此调用`document.createElement`为其创建真实的dom实例。

- 6. 为`p#B`执行beginWork。由于`nextHydratableInstance`保存的还是`h1#A`dom实例，因此`p#B`和`h1#A`对比发现不能复用，React尝试和`h1#A`的兄弟节点`p#B`对比，发现fiber`p#B`和dom`p#B`能混，因此将`h1#A`标记为删除，同时关联dom实例：`fiber.stateNode = p#B`，保存`hydrationParentFiber = fiber`，`nextHydratableInstance`指向`p#B`的第一个子节点，即`span#B1`
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
