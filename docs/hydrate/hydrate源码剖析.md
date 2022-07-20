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

React 在 render 阶段会根据新的 element tree 构建 workInProgress 树，收集具有副作用的 fiber 节点，构建副作用链表。

特别是，当我们调用`ReactDOM.render`函数在客户端进行第一次渲染时，`render`阶段的`completeUnitOfWork`函数针对`HostComponent`以及`HostText`类型的 fiber 执行以下 dom 相关的操作：

- 1. 调用`document.createElement`为`HostComponent`类型的 fiber 节点创建真实的 DOM 实例。或者调用`document.createTextNode`为`HostText`类型的 fiber 节点创建真实的 DOM 实例
- 2. 将 fiber 节点关联到真实 dom 的`__reactFiber$rsdw3t27flk`(后面是随机数)属性上。
- 3. 将 fiber 节点的`pendingProps` 属性关联到真实 dom 的`__reactProps$rsdw3t27flk`(后面是随机数)属性上
- 4. 将真实的 dom 实例关联到`fiber.stateNode`属性上：`fiber.stateNode = dom`。
- 5. 遍历 `pendingProps`，给真实的`dom`设置属性，比如设置 id、textContent 等

**React 渲染更新完成后，React 会为每个真实的 dom 实例挂载两个私有的属性：`__reactFiber$`和`__reactProps$`**，以`div#container`为例：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hydrate-02.jpg)

## ReactDOM.hydrate

`hydrate`中文意思是`水合物`，这样理解有点抽象。根据源码，我更乐意将`hydrate`的过程描述为：React 在 render 阶段，构造 workInProgress 树时，同时**按相同的顺序**遍历真实的 DOM 树，判断当前的 workInProgress fiber 节点和同一位置的 dom 实例是否满足`hydrate`的条件，如果满足，则直接复用当前位置的 DOM 实例，并相互关联 workInProgress fiber 节点和真实的 dom 实例，比如：

```js
fiber.stateNode = dom;
dom.__reactProps$ = fiber.pendingProps;
dom.__reactFiber$ = fiber;
```

如果 fiber 和 dom 满足`hydrate`的条件，则还需要找出`dom.attributes`和`fiber.pendingProps`之间的属性差异。

遍历真实 DOM 树的顺序和构建 workInProgress 树的顺序是一致的。都是深度优先遍历，先遍历当前节点的子节点，子节点都遍历完了以后，再遍历当前节点的兄弟节点。因为只有按相同的顺序，fiber 树同一位置的 fiber 节点和 dom 树同一位置的 dom 节点才能保持一致

只有类型为`HostComponent`或者`HostText`类型的 fiber 节点才能`hydrate`。这一点也很好理解，React 在 commit 阶段，也就只有这两个类型的 fiber 节点才需要执行 dom 操作。

fiber 节点和 dom 实例是否满足`hydrate`的条件：

- 对于类型为`HostComponent`的 fiber 节点，如果当前位置对应的 DOM 实例`nodeType`为`ELEMENT_NODE`，并且`fiber.type === dom.nodeName`，那么当前的 fiber 可以混合(hydrate)

- 对于类型为`HostText`的 fiber 节点，如果当前位置对应的 DOM 实例`nodeType`为`TEXT_NODE`，同时`fiber.pendingProps`不为空，那么当前的 fiber 可以混合(hydrate)

**`hydrate`的终极目标就是，在构造 workInProgress 树的过程中，尽可能的复用当前浏览器已经存在的 DOM 实例以及 DOM 上的属性，这样就无需再为 fiber 节点创建 DOM 实例，同时对比现有的 DOM 的`attribute`以及 fiber 的`pendingProps`，找出差异的属性。然后将 dom 实例和 fiber 节点相互关联(通过 dom 实例的`__reactFiber$`以及`__reactProps$`，fiber 的 stateNode 相互关联)**

### hydrate 过程

React 在 render 阶段构造`HostComponent`或者`HostText`类型的 fiber 节点时，会首先调用` tryToClaimNextHydratableInstance(workInProgress)` 方法尝试给当前 fiber 混合(hydrate)DOM 实例。如果当前 fiber 不能被混合，那当前节点的所有子节点在后续的 render 过程中都不再进行`hydrate`，而是直接创建 dom 实例。等到当前节点所有子节点都调用`completeUnitOfWork`完成工作后，又会从当前节点的兄弟节点开始尝试混合。

以下面的 demo 为例

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

render 阶段，按以下顺序：

- 1. `div#container` 满足`hydrate`的条件，因此关联 dom，`fiber.stateNode = div#container`。然后使用`hydrationParentFiber`记录当前混合的 fiber 节点：`hydrationParentFiber = fiber`。获取下一个 DOM 实例，这里是`h1#A`，保存在变量`nextHydratableInstance`中，`nextHydratableInstance = h1#A`。

这里，`hydrationParentFiber` 和 `nextHydratableInstance` 都是全局变量。

- 2. `div#A` 和 `h1#A` 不能混合，这时并不会立即结束混合的过程，React 继续对比`h1#A`的兄弟节点，即`p#B`，发现`div#A`还是不能和`p#B`混合，经过**最多两次对比**，React 认为 dom 树中已经没有 dom 实例满足和`div#A`这个 fiber 混合的条件，于是`div#A`节点及其所有子孙节点都不再进行混合的过程，此时将`isHydrating`设置为 false 表明`div#A`这棵子树都不再走混合的过程，直接走创建 dom 实例。同时控制台提示：`Expected server HTML to contain a matching..` 之类的错误。

- 3. beginWork 执行到文本节点 `1` 时，发现 `isHydrating = false`，因此直接跳过混合的过程，在`completeUnitOfWork`阶段直接调用`document.createTextNode`直接为其创建文本节点

- 4. 同样的，beginWork 执行到节点`div#A2`时，发现`isHydrating = false`，因此直接跳过混合的过程，在`completeUnitOfWork`阶段直接调用`document.createElement`直接为其创建真实 dom 实例，并设置属性

- 5. 由于`div#A`的子节点都已经`completeUnitWork`了，轮到`div#A`调用`completeUnitWork`完成工作，将`hydrationParentFiber`指向其父节点，即`div#container`这个 dom 实例。设置`isHydrating = true`表明可以为当前节点的兄弟节点继续混合的过程了。`div#A`没有混合的 dom 实例，因此调用`document.createElement`为其创建真实的 dom 实例。

- 6. 为`p#B`执行 beginWork。由于`nextHydratableInstance`保存的还是`h1#A`dom 实例，因此`p#B`和`h1#A`对比发现不能复用，React 尝试和`h1#A`的兄弟节点`p#B`对比，发现 fiber`p#B`和 dom`p#B`能混，因此将`h1#A`标记为删除，同时关联 dom 实例：`fiber.stateNode = p#B`，保存`hydrationParentFiber = fiber`，`nextHydratableInstance`指向`p#B`的第一个子节点，即`span#B1`

...省略了后续的过程。

从上面的执行过程可以看出，hydrate 的过程如下：

- 调用 `tryToClaimNextHydratableInstance` 开始混合
- 判断当前 fiber 节点和同一位置的 dom 实例是否满足混合的条件。
- 如果当前位置的 dom 实例不满足混合条件，则继续比较当前 dom 的兄弟元素，如果兄弟元素和当前的 fiber 也不能混合，则当前 fiber 及其所有子孙节点都不能混合，后续 render 过程将会跳过混合。直到当前 fiber 节点的兄弟节点 render，才会继续混合的过程。


### 事件绑定
React在初次渲染时，不论是`ReactDOM.render`还是`ReactDOM.hydrate`，会调用`createRootImpl`函数创建fiber的容器，在这个函数中调用`listenToAllSupportedEvents`注册所有原生的事件。
```js
function createRootImpl(container, tag, options) {
  // ...
  var root = createContainer(container, tag, hydrate);
  // ...
  listenToAllSupportedEvents(container);
  // ...
  return root;
}
```
这里`container`就是`div#root`节点。`listenToAllSupportedEvents`会给`div#root`节点注册浏览器支持的所有原生事件，比如`onclick`等。[React合成事件](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/%E4%BB%8E0%E5%88%B01%E6%A8%A1%E6%8B%9F%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6.md)一文介绍过，React采用的是事件委托的机制，将所有事件代理到`div#root`节点上。以下面的为例：
```jsx
<div id="A" onClick={this.handleClick}>
button
<div>
```
我们知道React在渲染时，会将fiber的props关联到真实的dom的`__reactProps$`属性上，此时
```js
div#A.__reactProps$ = {
  onClick: this.handleClick
}
```
当我们点击按钮时，会触发`div#root`上的事件监听器：
```js
function onclick(e){
  const target = e.target
  const fiberProps = target.__reactProps$
  const clickhandle = fiberProps.onClick
  if(clickhandle){
    clickhandle(e)
  }
}
```
这样我们就可以实现事件的委托。这其中**最重要的就是将fiber的props挂载到真实的dom实例的__reactProps$属性上**。因此，只要我们在`hydrate`阶段能够成功关联dom和fiber，就自然也实现了事件的“绑定”
## hydrate 源码剖析

hydrate 的过程发生在 render 阶段，commit 阶段几乎没有和 hydrate 相关的逻辑。render 阶段又分为两个小阶段：`beginWork` 和 `completeUnitOfWork`。只有`HostRoot`、`HostComponent`、`HostText`三种类型的 fiber 节点才需要 hydrate，因此源码只针对这三种类型的 fiber 节点剖析

## beginWork

beginWork 阶段判断 fiber 和 dom 实例是否满足混合的条件，如果满足，则为 fiber 关联 dom 实例：`fiber.stateNode = dom`

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
```

### HostRoot Fiber

`HostRoot` fiber 是容器`root`的 fiber 节点。

这里主要是判断当前 render 是`ReactDOM.render`还是`ReactDOM.hydrate`，我们调用`ReactDOM.hydrate`渲染时，`root.hydrate`为 true。

如果是调用的`ReactDOM.hydrate`，则调用`enterHydrationState`函数进入`hydrate`的过程。这个函数主要是初始化几个全局变量：

- isHydrating。表示当前正处于 hydrate 的过程。如果当前节点及其所有子孙节点都不满足 hydrate 的条件时，这个变量为 false
- hydrationParentFiber。当前混合的 fiber。正常情况下，该变量和`HostComponent`或者`HostText`类型的 workInProgress 一致。
- nextHydratableInstance。下一个可以混合的 dom 实例。当前 dom 实例的第一个子元素或者兄弟元素。

注意`getNextHydratable`会判断 dom 实例是否是`ELEMENT_NODE`类型(对应的 fiber 类型是`HostComponent`)或者`TEXT_NODE`类型(对应的 fiber 类型是`HostText`)。只有`ELEMENT_NODE`或者`HostText`类型的 dom 实例才是可以 hydrate 的

```js
function updateHostRoot(current, workInProgress, renderLanes) {
  if (root.hydrate && enterHydrationState(workInProgress)) {
    var child = mountChildFibers(workInProgress, null, nextChildren);
  }
  return workInProgress.child;
}
function getNextHydratable(node) {
  // 跳过 non-hydratable 节点.
  for (; node != null; node = node.nextSibling) {
    var nodeType = node.nodeType;
    if (nodeType === ELEMENT_NODE || nodeType === TEXT_NODE) {
      break;
    }
  }
  return node;
}

function enterHydrationState() {
  var parentInstance = fiber.stateNode.containerInfo;
  nextHydratableInstance = getNextHydratable(parentInstance.firstChild);
  hydrationParentFiber = fiber;
  isHydrating = true;
}
```

### HostComponent

```js
function updateHostComponent(current, workInProgress, renderLanes) {
  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```

### HostText Fiber

```js
function updateHostText(current, workInProgress) {
  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }
  return null;
}
```

### tryToClaimNextHydratableInstance

假设当前 fiberA 对应位置的 dom 为 domA，`tryToClaimNextHydratableInstance` 会首先调用`tryHydrate`判断 fiberA 和 domA 是否满足混合的条件：

- 如果 fiberA 和 domA 满足混合的条件，则将`hydrationParentFiber = fiberA;`。并且获取 domA 的第一个子元素赋值给`nextHydratableInstance`
- 如果 fiberA 和 domA 不满足混合的条件，则获取 domA 的兄弟节点，即 domB，调用`tryHydrate`判断 fiberA 和 domB 是否满足混合条件：
  - 如果 domB 满足和 fiberA 混合的条件，则将 domA 标记为删除，并获取 domB 的第一个子元素赋值给`nextHydratableInstance`
  - 如果 domB 不满足和 fiberA 混合的条件，则调用`insertNonHydratedInstance`提示错误："Warning: Expected server HTML to contain a matching"，同时将`isHydrating`标记为 false 退出。

这里可以看出，`tryToClaimNextHydratableInstance`最多比较两个 dom 节点，如果两个 dom 节点都无法满足和 fiberA 混合的条件，则说明当前 fiberA 及其所有的子孙节点都无需再进行混合的过程，因此将`isHydrating`标记为 false。等到当前 fiberA 节点及其子节点都完成了工作，即都执行了`completeWork`，`isHydrating`才会被设置为 true，以便继续比较 fiberA 的兄弟节点

这里还需要注意一点，如果两个 dom 都无法满足和 fiberA 混合，那么`nextHydratableInstance`依然保存的是 domA，domA 会继续和 fiberA 的兄弟节点比对。

```js
function tryToClaimNextHydratableInstance(fiber) {
  if (!isHydrating) {
    return;
  }
  var nextInstance = nextHydratableInstance;
  var firstAttemptedInstance = nextInstance;

  if (!tryHydrate(fiber, nextInstance)) {
    // 如果第一次调用tryHydrate发现当前fiber和dom不满足hydrate的条件，则获取dom的兄弟节点
    // 然后调用 tryHydrate 继续对比fiber和兄弟节点是否满足混合
    nextInstance = getNextHydratableSibling(firstAttemptedInstance);

    if (!nextInstance || !tryHydrate(fiber, nextInstance)) {
      // 对比了两个dom发现都无法和fiber混合，因此调用insertNonHydratedInstance控制台提示错误
      insertNonHydratedInstance(hydrationParentFiber, fiber);
      isHydrating = false;
      hydrationParentFiber = fiber;
      return;
    }
    // 如果第一次tryHydrate不满足，第二次tryHydrate满足，则说明兄弟节点和当前fiber是可以混合的，此时需要删除当前位置的dom
    deleteHydratableInstance(hydrationParentFiber, firstAttemptedInstance);
  }

  hydrationParentFiber = fiber;
  nextHydratableInstance = getFirstHydratableChild(nextInstance);
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
```

## completeUnitOfWork

completeUnitOfWork 阶段主要是给 dom 关联 fiber 以及 props：`dom.__reactProps$ = fiber.pendingProps;dom.__reactFiber$ = fiber;`同时对比`fiber.pendingProps`和`dom.attributes`的差异

```js
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
    case HostRoot: {
      if (current === null) {
        var wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          markUpdate(workInProgress);
        }
      }
      return null;
    }
    case HostComponent:
      // 第一次渲染
      if (current === null) {
        var _wasHydrated = popHydrationState(workInProgress);
        if (_wasHydrated) {
          // 如果存在差异的属性，则将fiber副作用标记为更新
          if (prepareToHydrateHostInstance(workInProgress)) {
            markUpdate(workInProgress);
          }
        } else {
        }
      }
    case HostText: {
      var newText = newProps;
      if (current === null) {
        var _wasHydrated2 = popHydrationState(workInProgress);
        if (_wasHydrated2) {
          if (prepareToHydrateHostTextInstance(workInProgress)) {
            markUpdate(workInProgress);
          }
        }
      }
      return null;
    }
  }
}
```

### popHydrationState

```js
function popHydrationState(fiber) {
  if (fiber !== hydrationParentFiber) {
    return false;
  }

  if (!isHydrating) {
    popToNextHostParent(fiber);
    isHydrating = true;
    return false;
  }

  var type = fiber.type;

  if (
    fiber.tag !== HostComponent ||
    !shouldSetTextContent(type, fiber.memoizedProps)
  ) {
    var nextInstance = nextHydratableInstance;

    while (nextInstance) {
      deleteHydratableInstance(fiber, nextInstance);
      nextInstance = getNextHydratableSibling(nextInstance);
    }
  }

  popToNextHostParent(fiber);

  nextHydratableInstance = hydrationParentFiber
    ? getNextHydratableSibling(fiber.stateNode)
    : null;

  return true;
}
```

以下图为例：
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hydrate-03.jpg)

在 beginWork 阶段对 `p#B` fiber 工作时，发现 dom 树中同一位置的`h1#B`不满足混合的条件，于是继续对比`h1#B`的兄弟节点，即`div#C`，仍然无法混合，经过最多两轮对比后发现`p#B`这个 fiber 没有可以混合的 dom 节点，于是将 `isHydrating` 标记为 false，`hydrationParentFiber = fiberP#B`。`p#B`的子孙节点都不再进行混合的过程。

`div#B1`fiber 没有子节点，因此它可以调用`completeUnitOfWork`完成工作，`completeUnitOfWork` 阶段调用 `popHydrationState` 方法，在`popHydrationState`方法内部，首先判断 `fiber !== hydrationParentFiber`，由于此时的`hydrationParentFiber`等于`p#B`，因此条件成立，不用往下执行。

由于`p#B` fiber 的子节点都已经完成了工作，因此它也可以调用`completeUnitOfWork`完成工作。同样的，在`popHydrationState`函数内部，第一个判断`fiber !== hydrationParentFiber`不成立，两者是相等的。第二个条件`!isHydrating`成立，进入条件语句，首先调用`popToNextHostParent`将`hydrationParentFiber`设置为`p#B`的第一个类型为`HostComponent`的祖先元素，这里是`div#A` fiber，然后将`isHydrating`设置为 true，指示可以为`p#B`的兄弟节点进行混合。

如果服务端返回的 DOM 有多余的情况，则调用`deleteHydratableInstance`将其删除，比如下图中`div#D`节点将会在`div#A`fiber 的`completeUnitOfWork`阶段删除
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hydrate-04.jpg)

### prepareToHydrateHostInstance

对于`HostComponent`类型的fiber会调用这个方法，这里只要是关联 dom 和 fiber：

- 设置`domInstance.__reactFiber$w63z5ormsqk = fiber`
- 设置`domInstance.__reactProps$w63z5ormsqk = props`
- 对比服务端和客户端的属性

```js
function prepareToHydrateHostInstance(fiber) {
  var domInstance = fiber.stateNode;
  var updatePayload = hydrateInstance(
    domInstance,
    fiber.type,
    fiber.memoizedProps,
    fiber
  );

  fiber.updateQueue = updatePayload;
  if (updatePayload !== null) {
    return true;
  }

  return false;
}
function hydrateInstance(domInstance, type, props, fiber) {
  precacheFiberNode(fiber, domInstance); // domInstance.__reactFiber$w63z5ormsqk = fiber
  updateFiberProps(domInstance, props); // domInstance.__reactProps$w63z5ormsqk = props

  // 比较dom.attributes和props的差异，如果dom.attributes的属性比props多，说明服务端添加了额外的属性，此时控制台提示。
  // 注意，在对比过程中，只有服务端和客户端的children属性(即文本内容)不同时，控制台才会提示错误，同时在commit阶段，客户端会纠正这个错误，以客户端的文本为主。
  // 但是，如果是id不同，则客户端并不会纠正。
  return diffHydratedProperties(domInstance, type, props);
}
```

这里重点讲下`diffHydratedProperties`，以下面的demo为例：
```js
// 服务端对应的dom
<div id="root"><div extra="server attr" id="server">客户端的文本</div></div>
// 客户端
render() {
  const { count } = this.state;
  return <div id="client">客户端的文本</div>;
}
```
在`diffHydratedProperties`的过程中发现，服务端返回的id和客户端的id不同，控制台提示id不匹配，但是客户端并不会纠正这个，可以看到浏览器的id依然是`server`。

同时，服务端多返回了一个`extra`属性，因此需要控制台提示，但由于已经提示了id不同的错误，这个错误就不会提示。

最后，客户端的文本和服务端的children不同，即文本内容不同，也需要提示错误，同时，客户端会纠正这个文本，以客户端的为主。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hydrate-05.jpg)


### prepareToHydrateHostTextInstance
对于`HostText`类型的fiber会调用这个方法，这个方法逻辑比较简单，就不详细介绍了