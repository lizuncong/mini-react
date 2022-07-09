### 大纲

- 双缓冲树机制
- 删除节点时如何释放内存，即如何删除旧的 fiber 节点
- 为什么需要重用 alternate 节点，重新创建不行吗？

### 背景

在[React 初次渲染及更新流程](https://github.com/lizuncong/mini-react/blob/master/docs/render/%E6%B7%B1%E5%85%A5%E6%A6%82%E8%BF%B0%20React%E5%88%9D%E6%AC%A1%E6%B8%B2%E6%9F%93%E5%8F%8A%E7%8A%B6%E6%80%81%E6%9B%B4%E6%96%B0%E4%B8%BB%E6%B5%81%E7%A8%8B.md)一文介绍过 React 渲染更新主要分为两个阶段：render 阶段和 commit 阶段。render 阶段主要是将新的 element tree 和 当前页面对应的 fiber 树(即 curent tree)比较，并构建一棵 workInProgress 树以及收集有副作用的 fiber 节点。render 阶段完成后，我们将得到一棵 finishedWork 树以及一个副作用链表。render 阶段是异步可以中断的

在 commit 阶段主要就是遍历副作用链表，并执行相应的 dom 操作等。commit 阶段是同步且不可中断的

### Fiber 双缓冲树

由于 render 阶段构建 workInProgress 树的过程是可以中断的，同时，workInProgress 树最终又会在 commit 阶段渲染到浏览器页面上，这就决定了在 render 阶段，必须要保持浏览器页面不变直到 render 阶段完成。也就是说我们在 render 阶段需要保持 current tree 不变，然后用另一棵树来承载 workInProgress 树。为了实现这个目标，React 借鉴了[双缓冲](https://baike.baidu.com/item/%E5%8F%8C%E7%BC%93%E5%86%B2/10953356?fr=aladdin)技术。

Fiber 双缓冲树包括一棵 current tree 和一棵 workInProgress tree(render 阶段完成后的 workInProgress 树也叫 finishedWork 树)。current tree 保存的是当前浏览器页面对应的 fiber 节点。workInProgress tree 是在 render 阶段，react 基于 current tree 和新的 element tree 进行比较而构建的一棵树，这棵树是在内存中构建，在 commit 阶段将被绘制到浏览器页面上。

current 树保存在容器节点的 `root._reactRootContainer._internalRoot.current` 属性上。在 render 阶段构建 workInProgress 树的过程中，我们可以通过`root._reactRootContainer._internalRoot.current.alternate` 访问到 workInProgress 树。

下面是各个阶段的 current tree 和 workInProgress tree 的状态

render 阶段完成，commit 阶段开始前，我们会得到一棵 finishedWork 树，实际上这就是 render 过程结束后得到的 workInProgress 树，finishedWork 树可以通过`root._reactRootContainer._internalRoot.finishedWork`属性获取。

#### render 阶段

在这个阶段，浏览器页面对应的 fiber 树仍然是 current 树，workInProgress 树正在构建

在 render 阶段构建 workInProgress 树的过程主要逻辑在 `performUnitOfWork`，因此我们可以在这个函数处打个断点查看 render 阶段的 workInProgress 树。

workInProgress 表示当前正在工作的 fiber 节点，这些 workInProgress 节点构成了一棵 workInProgress 树。我们可以通过`root._reactRootContainer._internalRoot.current.alternate`属性访问当前工作中的 workInProgress 树

```js
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-01.jpg)

#### render 阶段完成，commit 阶段开始前

在这个阶段，浏览器页面对应的 fiber 树仍然是 current 树，workInProgress 树已经构建完毕，得到 finishedWork 树

render 阶段完成，commit 阶段开始前，workInProgress 树构建完成，我们得到一棵 finishedWork 树，此时将 workInProgress 树复制给容器的 finishedWork 属性，这段逻辑在 `performSyncWorkOnRoot` 函数中

```js
function performSyncWorkOnRoot(root) {
  //...
  renderRootSync(root, lanes); // render阶段，构建workInProgress树
  // ...render阶段结束
  var finishedWork = root.current.alternate;
  root.finishedWork = finishedWork; // 将workInProgress树赋值给finishedWork属性
  commitRoot(root); // commit阶段，将finishedWork树更新到浏览器页面
  // ...
}
```

可以在 `performSyncWorkOnRoot` 处打断点查看这个过程
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-02.jpg)

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-03.jpg)

#### commit 阶段

这个阶段完成后，finishedWork 树就变成了 current 树

可以看出`commitRoot`函数调用的是`commitRootImpl`函数，在 `commitRootImpl` 函数执行的一开始，`root.finishedWork`就已经被置空，所以`finishedWork`属性存在的时间是非常短的。

- commitBeforeMutationEffects。DOM 变更前，主要是调用类组件的`getSnapshotBeforeUpdate`、函数组件的`useEffect`的清除函数等
- commitMutationEffects。DOM 变更，**这个函数主要是将 finishedWork 树绘制到浏览器页面!!!**
- commitLayoutEffects。DOM 变更后。

关于 `commitBeforeMutationEffects`、`commitMutationEffects`以及`commitLayoutEffects`这三个函数的主要作用，在[深入概述 React 初次渲染以及 setState 状态更新主流程](https://github.com/lizuncong/mini-react/blob/master/docs/render/%E6%B7%B1%E5%85%A5%E6%A6%82%E8%BF%B0%20React%E5%88%9D%E6%AC%A1%E6%B8%B2%E6%9F%93%E5%8F%8A%E7%8A%B6%E6%80%81%E6%9B%B4%E6%96%B0%E4%B8%BB%E6%B5%81%E7%A8%8B.md)一文中已经有详细介绍，有兴趣的可以看看。

从下面的函数执行可以看出，在`commitMutationEffects`函数执行之前，浏览器页面对应的依旧是 current 树，在`commitMutationEffects`执行完成后，React 已经将 finishedWork 树渲染到浏览器页面上，此时 finishedWork 树就变成了 current 树！！

```js
function commitRoot(root) {
  var renderPriorityLevel = getCurrentPriorityLevel();
  runWithPriority$1(
    ImmediatePriority$1,
    commitRootImpl.bind(null, root, renderPriorityLevel)
  );
  return null;
}
function commitRootImpl(root, renderPriorityLevel) {
  // 暂存finishedWork树
  var finishedWork = root.finishedWork;
  // 注意，在commitRootImpl函数执行的开始，finishedWork属性已经被置空
  root.finishedWork = null;

  root.callbackNode = null;

  if (firstEffect !== null) {
    nextEffect = firstEffect;

    commitBeforeMutationEffects();

    nextEffect = firstEffect;
    commitMutationEffects(root, renderPriorityLevel);
    // commitMutationEffects执行完成后，将finishedWork树赋值给current tree。
    root.current = finishedWork;
    commitLayoutEffects(root, lanes);
  }

  return null;
}
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-04.jpg)

**如果你看完上面介绍的几个阶段中 Fiber 双缓冲树的状态，还是很蒙的话，那一定是我写的太烂了。下面我会用几个 demo 详细介绍双缓冲树的创建过程。在此之前，你只需要记住 render 阶段和 commit 阶段双缓冲树的状态就行了**

### 构建 workInProgress 树主要的源码

本节介绍 render 阶段构建 workInProgress 树的主要源码，在阅读本文时，可以在下面介绍的各个函数入口处打断点调试。

render 阶段主要涉及的入口函数

```js
// render阶段
var __DEBUG_RENDER_COUNT__ = 0;

function renderRootSync(root, lanes) {
  __DEBUG_RENDER_COUNT__++;

  prepareFreshStack(root, lanes);

  workLoopSync();

  return workInProgressRootExitStatus;
}
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  var current = unitOfWork.alternate;
  next = beginWork$1(current, unitOfWork, subtreeRenderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}

function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  }
}
```

`beginWork`主要是负责处理各类型 fiber 节点，并调用 `reconcileChildren` 协调子元素。在 `reconcileChildren`的过程中，调用 `useFiber`复用旧的节点或者 `createFiberFromElement` 创建新的节点。fiber 根节点，即 rootFiber 的创建或者复用在`prepareFreshStack`函数中完成。

注意，我在 `renderRootSync` 函数前加了一个`__DEBUG_RENDER_COUNT__`变量，这个变量在 `createWorkInProgress` 使用，方便区分当前的 fiber 以及 workInProgress
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-05.jpg)

```js
function useFiber(fiber, pendingProps) {
  // We currently set sibling to null and index to 0 here because it is easy
  // to forget to do before returning it. E.g. for the single child case.
  var clone = createWorkInProgress(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}
// This is used to create an alternate fiber to do work on.
function createWorkInProgress(current, pendingProps) {
  var workInProgress = current.alternate;

  if (workInProgress === null) {
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other" unused
    // node that we're free to reuse. This is lazily created to avoid allocating
    // extra objects for things that are never updated. It also allow us to
    // reclaim the extra memory if needed.
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    );
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;
    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
  }
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.AAA__DEBUG_RENDER_COUNT__ = __DEBUG_RENDER_COUNT__;
  return workInProgress;
}
```

`createWorkInProgress`用于复用旧的 fiber 节点，并使用 current 的属性覆盖旧的属性。注意在创建新的 fiber 节点时，`alternate`相互指向。

```js
workInProgress.alternate = current;
current.alternate = workInProgress;
```

### 第一次渲染

下面的 Demo 用来演示在 render 阶段如何基于当前的 current 树创建新的 fiber 节点或者复用旧的 fiber 节点，从而构建一棵 workInProgress 树。

```jsx
import React from "react";
import ReactDOM from "react-dom";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 0 };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({
      step: this.state.step + 1,
    });
  }
  render() {
    const { step } = this.state;
    return step < 3 ? (
      <div id={step} onClick={this.handleClick}>
        {step}
      </div>
    ) : (
      <p id={step} onClick={this.handleClick}>
        {step}
      </p>
    );
  }
}

ReactDOM.render(<Home />, document.getElementById("root"));
```

#### 创建 Fiber 树的容器以及 HostRootFiber

第一次渲染时，current 树为空，React 需要构造一棵全新的树。React 在第一次渲染时，首先给 root 容器创建一个`FiberRootNode`节点，该节点用于承载`current`树以及`finishedWork`树，是整个 fiber 树的容器。在创建`FiberRootNode`节点时，同时为 root 节点创建`HostRootFiber`，这也是整个 fiber 树的根节点

```js
function createFiberRoot(containerInfo, tag, hydrate, hydrationCallbacks) {
  var root = new FiberRootNode(containerInfo, tag, hydrate);
  // stateNode is any.
  var uninitializedFiber = createHostRootFiber(tag);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  initializeUpdateQueue(uninitializedFiber);
  return root;
}
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-06.jpg)

`createFiberRoot`执行完成，此时 fiber 树的容器已经创建完毕。进入 `renderRootSync` 函数，render 阶段开始。

#### prepareFreshStack：为 HostRootFiber 创建对应的 workInProgress 节点

在 `renderRootSync` 中， `prepareFreshStack`函数调用`createWorkInProgress(root.current, null)` 开始为 HostRootFiber(即容器 root 的 fiber 节点)创建对应的 workInProgress fiber。由于此时的 HostRootFiber 还没有备用节点，即 `root.current.alternate` 为空，因此`createWorkInProgress`会新建一个 fiber 节点，并互相关联 `alternate` 属性

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-07.jpg)

接下来进入 `workLoopSync` render 工作循环。

```js
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
```

#### performUnitOfWork(HostRootFiber)：为 Home 节点创建 workInProgress 节点

第一个开始工作的 workInProgress 节点就是新创建的 HostRootFiber 节点。`performUnitOfWork` 为 HostRootFiber 节点协调子元素。在本例中，HostRootFiber 的子元素就是`Home`类对应的元素。第一次渲染时，Home 没有备用的 fiber 节点，因此需要调用 `createFiberFromElement` 为 Home 创建全新的 fiber 节点
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-08.jpg)

#### performUnitOfWork(HomeFiber)：为 div 节点创建对应的 workInProgress 节点

HostRootFiber 的`performUnitOfWork`执行完成，开始为`Home`执行`performUnitOfWork`，`Home`开始工作。调用 `new Home()` 初始化类组件，并挂载到 `Home fiber` 的`stateNode`属性上。同时为 Home 协调子元素，在本例中，Home 的子元素是 div，为 div 创建 fiber 节点
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-09.jpg)

由于 div 没有子节点，因此在为 div 调用`performUnitOfWork`开始工作时，没有子元素协调，至此，workInProgress 树的构建完毕，render 阶段结束

#### render 阶段结束，commit 阶段开始前

render 阶段结束，workInProgress 树构建完成，此时我们得到一棵 finishedWork 树，将其保存到容器中

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-10.jpg)

主要逻辑在这里：

```js
function performSyncWorkOnRoot(root) {
  //...
  renderRootSync(root, lanes); // render阶段，构建workInProgress树
  // ...render阶段结束
  var finishedWork = root.current.alternate;
  root.finishedWork = finishedWork; // 将workInProgress树赋值给finishedWork属性
  commitRoot(root); // commit阶段，将finishedWork树更新到浏览器页面
  // ...
}
```

#### commit 阶段结束

`commitMutationEffects`函数执行完成后，finisheWork 树已经更新到浏览器屏幕上，finishedWork 树就变成了 current 树，因此将 finishedWork 树赋值给 root.current，同时重置 root.finishedWork 为 null

```js
function commitRootImpl(root, renderPriorityLevel) {
  // 暂存finishedWork树
  var finishedWork = root.finishedWork;
  // 注意，在commitRootImpl函数执行的开始，finishedWork属性已经被置空
  root.finishedWork = null;

  root.callbackNode = null;

  if (firstEffect !== null) {
    nextEffect = firstEffect;

    commitBeforeMutationEffects();

    nextEffect = firstEffect;
    commitMutationEffects(root, renderPriorityLevel);
    // commitMutationEffects执行完成后，将finishedWork树赋值给current tree。
    root.current = finishedWork;
    commitLayoutEffects(root, lanes);
  }

  return null;
}
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-11.jpg)

### 第二次渲染

在第一次渲染完成后，我们已经有一棵 current 树。现在让我们点击按钮，触发页面更新。由于是第二次渲染，不需要在创建 Fiber 树的容器。render 阶段直接从 `renderRootSync`函数开始

#### prepareFreshStack：为 current HostRootFiber 创建对应的 workInProgress 节点

`prepareFreshStack` 调用 `createWorkInProgress` 为 `HostRootFiber` 创建 workInProgress 节点。`createWorkInProgress`中发现当前的 HostRootFiber 存在备用的节点，即`current.alternate`存在，则直接复用备用节点

```js
var workInProgress = current.alternate;
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-12.jpg)

#### performUnitOfWork(New HostRootFiber)：为 current Home 节点创建 workInProgress 节点

首先进入工作循环的是新创建的 workInProgress HostRootFiber。在 performUnitOfWork 执行期间，React 为 HostRootFiber 的子元素 Home 创建对应的 workInProgress 节点，这一步工作在 `bailoutOnAlreadyFinishedWork` 函数中的 `cloneChildFibers` 完成。`cloneChildFibers` 调用 `createWorkInProgress`
方法为 Home 创建对应的 workInProgress 节点。由于 current Home fiber 没有备用节点，即 current home fiber 的 alternate 不存在，因此 `createWorkInProgress`为 Home 创建全新的 workInProgress 节点。创建完成后，HostRootFiber 的 child 指针指向新的 Home fiber。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-13.jpg)

#### performUnitOfWork(New HomeFiber)：为 current div 节点创建对应的 workInProgress 节点

下一步就是为新创建的 HomeFiber 执行工作。在为 HomeFiber 协调子元素的过程中，发现 新的 element(即 div)的 tag 及 type 和 current div 节点的相同，因此可以调用`useFiber`复用当前的 fiber 节点

```js
function useFiber(fiber, pendingProps) {
  // We currently set sibling to null and index to 0 here because it is easy
  // to forget to do before returning it. E.g. for the single child case.
  var clone = createWorkInProgress(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}
```

调用 `createWorkInProgress` 为新的子元素 div 创建新的 workInProgress 节点。由于 current div fiber 的 alternate 属性为 null，没有备用的节点，因此创建一个全新的 fiber 节点，并互相关联 `alternate`

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-14.jpg)

由于新的 div 没有子节点，因此 render 阶段结束

#### render 阶段结束，commit 阶段开始前

render 阶段结束，workInProgress 树构建完成，此时我们得到一棵 finishedWork 树。在 `performSyncWorkOnRoot` 函数中，我们将 finishedWork 树保存到容器的 finishedWork 属性上。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-15.jpg)

#### commit 阶段结束

`commitMutationEffects`函数执行完成后，finisheWork 树已经更新到浏览器屏幕上，finishedWork 树就变成了 current 树，因此将 finishedWork 树赋值给 root.current，同时重置 root.finishedWork 为 null

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-16.jpg)

**第二次渲染完成后，第二次渲染 render 阶段构建的 finishedWork 树就变成了 current 树，第一次渲染的树就变成了备用树，因此上图我将第一次渲染的树全部用虚线表示。此时内存中同时存在两棵树，一棵 current 树，一棵旧的备用树**

### 第三次渲染

在第二次渲染完成后，内存中同时存在一棵 current 树和一棵旧的 alternate 备用树。现在让我们点击按钮，触发页面更新，看看第三次渲染，React 是如何复用旧的 alternate 备用树上的节点。同样的，由于是第三次渲染，不需要在创建 Fiber 树的容器。render 阶段直接从 `renderRootSync`函数开始

**注意，右图中，虚线表示还没复用的旧的 fiber 节点。实现表示当前复用的节点**

#### prepareFreshStack：为 current HostRootFiber 创建对应的 workInProgress 节点

`prepareFreshStack` 调用 `createWorkInProgress` 为 `HostRootFiber` 创建 workInProgress 节点。`createWorkInProgress`中发现当前的 HostRootFiber 存在备用的节点，即`current.alternate`存在，则直接复用备用节点

```js
var workInProgress = current.alternate;
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-17.jpg)

#### performUnitOfWork(New HostRootFiber)：为 current Home 节点创建 workInProgress 节点

和第二次渲染一样，React 也是在 `cloneChildFibers` 中调用 `createWorkInProgress` 为当前的 Home fiber 创建新的 workInProgress 节点。
由于 current Home fiber 的 alternate 属性不为空，存在旧的备用节点，因此 `createWorkInProgress` 直接复用旧的备用节点，并将当前 current home fiber 的属性全部复制到旧的备用节点。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-18.jpg)

#### performUnitOfWork(New HomeFiber)：为 current div 节点创建对应的 workInProgress 节点

和第二次渲染一样，在协调 Home Fiber 子元素时，React 发现可以复用 current div 节点，因此调用 `useFiber` 复用 current div 节点。
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-19.jpg)

#### render 阶段结束，commit 阶段开始前

render 阶段结束，workInProgress 树构建完成，此时我们得到一棵 finishedWork 树。在 `performSyncWorkOnRoot` 函数中，我们将 finishedWork 树保存到容器的 finishedWork 属性上。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-20.jpg)

#### commit 阶段结束

`commitMutationEffects`函数执行完成后，finisheWork 树已经更新到浏览器屏幕上，finishedWork 树就变成了 current 树，因此将 finishedWork 树赋值给 root.current，同时重置 root.finishedWork 为 null

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-21.jpg)

### 小结

从前面三次渲染更新过程可以看出，内存中最多存在两棵树，一棵 current 树，一棵备用的 alternate 树，备用的树在 render 阶段用于构造 workInProgress 树。一个元素最多存在两个版本的 fiber 节点，一个 current 版本，和当前浏览器页面对应，一个 alternate 版本，alternate 版本是备用节点，用于在 render 阶段复用，以构建 workInProgress 节点。

**那为什么 React 要复用备用的节点，而不是新创建一个呢？最大的原因是节省内存开销，通过复用旧的备用节点，React 不需要额外申请内存空间，在复用时可以直接将 current fiber 的属性复制到旧的备用节点**

通过上面三次渲染更新过程也可以看出，React 在渲染时，会在 current 树和 alternate 树之间交替进行，倒来倒去。比如第四次渲染时，第二次渲染完成的 alternate 树又变成了 current 树，而第三次渲染完成的树又变成了 alternate 树。

看完了渲染更新流程，下面我们看下删除节点的情况又是怎样的。

### 第四次渲染：节点删除的场景

继续点击按钮，触发第四次渲染。根据我们的 demo，此时 div 节点将会被删除，新的 p 节点将被插入。我们看下这个过程，React 是如何删除节点、创建新的 p 节点以及复用旧的 home 节点的。

```jsx
  render() {
    const { step } = this.state;
    return step < 3 ? (
      <div id={step} onClick={this.handleClick}>
        {step}
      </div>
    ) : (
      <p id={step} onClick={this.handleClick}>
        {step}
      </p>
    );
  }
```

同样的，由于是第四次渲染，不需要再创建 Fiber 树的容器。render 阶段直接从 `renderRootSync`函数开始

#### prepareFreshStack：为 current HostRootFiber 创建对应的 workInProgress 节点

`prepareFreshStack` 调用 `createWorkInProgress` 为 `HostRootFiber` 创建 workInProgress 节点。`createWorkInProgress`中发现当前的 HostRootFiber 存在备用的节点，即`current.alternate`存在，则直接复用备用节点

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-22.jpg)

#### performUnitOfWork(New HostRootFiber)：为 current Home 节点创建 workInProgress 节点

和第三次渲染一样，React 也是在 `cloneChildFibers` 中调用 `createWorkInProgress` 为当前的 Home fiber 创建新的 workInProgress 节点。
由于 current Home fiber 的 alternate 属性不为空，存在旧的备用节点，因此 `createWorkInProgress` 直接复用旧的备用节点，并将当前 current home fiber 的属性全部复制到旧的备用节点。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-23.jpg)

#### performUnitOfWork(New HomeFiber)：删除 div 节点，新建 p 节点

轮到为新的 home fiber 协调子元素。这次，我们需要删除 div fiber 节点，新建一个 p 节点

- 调用 deleteRemainingChildren 删除当前的 div fiber 节点，将 div 添加到父节点，即 home fiber 的副作用链表中
- 调用 createFiberFromElement 为 p 元素创建对应的 fiber 节点。
- 将新的 home fiber 的 child 指针指向 p 节点。

到这里，home fiber 的工作就已经完成，此时 div 处于被即将被删除的状态，这里使用虚线表示
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-24.jpg)

#### render 阶段结束，commit 阶段开始前

render 阶段结束，workInProgress 树构建完成，此时我们得到一棵 finishedWork 树，以及一个副作用链表。在 `performSyncWorkOnRoot` 函数中，我们将 finishedWork 树保存到容器的 finishedWork 属性上。

实际上，React 在每次 render 阶段都会收集副作用节点，并构建副作用链表，我在前三次渲染中省略了这个步骤。第四次渲染介绍一下副作用链表的构建，因为这涉及到后面 commit 阶段遍历副作用链表，删除节点，插入节点的情况，可以查看[React 构建副作用链表算法](https://github.com/lizuncong/mini-react/blob/master/docs/reconciler/%E6%9E%84%E5%BB%BA%E5%89%AF%E4%BD%9C%E7%94%A8%E9%93%BE%E8%A1%A8%E7%AE%97%E6%B3%95.md)了解 React 如何构建副作用链表

render 阶段结束后，我们最终得到的 finishedWork 树和辅作用链表(图中红线所示)如下图：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-25.jpg)

#### commit 阶段

commit 阶段遍历副作用节点，根据对应的副作用标志`fiber.flags`执行对应的操作。在我们的案例中，相应的副作用就是删除 div 节点，插入 p 节点。这两个过程都发生在`commitMutationEffects`阶段，这个阶段操作真实的 dom 节点，并释放掉 fiber 的内存。

`commitMutationEffects`遍历副作用链表，第一个节点是 div 节点，这个节点需要删除，调用 `commitDeletion` 删除节点

`commitDeletion`主要工作如下：

- 调用 `unmountHostComponents` 删除真实的 dom 节点

- 其次调用`detachFiberMutation`重置 div 节点(AAA_DEBUG_RENDER_COUNT 属性为 3)的各种属性，以释放内存。重点关注 div fiber 的 return、child、alternate 指针的重置，同时需要注意，sibling 属性和 stateNode 属性不是在这个时候释放掉的。
- 然后调用 `detachFiberMutation`重置 div 节点(AAA_DEBUG_RENDER_COUNT 属性为 3)的备用节点，即 AAA_DEBUG_RENDER_COUNT 属性为 2 的 div 节点的属性，以释放内存。此时内存中已经没有节点引用这个备用节点，但是这个备用节点还是会引用 stateNode，

`detachFiberMutation` 函数如下：

```js
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

至此，对于 div 节点的删除工作已经完成，下一个需要执行的副作用节点是 p 节点，调用`commitPlacement`插入真实的 p dom 节点。

`commitMutationEffects` 函数执行完成后，此时的双缓冲树如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-26.jpg)

`commitMutationEffects` 函数执行完成，finishedWork 树已经变成了 current 树

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-27.jpg)

`commitLayoutEffects` 执行完成后，此时副作用链表已经没有用处，需要释放掉副作用链表的内存，这段逻辑在 `commitRootImpl` 函数中

```js
function commitRootImpl(root, renderPriorityLevel) {
  var finishedWork = root.finishedWork;
  root.finishedWork = null;
  //....
  commitBeforeMutationEffects();
  //....
  commitMutationEffects(root, renderPriorityLevel);
  //....
  commitLayoutEffects(root, lanes);
  //....
  // We are done with the effect chain at this point so let's clear the
  // nextEffect pointers to assist with GC. If we have passive effects, we'll
  // clear this in flushPassiveEffects.
  nextEffect = firstEffect;
  while (nextEffect !== null) {
    var nextNextEffect = nextEffect.nextEffect;
    nextEffect.nextEffect = null;
    if (nextEffect.flags & Deletion) {
      detachFiberAfterEffects(nextEffect);
    }
    nextEffect = nextNextEffect;
  }
  //...
}
function detachFiberAfterEffects(fiber) {
  fiber.sibling = null;
  fiber.stateNode = null;
}
```

- 首先重置副作用节点的 nextEffect 为 null
- 其次判断如果节点是被删除的，则调用 detachFiberAfterEffects 函数重置 sibling 和 stateNode 为 null

整个 commit 阶段已经结束，此时内存中的双缓冲树状态如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-28.jpg)

**根据图中可以看出，左边的 div fiber 节点(AAA_DEBUG_RENDER_COUNT 属性为 2)已经没有任何节点引用它了，可以被 GC 回收内存。但是我们看右边的 div fiber 节点(AAA_DEBUG_RENDER_COUNT 属性为 3)的节点还有 child 以及 firstEffect 指针引用着，因此这个节点不会在本次 GC 期间被回收，而是等下一次渲染更新完成后才会被 GC 回收**

### 子树删除的场景

这次我们使用下面的 demo，看看删除子树的时候，React 是怎么释放内存的

```jsx
import React from "react";
import ReactDOM from "react-dom";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 0 };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({
      step: this.state.step + 1,
    });
  }
  render() {
    const { step } = this.state;
    return step < 3 ? (
      <div id={step} onClick={this.handleClick}>
        <div id="test">{step}</div>
      </div>
    ) : (
      <p id={step} onClick={this.handleClick}>
        {step}
      </p>
    );
  }
}

ReactDOM.render(<Home />, document.getElementById("root"));
```

这里我们直接从第四次点击按钮出发页面更新开始，当 render 阶段结束，commit 阶段开始前，我们将得到下面一棵 finishedWork 树以及副作用链表。这里我使用蓝色标记需要释放内存的 fiber 节点

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-29.jpg)

`commitMutationEffects`阶段调用 `commitDeletetion` 方法删除 div fiber 节点，并重置 div fiber 的属性为 null

下面就是整个 commit 阶段完成后，内存中双缓冲树的状态
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-30.jpg)
这里我将需要删除的节点标记为蓝色并添加 `A`、`B`、`C`、`D`，方便后续的描述

#### 内存泄漏风险分析

从图中可以看出，A，B，C，D 都是需要被删除的节点。

先来看 B，B 节点所有的属性已经被重置为 null，但是此时还有 home 的 child 以及 firstEffect 等属性引用着 B 节点。在本次更新完成，可想而知 B 节点的内存不会被释放。等到下一次更新完成时，由于 child 及 firstEffect 不再指向 B 节点，B 节点内存得到释放

再来看 A 节点， A 节点(stateNode 属性)还引用着已经被删除的 div 真实 dom，这个 div 真实 dom 的`__reactFiber` 属性还引用着 A 节点。因此这里有一对循环引用，即

```js
fiberA.stateNode = div。
div.__reactFiber = fiberA
```

再来看 C 和 D，C 和 D 的 stateNode 都没有被清空，同时 div#test 这个真实的 dom 节点的`__reactFiber`属性还引用着 C，C 和 D 通过 alternate 属性相互引用，这里的引用情况如下：

```js
fiberC.stateNode = div#test
fiberC.return = fiberB
div#test.__reactFiber = fiberC

fiberD.stateNode = div#test
fiberD.return = fiberA

fiberD.alternate = fiberC.alternate
```

**综上可以看出，如果在采用引用计数的浏览器中，由于这些节点之间存在循环引用的情况，在垃圾回收期间不会被回收，因此有内存泄漏的风险。而在采用标记清除法的浏览器中，这些节点内存会被回收。这也是为什么在谷歌浏览器中并没有内存泄漏的风险**

第四次渲染后内存中的 FiberNode 节点
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-31.jpg)

第五次渲染后内存中的 FiberNode 节点
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-32.jpg)

第六次渲染后，被删除的节点的内存已经被全部回收，因此从第六次开始，FiberNode 节点的数量都保持在 6 个

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-33.jpg)

**综上也可以看出，被删除的节点至少要在后续两轮渲染更新完成后才能全部回收完毕**
