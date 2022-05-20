> 好的文章就像 90 年代的港片让人回味无穷。这篇文章虽然写于 18 年，现在看来对理解 React Fiber 的工作流程依然有很大的帮助。有些 API 在最新版本的 React 中已经被废弃，但丝毫不影响整体流程的理解

### 深入理解 React 中 state 和 props 的更新

> 本文使用具有父组件和子组件的简单案例来演示 Fiber 架构中 React 将 props 传播到子组件的内部流程。

在我之前的文章 [Fiber 内部：React 中新的协调算法的深入概述](https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/in-depth_overview_of_the_new_reconciliation_algorithm.md)中，我奠定了理解本文介绍的更新过程的技术细节所需要的基础知识。

我已经概述了我将在本文中使用的主要数据结构和概念，特别是 Fiber 节点、current tree 和 workInProgress tree、副作用和副作用列表。我还高度概述了主要的算法，并解释了 render 和 commit 阶段之间的区别。如果你还没有读过，我建议你从上一篇文章开始。

我还介绍了示例应用程序，该应用程序带有一个按钮，点击按钮简单地递增屏幕上呈现的数字：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/reconciler-04.gif)

这是一个简单的组件，render 方法返回 button 和 span 两个子元素。单击按钮时，组件的状态就会更新。这会导致 span 元素的文本更新：

```jsx
class ClickCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState((state) => {
      return { count: state.count + 1 };
    });
  }

  componentDidUpdate() {}

  render() {
    return [
      <button key="1" onClick={this.handleClick}>
        Update counter
      </button>,
      <span key="2">{this.state.count}</span>,
    ];
  }
}
```

在这里，我给组件添加了 componentDidUpdate 生命周期方法。这是为了演示 React 在 commit 阶段是怎样添加副作用并调用 componentDidUpdate 方法。

**在本文中，我将介绍 React 如何处理状态更新并构建副作用列表**。我们将了解 render 和 commit 阶段的主要函数都做了什么事情。

特别是，我们将在 [completeWork](https://github.com/facebook/react/blob/cbbc2b6c4d0d8519145560bd8183ecde55168b12/packages/react-reconciler/src/ReactFiberCompleteWork.js#L532)函数中看到，React 进行：

- 更新 ClickCounter 组件中的 state.count 属性
- 调用 render 方法获取子元素列表并进行比较
- 更新 span 元素的 props 属性

同时，在 [commitRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L523) 函数中，React 会：

- 更新 span 元素的 textContent 属性
- 调用 componentDidUpdate 生命周期方法

但在此之前，让我们快速看一下在 click 事件中调用 setState 时，React 是如何调度的。

请注意，你无需了解任何内容即可使用 React。这篇文章是关于 React 工作原理的。

### 调度更新(Scheduling updates)

当我们点击按钮时，click 事件被触发，React 执行我们在按钮中绑定的回调。在我们的应用程序中，它只是增加计数器并更新状态：

```jsx
class ClickCounter extends React.Component {
    ...
    handleClick() {
        this.setState((state) => {
            return {count: state.count + 1};
        });
    }
}
```

每个 React 组件都有一个关联的 updater，它充当组件和 React 内核之间的桥梁。这允许 ReactDOM、React Native、服务器端渲染和测试实用程序以不同方式实现 setState。

在本文中，我们将探讨 ReactDOM 中 updater 对象的实现，它使用 Fiber reconciler。对于 ClickCounter 组件，它是一个 [classComponentUpdater](https://github.com/facebook/react/blob/6938dcaacbffb901df27782b7821836961a5b68d/packages/react-reconciler/src/ReactFiberClassComponent.js#L186)。 它负责检索 Fiber 实例、将更新添加到队列中以及调度。

当添加更新时，它们只是简单的添加到更新队列中以便在 Fiber 节点上处理。在我们的例子中，ClickCounter 组件对应的 [Fiber 节点](https://medium.com/react-in-depth/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react-e1c04700ef6e) 的结构如下：

```jsx
{
    stateNode: new ClickCounter,
    type: ClickCounter,
    updateQueue: {
         baseState: {count: 0}
         firstUpdate: {
             next: {
                 payload: (state) => { return {count: state.count + 1} }
             }
         },
         ...
     },
     ...
}

```

可以看到，updateQueue.firstUpdate.next.payload 里面的函数就是我们在 ClickCounter 组件中传递给 setState 的回调。它代表了 render 阶段中需要处理的第一个更新

### 处理 ClickCounter Fiber 节点的更新(Processing updates for the ClickCounter Fiber node)

[我之前的文章中关于工作循环的章节](https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/in-depth_overview_of_the_new_reconciliation_algorithm.md)解释了全局变量 nextUnitOfWork 的作用。特别是，它说明了这个变量保存的是 workInProgress 树中需要处理的 fiber 节点的引用。当 React 遍历 Fibers 树时，它使用这个变量来了解是否有尚未完成工作的 fiber 节点。

假设我们已经调用了 setState 方法。React 将 setState 中的回调添加到 ClickCounter Fiber 节点的 updateQueue 中并开始调度。React 进入 render 阶段。它在 renderRoot 函数里面从最顶层的 HostRoot Fiber 节点开始遍历。但是，它会退出（跳过）已处理的 Fiber 节点，直到找到未完成工作的节点。此时只有一个 Fiber 节点需要处理。它是 ClickCounter Fiber 节点。

所有工作都在这个 Fiber 节点的克隆副本上执行，(副本)存储在 Fiber 节点的 alternate 字段中。如果尚未创建 alternate 节点，那么在处理更新前，React 会在函数 [createWorkInProgress](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L326) 中创建副本。让我们假设变量 nextUnitOfWork 指向 ClickCounter Fiber 节点的 alternate 节点。

### 开始工作(beginWork)

我们的 Fiber 节点首先经过 [beginWork](https://github.com/facebook/react/blob/cbbc2b6c4d0d8519145560bd8183ecde55168b12/packages/react-reconciler/src/ReactFiberBeginWork.js#L1489) 函数处理。

> 因为 Fiber 树中每个 Fiber 节点都会经过 beginWork 函数处理，所以如果你想调试 render 阶段，这是一个打断点的好地方。我经常这样做并根据 Fiber 节点的 type 添加条件断点

beginWork 函数就是一个大 switch 语句，它通过 tag 确定一个 Fiber 节点需要完成的工作类型，然后执行相应的函数来执行工作。在本例中， CountClicks 是一个类组件，因此采用此分支：

```jsx
function beginWork(current$$1, workInProgress, ...) {
    ...
    switch (workInProgress.tag) {
        ...
        case FunctionalComponent: {...}
        case ClassComponent:
        {
            ...
            return updateClassComponent(current$$1, workInProgress, ...);
        }
        case HostComponent: {...}
        case ...
}
```

我们进入 [updateClassComponent](https://github.com/facebook/react/blob/1034e26fe5e42ba07492a736da7bdf5bf2108bc6/packages/react-reconciler/src/ReactFiberBeginWork.js#L428) 函数。根据组件是第一次渲染还是更新，React 会创建一个实例或者挂载组件并更新

```jsx
function updateClassComponent(current, workInProgress, Component, ...) {
    ...
    const instance = workInProgress.stateNode;
    let shouldUpdate;
    if (instance === null) {
        ...
        // In the initial pass we might need to construct the instance.
        constructClassInstance(workInProgress, Component, ...);
        mountClassInstance(workInProgress, Component, ...);
        shouldUpdate = true;
    } else if (current === null) {
        // In a resume, we'll already have an instance we can reuse.
        shouldUpdate = resumeMountClassInstance(workInProgress, Component, ...);
    } else {
        shouldUpdate = updateClassInstance(current, workInProgress, ...);
    }
    return finishClassComponent(current, workInProgress, Component, shouldUpdate, ...);
}
```

### 处理 ClickCounter Fiber 的更新(Processing updates for the ClickCounter Fiber)

我们已经有了 ClickCounter 组件的实例，所以我们进入 [updateClassInstance](https://github.com/facebook/react/blob/6938dcaacbffb901df27782b7821836961a5b68d/packages/react-reconciler/src/ReactFiberClassComponent.js#L976)。 **这是 React 为类组件执行大部分工作的地方**。以下是函数中按执行顺序执行的最重要的操作：

- 调用 UNSAFE_componentWillReceiveProps()钩子(已弃用)
- 处理 updateQueue 中的更新并生成新状态
- 使用新状态调用 getDerivedStateFromProps 并得到结果
- 调用 shouldComponentUpdate 判断组件是否需要更新：
  - 如果是 false，跳过整个渲染过程，不再继续调用这个组件及其子组件的 render 方法
- 调用 UNSAFE_componentWillUpdate（已弃用）
- 添加一个 effect 以便后续触发 componentDidUpdate 生命周期钩子
  > 虽然在 render 阶段添加了触发 componentDidUpdate 调用的 effect，但 componentDidUpdate 方法在接下来的 commit 阶段才会被执行
- 更新组件实例上的 state 和 props

组件实例上的 state 和 props 必须在调用 render 方法前更新。因为 render 方法的输出依赖于 state 和 props。如果我们不这样做，它将每次返回相同的结果。

这是该函数的简化版本：

```jsx
function updateClassInstance(current, workInProgress, ctor, newProps, ...) {
    const instance = workInProgress.stateNode;

    const oldProps = workInProgress.memoizedProps;
    instance.props = oldProps;
    if (oldProps !== newProps) {
        callComponentWillReceiveProps(workInProgress, instance, newProps, ...);
    }

    let updateQueue = workInProgress.updateQueue;
    if (updateQueue !== null) {
        processUpdateQueue(workInProgress, updateQueue, ...);
        newState = workInProgress.memoizedState;
    }

    applyDerivedStateFromProps(workInProgress, ...);
    newState = workInProgress.memoizedState;

    const shouldUpdate = checkShouldComponentUpdate(workInProgress, ctor, ...);
    if (shouldUpdate) {
        instance.componentWillUpdate(newProps, newState, nextContext);
        workInProgress.effectTag |= Update;
        workInProgress.effectTag |= Snapshot;
    }

    instance.props = newProps;
    instance.state = newState;

    return shouldUpdate;
}
```

我在上面的代码片段中删除了一些辅助代码。例如，在调用生命周期方法或者添加触发生命周期方法执行的 effect 之前，React 会使用 typeof 操作符检查组件是否实现了对应的生命周期方法。例如，在添加 effect 之前，React 会检查组件实例是否存在 componentDidUpdate 方法。

```jsx
if (typeof instance.componentDidUpdate === "function") {
  workInProgress.effectTag |= Update;
}
```

好的，现在我们知道在 render 阶段 ClickCounter Fiber 节点都执行了哪些操作。现在让我们看看这些操作如何改变 Fiber 节点上的值。当 React 开始工作时，ClickCounter 组件的 Fiber 节点看起来像这样：

```jsx
{
    effectTag: 0,
    elementType: class ClickCounter,
    firstEffect: null,
    memoizedState: {count: 0},
    type: class ClickCounter,
    stateNode: {
        state: {count: 0}
    },
    updateQueue: {
        baseState: {count: 0},
        firstUpdate: {
            next: {
                payload: (state, props) => {…}
            }
        },
        ...
    }
}
```

工作完成后，我们最终得到一个如下所示的 Fiber 节点：

```jsx
{
    effectTag: 4,
    elementType: class ClickCounter,
    firstEffect: null,
    memoizedState: {count: 1},
    type: class ClickCounter,
    stateNode: {
        state: {count: 1}
    },
    updateQueue: {
        baseState: {count: 1},
        firstUpdate: null,
        ...
    }
}
```

**花点时间观察属性值的差异。**

更新完成后，fiber.memoizedState 以及 fiber.updateQueue.baseState 中的 count 属性都变成了 1。React 还更新了 ClickCounter 组件实例中的 state。

此时，队列中不再有更新，因此 firstUpdate 被设置成 null。重要的是，我们的 effectTag 属性发生了变化。它不再是 0，它变成了 4。在二进制中就是 100，这意味着第三位设置成了 1，这正是 Update [副作用标签](https://github.com/facebook/react/blob/b87aabdfe1b7461e7331abb3601d9e6bb27544bc/packages/shared/ReactSideEffectTags.js)的位：

```jsx
export const Update = 0b00000000100;
```

总而言之，当在 ClickCounter Fiber (父)节点上工作时，React 会调用 pre-mutation 生命周期方法，更新状态并定义相关的副作用。

### 协调 ClickCounter Fiber 的子元素(Reconciling children for the ClickCounter Fiber)

一旦完成，React 就会进入 [finishClassComponent](https://github.com/facebook/react/blob/340bfd9393e8173adca5380e6587e1ea1a23cefa/packages/react-reconciler/src/ReactFiberBeginWork.js#L355)函数。**这是 React 调用组件实例上的 render 方法**并将 dom diff 算法应用于组件返回的子元素的地方。[文档中](https://reactjs.org/docs/reconciliation.html#the-diffing-algorithm)有高度概括。这是相关部分：

> 当比较两个相同类型的 React DOM 元素时，React 会查看两者的属性，复用相同的底层 DOM 节点，并且只更新变化的属性。

然而，如果我们深入挖掘，我们可以了解到它实际上是将 Fiber 节点与 React element 进行了比较。但我现在不会详细介绍，因为这个过程非常复杂。我将写一篇单独的文章，重点介绍子元素协调的过程。

> 如果你急于了解详细信息，请查看 [reconcileChildrenArray](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactChildFiber.js#L732) 函数，因为在我们的应用程序中，render 方法返回的是一个 React element 数组。

在这一点上，有两件重要的事需要理解。首先，当 React 处理子元素协调过程时，它会为 render 方法返回的子 React 元素创建或更新 Fiber 节点。finishClassComponent 函数返回当前 Fiber 节点的第一个子节点的引用。它将分配给 nextUnitOfWork 并在稍后的工作循环中处理。**其次，React 将更新子元素的 props 作为父组件工作的一部分(即子元素的 props 更新是在父组件中完成的)**。为此，它使用 render 方法返回的 React 元素中的数据。

例如，在 React 开始协调 ClickCounter Fiber 的子元素前，span 元素对应的 Fiber 节点如下所示：

```jsx
{
    stateNode: new HTMLSpanElement,
    type: "span",
    key: "2",
    memoizedProps: {children: 0},
    pendingProps: {children: 0},
    ...
}
```

正如你所看到的，memoizedProps 以及 pendingProps 中的 children 属性都是 0。下面是 render 方法返回的 span 元素的结构：

```jsx
{
  $$typeof: Symbol(react.element);
  key: "2";
  props: {
    children: 1;
  }
  ref: null;
  type: "span";
}
```

如你所见，Fiber 节点和返回的 React element 之间的 props 存在差异。 [createWorkInProgress](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L326)函数用于创建 alternate Fiber 节点，在函数内部 React 会将更新后的属性从 React 元素复制到 Fiber 节点。

因此，在 React 完成 ClickCounter 组件的子元素协调之后，span 的 Fiber 节点的 pendingProps 属性更新完成。它们与 span element 的值匹配。

```jsx
{
    stateNode: new HTMLSpanElement,
    type: "span",
    key: "2",
    memoizedProps: {children: 0},
    pendingProps: {children: 1},
    ...
}
```

稍后，当 React 为 span Fiber 节点执行工作时，它会将 pendingProps 复制到 memoizedProps 并添加 effects 以更新 DOM。

好吧，这就是 React 在 render 阶段为 ClickCounter Fiber 节点执行的所有工作。由于按钮是 ClickCounter 组件的第一个子节点，它将被分配给 nextUnitOfWork 变量。(按钮节点)没有什么可做的，所以 React 将移动到它的兄弟节点，即 span Fiber 节点。根据[这里描述](https://medium.com/react-in-depth/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react-e1c04700ef6e)的算法，它发生在 completeUnitOfWork 函数中

### 处理 Span fiber 的更新(Processing updates for the Span fiber)

变量 nextUnitOfWork 现在指向 span fiber 的备用(alternate)节点，React 开始处理它。与为 ClickCounter 执行的步骤类似，我们从 [beginWork](https://github.com/facebook/react/blob/cbbc2b6c4d0d8519145560bd8183ecde55168b12/packages/react-reconciler/src/ReactFiberBeginWork.js#L1489) 函数开始。

由于我们的 span 节点是 HostComponent 类型的，所以这次在 switch 语句中 React 采用了这个分支：

```jsx
function beginWork(current$$1, workInProgress, ...) {
    ...
    switch (workInProgress.tag) {
        case FunctionalComponent: {...}
        case ClassComponent: {...}
        case HostComponent:
          return updateHostComponent(current, workInProgress, ...);
        case ...
}
```

并在 [updateHostComponent](https://github.com/facebook/react/blob/cbbc2b6c4d0d8519145560bd8183ecde55168b12/packages/react-reconciler/src/ReactFiberBeginWork.js#L686) 函数中结束。同时，你还可以看到为 ClassComponent 调用的 updateClassComponent 函数。对于 FunctionalComponent，它将是 updateFunctionComponent 等等。你可以在[ReactFiberBeginWork.js](https://github.com/facebook/react/blob/1034e26fe5e42ba07492a736da7bdf5bf2108bc6/packages/react-reconciler/src/ReactFiberBeginWork.js) 文件中找到所有这些函数

### 协调 span fiber 的子元素(Reconciling children for the span fiber)

在我们的例子中，updateHostComponent 函数并没有对 span 节点做任何重要的事情。因此可以简单略过

### 完成 Span Fiber 节点的工作(Completing work for the Span Fiber node)

beginWork 完成后，节点进入 completeWork 函数。但在此之前，React 需要更新 span fiber 上的 memoizedProps 属性。你可能还记得在为 ClickCounter 组件协调子元素时，React 更新了 span fiber 节点上的 pendingProps 属性

```jsx
{
    stateNode: new HTMLSpanElement,
    type: "span",
    key: "2",
    memoizedProps: {children: 0},
    pendingProps: {children: 1},
    ...
}
```

因此，一旦 span fiber 节点的 beginWork 完成了，React 就会更新 memoizedProps：

```jsx
function performUnitOfWork(workInProgress) {
    ...
    next = beginWork(current$$1, workInProgress, nextRenderExpirationTime);
    workInProgress.memoizedProps = workInProgress.pendingProps;
    ...
}
```

然后它调用 completeWork 函数，和 beginWork 函数一样，completeWork 函数也只是一个大的 switch 语句：

```jsx
function completeWork(current, workInProgress, ...) {
    ...
    switch (workInProgress.tag) {
        case FunctionComponent: {...}
        case ClassComponent: {...}
        case HostComponent: {
            ...
            updateHostComponent(current, workInProgress, ...);
        }
        case ...
    }
}
```

由于我们的 span Fiber 节点是 HostComponent，它调用[updateHostComponent](https://github.com/facebook/react/blob/cbbc2b6c4d0d8519145560bd8183ecde55168b12/packages/react-reconciler/src/ReactFiberBeginWork.js#L686) 函数。在这个函数中，React 基本上做了以下事情：

- 准备 DOM 更新
- 将它们添加到 span fiber 的 updateQueue 中。
- 添加更新 DOM 的 effect

在执行这些操作之前，span fiber 节点如下所示：

```jsx
{
    stateNode: new HTMLSpanElement,
    type: "span",
    effectTag: 0
    updateQueue: null
    ...
}
```

当工作完成后，它看起来像这样：

```jsx
{
    stateNode: new HTMLSpanElement,
    type: "span",
    effectTag: 4,
    updateQueue: ["children", "1"],
    ...
}
```

注意 effectTag 和 updateQueue 字段的差异。effectTag 从 0 变成 4。在二进制中这是 100，这意味着第三位设置成了 1，这正是 update 副作用对应的 tag 类型。这是 React 在接下来的 commit 阶段需要为这个节点做的唯一工作。updateQueue 字段保存了将用于更新的数据(payload)。

一旦 React 处理完成 ClickCounter 及其子元素，render 阶段就完成了。它现在可以将完成的 alternate 树分配给 FiberRoot 的 finishedWork 属性。这是需要刷新到屏幕上的新树。它可以在 render 阶段之后立即处理，也可以在浏览器空闲时间处理。

### 副作用列表(Effects list)

在我们的例子中，由于 span 节点和 ClickCounter 组件都有副作用，React 会将 span fiber 节点的链接添加到 HostFiber 的 firstEffect 属性.

React 在 [completeUnitOfWork](https://github.com/facebook/react/blob/d5e1bf07d086e4fc1998653331adecddcd0f5274/packages/react-reconciler/src/ReactFiberScheduler.js#L999) 函数中构建副作用列表。这是具有更新 span 节点文本和调用 ClickCounter 钩子
副作用的 Fiber 树的样子：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/update-01.png)

这是具有副作用的节点的线性列表：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/update-02.png)

### 提交阶段(Commit phase)

这个阶段从[completeRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L2306) 函数开始。在它开始做任何工作之前，它将 FiberRoot 的 finishedWork 属性重置为 null：

```jsx
root.finishedWork = null;
```

与 render 阶段不同，commit 阶段始终是同步的，因此它可以安全地更新 HostRoot 以指示 commit 工作已经开始。

在 commit 阶段， React 更新 DOM 并调用 post mutation 生命周期方法，如 componentDidUpdate。为此，它会遍历在 render 阶段构建的副作用列表并应用它们。

我们在 render 阶段中为我们的 span 和 ClickCounter 节点定义了以下 effects：

```jsx
{ type: ClickCounter, effectTag: 5 }
{ type: 'span', effectTag: 4 }
```

ClickCounter 的 effect tag 是 5 或 二进制的 101，这意味着需要调用 componentDidUpdate 方法。最低有效位也设置为表示该 Fiber 节点在 render 阶段的所有工作都已完成。

span 的 effect tag 是 4 或 二进制的 100，定义了需要更新 host component 的 dom 节点的更新工作。对于 span 元素，React 需要更新元素的 textContent 属性。

### 应用效果(Applying effects)

让我们看看 React 如何应用这些 effects。用于应用 effects 的[commitRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L523)函数由 3 个子函数组成：

```jsx
function commitRoot(root, finishedWork) {
  commitBeforeMutationLifecycles();
  commitAllHostEffects();
  root.current = finishedWork;
  commitAllLifeCycles();
}
```

这些子函数中的每一个都实现了一个循环，这些循环遍历副作用列表并检查 effect 的类型。当它找到与函数功能相关的 effect 时，它会应用它。在我们的例子中，它将调用 ClickCounter 组件的 componentDidUpdate 生命周期方法并更新 span 元素的文本。

第一个函数 [commitBeforeMutationLifeCycles](https://github.com/facebook/react/blob/fefa1269e2a67fa5ef0992d5cc1d6114b7948b7e/packages/react-reconciler/src/ReactFiberCommitWork.js#L183) 查找 [Snapshot](https://github.com/facebook/react/blob/b87aabdfe1b7461e7331abb3601d9e6bb27544bc/packages/shared/ReactSideEffectTags.js#L25) effect 并调用 getSnapshotBeforeUpdate 方法。但是，由于我们没有在 ClickCounter 组件上实现这个方法，所以 React 没有在 render 阶段添加对应的 Snapshot effect。所以在我们的例子中，这个函数什么都不做。

### DOM 更新(DOM updates)

下一步，React 执行[commitAllHostEffects](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L376) 函数。这里 React 将 span 元素的文本从 0 更改为 1。由于类组件对应的节点没有任何 DOM 更新，因此这里不需要处理 ClickCounter fiber。

这个函数的目的是选择正确的 effect 类型并执行相应的操作。在我们的例子中，我们需要更新 span 元素上的文本，所以我们在这里使用 Update 分支：

```jsx
function updateHostEffects() {
    switch (primaryEffectTag) {
      case Placement: {...}
      case PlacementAndUpdate: {...}
      case Update:
        {
          var current = nextEffect.alternate;
          commitWork(current, nextEffect);
          break;
        }
      case Deletion: {...}
    }
}
```

继续往下执行 commitWork 函数，我们最终进入[updateDOMProperties](https://github.com/facebook/react/blob/8a8d973d3cc5623676a84f87af66ef9259c3937c/packages/react-dom/src/client/ReactDOMComponent.js#L326) 函数。它使用 render 阶段添加的 updateQueue 数据更新 span 元素的 textContent 属性。

```jsx
function updateDOMProperties(domElement, updatePayload, ...) {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if (propKey === STYLE) { ...}
    else if (propKey === DANGEROUSLY_SET_INNER_HTML) {...}
    else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    } else {...}
  }
}
```

在应用 DOM 更新后，React 将 finishedWork 树分配给 HostRoot。它将 alternate 树设置为 current 树：

```jsx
root.current = finishedWork;
```

### 调用 post mutation 生命周期钩子(Calling post mutation lifecycle hooks)

最后剩下的函数是 [commitAllLifecycles](https://github.com/facebook/react/blob/d5e1bf07d086e4fc1998653331adecddcd0f5274/packages/react-reconciler/src/ReactFiberScheduler.js#L479)。这里 React 调用 post mutational 生命周期方法。在 render 阶段，React 将 Update effect 添加到 ClickCounter 组件中。这是 commitAllLifecycles 函数寻找并调用 componentDidUpdate 方法的效果之一：

```jsx
function commitAllLifeCycles(finishedRoot, ...) {
    while (nextEffect !== null) {
        const effectTag = nextEffect.effectTag;

        if (effectTag & (Update | Callback)) {
            const current = nextEffect.alternate;
            commitLifeCycles(finishedRoot, current, nextEffect, ...);
        }

        if (effectTag & Ref) {
            commitAttachRef(nextEffect);
        }

        nextEffect = nextEffect.nextEffect;
    }
}
```

该函数还会更新 [refs](https://reactjs.org/docs/refs-and-the-dom.html)，但由于我们没有任何此功能，因此不会使用。componentDidUpdate 方法在 [commitLifeCycles](https://github.com/facebook/react/blob/e58ecda9a2381735f2c326ee99a1ffa6486321ab/packages/react-reconciler/src/ReactFiberCommitWork.js#L351) 函数中被调用：

```jsx
function commitLifeCycles(finishedRoot, current, ...) {
  ...
  switch (finishedWork.tag) {
    case FunctionComponent: {...}
    case ClassComponent: {
      const instance = finishedWork.stateNode;
      if (finishedWork.effectTag & Update) {
        if (current === null) {
          instance.componentDidMount();
        } else {
          ...
          instance.componentDidUpdate(prevProps, prevState, ...);
        }
      }
    }
    case HostComponent: {...}
    case ...
}
```

你还可以看到，这是 React 为第一次渲染的组件调用 componentDidMount 方法的地方

### 原文链接

- [in-depth-explanation-of-state-and-props-update-in-react](https://indepth.dev/posts/1009/in-depth-explanation-of-state-and-props-update-in-react)
