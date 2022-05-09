## Fiber 内部：React 中新的协调算法的深入概述

> 深入了解 React 的 Fiber 新架构，并了解新协调算法的两个主要阶段。我们将详细了解 React 如何更新 state 和 props 以及处理子节点

React 是一个用于构建用户界面的 JavaScript 库。其核心机制在于跟踪组件状态变化并将更新的状态展示到屏幕。在 React 中，我们将此过程称为**_协调_**。我们调用 setState 方法，框架会检查状态(state)或属性(props)是否已更改，并重新渲染组件。

React 官方文档很好的概述了该机制：React 元素的角色、生命周期方法和 render 方法，以及应用于组件子节点的 dom diff 算法。**_render 方法返回的不可变的 React elements tree 通常被称为“虚拟 DOM”。_**该术语有助于在早期向人们解释 React，但它也引起了困惑，并且不再在 React 文档中使用。在本文中，我将统一称它为 React elements tree。

除了 React elements tree 之外，还有一个用于保存状态的内部实例(组件、DOM 节点等)树。从 16 版本开始，React 推出了该内部实例树的全新实现，对应的算法称为**_Fiber_**。要了解 Fiber 架构带来的优势，请查看 [The how and why on React’s usage of linked list in Fiber.](https://indepth.dev/posts/1007/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-to-walk-the-components-tree)。

这是本系列的第一篇文章，旨在介绍 React 的内部架构。在本文中，我想深入概述与算法相关的重要概念和数据结构。一旦我们有足够的背景知识，我们将探索用于遍历和处理**fiber tree**的算法和主要函数。本系列的下一篇文章将演示 React 如何使用该算法来执行初次渲染以及处理状态(state)和属性(props)更新。然后我们将继续详细介绍调度(scheduler)、子元素协调过程以及构建 effects list 的机制。

> 译者注：我们需要了解 React 第一次渲染是怎样的，当我们调用 setState 时，React 如何处理状态和属性的更新，然后怎么调度更新，当更新开始时，React 如何进行 DOM Diff 并构建副作用列表(effects list)

我并不是要在这里给你介绍一些非常高级的知识。我鼓励你阅读这篇文章以了解 Concurrent React 内部运作的底层原理。如果你打算开始为 React 源码做贡献，本系列文章也会是一个很好的指南。我是[Reverse Engineering](https://indepth.dev/posts/1005/level-up-your-reverse-engineering-skills)的坚定信徒，所以会有很多指向最近的 16.6.0 版本源码的链接。

> 译者注：Reverse Engineering 指不满足于使用某一工具，然后通过阅读源码去了解其内部原理，作者将此称为 reverse engineering(逆向工程)

这里肯定会有相当多的知识需要吸收，所以如果你没有马上理解一些东西，不要感到压力。一切都值得花时间。当然，你无需了解本篇文章的内容也是可以使用 React 的。这篇文章是介绍 React 内部工作原理的。

> 译者小结：本节主要对这篇文章的内容进行一个概述，本篇文章主要是介绍新的协调算法的两个主要阶段： render 和 commit。在这两个阶段中，生命周期方法是如何调用的。作者也简单介绍了下一篇文章将会介绍初次渲染以及更新，调度，协调过程，构建 effect list 的机制等

### 前置知识

这是一个简单的应用程序，我将在整个系列中使用它。我们有一个按钮，可以简单地增加屏幕上呈现的数字：

![image](https://images.indepth.dev/images/2019/07/tmp1.gif)

这是实现：

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

这是一个简单的组件，render 方法返回两个子元素：button 和 span 元素。当我们点击按钮时，组件的状态就会更新。这会导致 span 元素的文本更新。

React 在**协调**期间执行了各种活动。例如，在我们的简单应用程序中，**以下是 React 在第一次渲染期间和状态更新后执行的操作**：

- 更新 ClickCounter 组件状态中的 count 属性
- 检索并比较 ClickCounter 的子元素以及他们的属性(props)
- 更新 span 元素的属性

**在协调过程中还会执行其他活动，例如调用生命周期方法或更新 refs。所有这些活动在 Fiber 架构中统称为“工作”**。工作的类型通常取决于 React 元素的类型。例如，对于一个类组件，React 需要创建一个实例，而对于一个函数式组件它不会这样做。如你所知，React 中有多种元素，例如类组件和函数组件、宿主(host)组件（DOM 节点）、portals 组件等。React 元素的类型由 createElement 函数的第一个参数定义。这个函数一般用于在 render 方法中创建一个元素。

在我们开始探索这些活动以及主要的 Fiber 算法之前，让我们先熟悉一下 React 内部使用的数据结构。

> 译者小结：本节主要是需要理解什么是 “工作”，“工作” 的类型是什么。以及都有哪些“工作”

### 从 React Elements 到 Fiber 节点

React 中的每个组件都有一个从render方法返回的UI表示，我们可以称为视图或模板。这是我们 ClickCounter 组件的模板：

```jsx
<button key="1" onClick={this.onClick}>Update counter</button>
<span key="2">{this.state.count}</span>
```

#### React Elements
一旦经过 babel 编译，react 组件的render方法返回的就是一个 react elements tree，而不是html。由于我们不是必须使用 JSX，因此我们可以使用 `createElement` 重写我们的 ClickCounter 组件的 render 方法。
```jsx
class ClickCounter {
    ...
    render() {
        return [
            React.createElement(
                'button',
                {
                    key: '1',
                    onClick: this.onClick
                },
                'Update counter'
            ),
            React.createElement(
                'span',
                {
                    key: '2'
                },
                this.state.count
            )
        ]
    }
}
```
React.createElement方法 将创建两个数据结构，如下所示：

```jsx
[
    {
        $$typeof: Symbol(react.element),
        type: 'button',
        key: "1",
        props: {
            children: 'Update counter',
            onClick: () => { ... }
        }
    },
    {
        $$typeof: Symbol(react.element),
        type: 'span',
        key: "2",
        props: {
            children: 0
        }
    }
]
```
你可以看到React为这些对象都添加了一个 $$typeof 属性，用于将它们标识为 React elements。type，key 和 props 用于描述 element，这些值从 React.createElement传递进来。注意 React 如何将文本内容表示为 span 和 button 节点的子节点。点击事件添加到props中。React 元素上还有其他字段，例如超出本文范围的字段。keypropsReact.createElementspanbuttonbuttonref

的 React 元素 ClickCounter 没有任何道具或键：

```jsx
{
    $$typeof: Symbol(react.element),
    key: null,
    props: {},
    ref: null,
    type: ClickCounter
}
```

### 光纤节点

在协调 过程中，该方法返回的每个 React 元素的数据都 render 被合并到 Fiber 节点树中。每个 React 元素都有一个对应的 Fiber 节点。与 React 元素不同，Fiber 不会在每次渲染时重新创建。这些是保存组件状态和 DOM 的可变数据结构。

我们之前讨论过，根据 React 元素的类型，框架需要执行不同的活动。在我们的示例应用程序中，对于类组件 ClickCounter，它调用生命周期方法和 render 方法，而对于 span 宿主组件（DOM 节点），它执行 DOM 突变。因此，每个 React 元素都被转换为相应类型的 Fiber 节点，该节点描述了需要完成的工作。

您可以将纤程视为一种数据结构，它代表一些要完成的工作，或者换句话说，一个工作单元。Fiber 的架构还提供了一种方便的方式来跟踪、调度、暂停和中止工作。

当一个 React 元素第一次转换为一个 Fiber 节点时，React 使用来自该元素的数据在 createFiberFromTypeAndProps 函数中创建一个 Fiber。在随后的更新中，React 重用了 Fiber 节点，并且只使用来自相应 React 元素的数据更新了必要的属性。key 如果不再从 render 方法返回相应的 React 元素，React 可能还需要根据 prop 移动层次结构中的节点或将其删除。

查看 ChildReconciler 函数以查看 React 为现有纤程节点执行的所有活动和相应函数的列表。

因为 React 为每个 React 元素创建了一个纤程，并且由于我们有这些元素的树，所以我们将有一个纤程节点树。在我们的示例应用程序中，它看起来像这样：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/reconciler-01.png)

所有光纤节点都通过使用光纤节点上的以下属性的链表连接 child：sibling 和 return。有关它为何以这种方式工作的更多详细信息，请查看我的文章 The how and why on React 在 Fiber 中使用链表（如果您尚未阅读）。

### 当前和进行中的树

在第一次渲染之后，React 最终会生成一个纤维树，它反映了用于渲染 UI 的应用程序的状态。这棵树通常被称为 current。当 React 开始处理更新时，它会构建一个所谓的 workInProgress 树，以反映要刷新到屏幕的未来状态。

所有工作都在 workInProgress 树中的纤维上执行。当 React 遍历 current 树时，对于每个现有的 Fiber 节点，它都会创建一个构成 workInProgress 树的备用节点。该节点是使用该 render 方法返回的 React 元素中的数据创建的。处理完更新并完成所有相关工作后，React 将准备好备用树以刷新到屏幕上。一旦这 workInProgress 棵树在屏幕上呈现，它就变成了 current 树。

React 的核心原则之一是一致性。React 总是一次性更新 DOM——它不会显示部分结果。workInProgress 树充当用户不可见的“草稿”，因此 React 可以首先处理所有组件，然后将它们的更改刷新到屏幕上。

在源代码中，您会看到许多从树 current 和 workInProgress 树中获取光纤节点的函数。这是一个这样的函数的签名：

```jsx
function updateHostComponent(current, workInProgress, renderExpirationTime) {...}
```

每个纤程节点都持有对来自备用字段中另一棵树的对应节点的引用。树中的节点 current 指向树中的节点，workInProgress 反之亦然。

### 副作用

我们可以将 React 中的组件视为使用 state 和 props 来计算 UI 表示的函数。任何其他活动，如改变 DOM 或调用生命周期方法都应该被视为副作用，或者简单地说，是一种效果。文档中还提到了效果：

> 您之前可能已经执行过数据获取、订阅或手动更改 React 组件中的 DOM。我们将这些操作称为“副作用”（或简称为“效果”），因为它们会影响其他组件并且在渲染期间无法完成。

您可以看到大多数状态和道具更新将如何导致副作用。而且由于应用效果是一种工作，光纤节点是一种方便的机制，除了更新之外还可以跟踪效果。每个光纤节点都可以有与之相关的效果。它们在 effectTag 现场编码。

因此，Fiber 中的效果基本上定义了在处理更新后需要为实例完成的工作。对于宿主组件（DOM 元素），工作包括添加、更新或删除元素。对于类组件，React 可能需要更新 refs 并调用 componentDidMount 和 componentDidUpdate 生命周期方法。还有对应于其他类型的纤维的其他效果。

### 效果列表

React 进程更新非常快，为了达到这种性能水平，它采用了一些有趣的技术。其中之一是构建具有快速迭代效果的光纤节点线性列表。 迭代线性列表比树快得多，并且无需在没有副作用的节点上花费时间。

此列表的目标是标记具有 DOM 更新或与其相关联的其他效果的节点。此列表是树的子集，并使用属性而不是树中使用的属性 finishedWork 进行链接。nextEffectchildcurrentworkInProgress

Dan Abramov 提供了一个效果列表的类比。他喜欢把它想象成一棵圣诞树，用“圣诞灯”将所有有效的节点绑定在一起。为了可视化这一点，让我们想象以下纤维节点树，其中突出显示的节点有一些工作要做。例如，我们的更新导致 c2 插入到 DOM 中，d2 并 c1 更改属性，并 b2 触发生命周期方法。效果列表会将它们链接在一起，以便 React 稍后可以跳过其他节点：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/reconciler-02.png)

您可以看到具有效果的节点是如何链接在一起的。当遍历节点时，React 使用 firstEffect 指针来确定列表的开始位置。所以上图可以表示为这样的线性列表：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/reconciler-03.png)

### 纤维树的根

每个 React 应用程序都有一个或多个充当容器的 DOM 元素。在我们的例子中，它是 div 带有 ID 的元素 container。

```jsx
const domContainer = document.querySelector("#container");
ReactDOM.render(React.createElement(ClickCounter), domContainer);
```

React 为每个容器创建一个纤程根对象。您可以使用对 DOM 元素的引用来访问它：

```jsx
const fiberRoot = query("#container")._reactRootContainer._internalRoot;
```

这个纤程根是 React 保存对纤程树的引用的地方。它存储在 current 纤维根的属性中：

```jsx
const hostRootFiberNode = fiberRoot.current;
```

光纤树以一种特殊类型的光纤节点开始，即 HostRoot. 它是在内部创建的，并充当您最顶层组件的父级。有一个从 HostRoot 光纤节点返回到 FiberRootthroughstateNode 属性的链接：

```jsx
fiberRoot.current.stateNode === fiberRoot; // true
```

HostRoot 您可以通过光纤根访问最顶层的光纤节点来探索光纤树。或者您可以从组件实例中获取单个光纤节点，如下所示：

```jsx
compInstance._reactInternalFiber;
```

### 光纤节点结构

现在让我们看一下为 ClickCounter 组件创建的光纤节点的结构：

```jsx
{
    stateNode: new ClickCounter,
    type: ClickCounter,
    alternate: null,
    key: null,
    updateQueue: null,
    memoizedState: {count: 0},
    pendingProps: {},
    memoizedProps: {},
    tag: 1,
    effectTag: 0,
    nextEffect: null
}
```

和 spanDOM 元素：

```jsx
{
    stateNode: new HTMLSpanElement,
    type: "span",
    alternate: null,
    key: "2",
    updateQueue: null,
    memoizedState: null,
    pendingProps: {children: 0},
    memoizedProps: {children: 0},
    tag: 5,
    effectTag: 0,
    nextEffect: null
}
```

光纤节点上有相当多的字段。我已经描述了字段的用途 alternate，effectTag 并且 nextEffect 在前面的部分中。现在让我们看看为什么我们需要其他人。

### 状态节点

保存对组件的类实例、DOM 节点或与 Fiber 节点关联的其他 React 元素类型的引用。一般来说，我们可以说这个属性用于保存与光纤相关的本地状态。

### 类型

定义与此纤程关联的函数或类。对于类组件，它指向构造函数，对于 DOM 元素，它指定 HTML 标记。我经常使用这个字段来了解光纤节点与什么元素相关。

### 标签

定义纤维的类型。它在协调算法中用于确定需要完成的工作。如前所述，工作因 React 元素的类型而异。函数 createFiberFromTypeAndProps 将 React 元素映射到相应的光纤节点类型。在我们的应用程序中，组件的属性是 tag 表示 a ，而元素的属性表示 a 。ClickCounter1ClassComponentspan5HostComponent

### 更新队列

状态更新、回调和 DOM 更新的队列。

### 记忆状态

用于创建输出的光纤的状态。在处理更新时，它会反映当前在屏幕上呈现的状态。

### 记忆道具

在上一次渲染期间用于创建输出的光纤道具。

### 待定道具

已从 React 元素中的新数据更新并需要应用于子组件或 DOM 元素的道具。

### 钥匙

一组孩子的唯一标识符，以帮助 React 确定哪些项目已更改，已从列表中添加或删除。它与此处描述的 React 的“列表和键”功能有关。

您可以在此处找到光纤节点的完整结构。我在上面的解释中省略了一堆字段。特别是，我跳过了指针 child，sibling 它 return 构成了我在上一篇文章中描述的树数据结构。以及特定于 expirationTime 的一类字段。childExpirationTime mode Scheduler

### 通用算法

React 在两个主要阶段执行工作：渲染和提交。

在第一 render 阶段，React 将更新应用到通过 setStateor 安排的组件 React.render，并找出需要在 UI 中更新的内容。如果是初始渲染，React 会为 render 方法返回的每个元素创建一个新的 Fiber 节点。在接下来的更新中，现有 React 元素的纤维被重新使用和更新。该阶段的结果是一棵标有副作用的纤维节点树。效果描述了在下一个阶段需要完成的工作。在 commit 这个阶段，React 获取一个标记有效果的纤维树并将它们应用于实例。它遍历效果列表并执行 DOM 更新和用户可见的其他更改。

重要的是要了解第一 render 阶段的工作可以异步执行。React 可以根据可用时间处理一个或多个光纤节点，然后停止以存储已完成的工作并屈服于某些事件。然后它从停止的地方继续。但有时，它可能需要放弃已完成的工作并重新从头开始。这些暂停之所以成为可能，是因为在此阶段执行的工作不会导致任何用户可见的更改，例如 DOM 更新。相反，接下来的 commit 阶段总是同步的。这是因为在此阶段执行的工作会导致用户可见的更改，例如 DOM 更新。这就是为什么 React 需要一次性完成它们的原因。

调用生命周期方法是 React 执行的一种工作。在阶段期间调用一些方法，在 render 阶段期间调用其他方法 commit。以下是在第一 render 阶段工作时调用的生命周期列表：

- [UNSAFE_]componentWillMount（已弃用）
- [UNSAFE_]componentWillReceiveProps（已弃用）
- getDerivedStateFromProps
- 应该组件更新
- [UNSAFE_]componentWillUpdate（已弃用）
- 使成为

如您所见，在该 render 阶段执行的一些遗留生命周期方法被标记为 UNSAFE 从版本 16.3 开始。它们现在在文档中称为遗留生命周期。它们将在未来的 16.x 版本中被弃用，并且不带 UNSAFE 前缀的对应物将在 17.0 中删除。您可以在此处阅读有关这些更改和建议的迁移路径的更多信息。

你对这其中的原因感到好奇吗？

好吧，我们刚刚了解到，由于 render 阶段不会产生像 DOM 更新那样的副作用，React 可以异步处理对组件的更新（甚至可能在多个线程中进行）。但是，标记为的生命周期 UNSAFE 经常被误解并巧妙地滥用。开发人员倾向于将具有副作用的代码放在这些方法中，这可能会导致新的异步渲染方法出现问题。尽管只会 UNSAFE 删除不带前缀的对应项，但它们仍然可能在即将到来的并发模式（您可以选择退出）中引起问题。

以下是在第二 commit 阶段执行的生命周期方法列表：

- getSnapshotBeforeUpdate
- 组件 DidMount
- 组件 DidUpdate
- 组件 WillUnmount

因为这些方法在同步 commit 阶段执行，它们可能包含副作用并触及 DOM。

好的，现在我们有背景来看看用于遍历树并执行工作的通用算法。让我们潜入水中。

### 渲染阶段

协调算法总是使用 renderRoot 函数从最顶层的 HostRoot 光纤节点开始。但是，React 会退出（跳过）已处理的 Fiber 节点，直到找到未完成工作的节点。例如，如果您在组件树的深处调用，React 将从顶部开始但快速跳过父节点，直到到达调用了它的方法的组件。setStatesetState

### 工作循环的主要步骤

所有光纤节点都在工作循环中处理。这是循环的同步部分的实现：

```jsx
function workLoop(isYieldy) {
  if (!isYieldy) {
    while (nextUnitOfWork !== null) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  } else {...}
}
```

在上面的代码中，nextUnitOfWork 保存了对树中纤维节点的引用，该节点 workInProgress 有一些工作要做。当 React 遍历 Fibers 树时，它使用这个变量来了解是否还有其他未完成工作的 Fiber 节点。处理当前纤程后，变量将包含对树中下一个纤程节点的引用或 null. 在这种情况下，React 退出工作循环并准备好提交更改。

有 4 个主要函数用于遍历树并启动或完成工作：

- 执行工作单元
- 开始工作
- 完成工作单元
- 完成工作

为了演示如何使用它们，请查看以下遍历纤维树的动画。我在演示中使用了这些函数的简化实现。每个函数都需要一个纤程节点来处理，当 React 沿着树向下移动时，您可以看到当前活动的纤程节点发生了变化。您可以在视频中清楚地看到算法是如何从一个分支转到另一个分支的。它首先完成了孩子的工作，然后才转移给父母。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/reconciler-03.gif)

> 请注意，直的垂直连接表示兄弟姐妹，而弯曲的连接表示孩子，例如 b1 没有孩子，而 b2 有一个孩子 c1。

这是视频的链接，您可以在其中暂停播放并检查当前节点和函数状态。从概念上讲，您可以将“开始”视为“进入”一个组件，将“完成”视为“走出”它。当我解释这些函数的作用时，您还可以在此处使用示例和实现。

让我们从前两个函数 performUnitOfWork 和开始 beginWork：

```jsx
function performUnitOfWork(workInProgress) {
  let next = beginWork(workInProgress);
  if (next === null) {
    next = completeUnitOfWork(workInProgress);
  }
  return next;
}

function beginWork(workInProgress) {
  console.log("work performed for " + workInProgress.name);
  return workInProgress.child;
}
```

该函数从树 performUnitOfWork 中接收一个纤程节点并通过调用函数开始工作。该函数将启动需要为纤程执行的所有活动。出于演示的目的，我们只记录光纤的名称以表示工作已经完成。该函数总是返回一个指向循环中要处理的下一个子节点的指针，或者。workInProgressbeginWork beginWork null

如果有下一个孩子，它将被分配给函数 nextUnitOfWork 中的变量。workLoop 但是，如果没有子节点，React 知道它到达了分支的末尾，因此它可以完成当前节点。一旦节点完成，它需要为兄弟姐妹执行工作并在此之后回溯到父节点。这是在 completeUnitOfWork 函数中完成的：

```jsx
function completeUnitOfWork(workInProgress) {
  while (true) {
    let returnFiber = workInProgress.return;
    let siblingFiber = workInProgress.sibling;

    nextUnitOfWork = completeWork(workInProgress);

    if (siblingFiber !== null) {
      // If there is a sibling, return it
      // to perform work for this sibling
      return siblingFiber;
    } else if (returnFiber !== null) {
      // If there's no more work in this returnFiber,
      // continue the loop to complete the parent.
      workInProgress = returnFiber;
      continue;
    } else {
      // We've reached the root.
      return null;
    }
  }
}

function completeWork(workInProgress) {
  console.log("work completed for " + workInProgress.name);
  return null;
}
```

您可以看到该函数的要点是一个大 while 循环。workInProgress 当节点没有子节点时，React 会进入此函数。在完成当前纤程的工作后，它会检查是否有兄弟姐妹。如果找到，React 退出函数并返回指向兄弟的指针。它将被分配给 nextUnitOfWork 变量，React 将从这个兄弟节点开始执行分支的工作。重要的是要理解，此时 React 只完成了前面兄弟姐妹的工作。它还没有完成父节点的工作。只有从子节点开始的所有分支都完成后，它才能完成父节点和回溯的工作。

从实现中可以看出， 和 completeUnitOfWork 都主要用于迭代目的，而主要活动发生在 beginWorkandcompleteWork 函数中。在本系列的后续文章中，我们将了解当 React 进入和运行时 ClickCounter 组件和节点会发生什么。spanbeginWorkcompleteWork

### 提交阶段

该阶段从函数 completeRoot 开始。这是 React 更新 DOM 并调用突变前后生命周期方法的地方。

当 React 进入这个阶段时，它有 2 棵树和效果列表。第一个树代表当前在屏幕上呈现的状态。然后在该 render 阶段构建了一个备用树。它在源代码中称为 finishedWorkor workInProgress，表示需要在屏幕上反映的状态。该替代树通过 child 和 sibling 指针与当前树类似地链接。

然后，有一个效果列表——通过指针链接的树 中的节点子集。请记住，效果列表是运行阶段的结果。渲染的重点是确定哪些节点需要插入、更新或删除，哪些组件需要调用其生命周期方法。这就是效果列表告诉我们的。它正是在提交阶段迭代的节点集。finishedWorknextEffectrender

> 出于调试目的，current 可以通过 current 光纤根的属性访问树。树 finishedWork 可以通过当前树中节点的 alternate 属性来访问。HostFiber

在提交阶段运行的主要功能是 commitRoot。基本上，它执行以下操作：

- getSnapshotBeforeUpdate 在标记有 Snapshot 效果的节点上调用生命周期方法
- componentWillUnmount 在标记有 Deletion 效果的节点上调用生命周期方法
- 执行所有 DOM 插入、更新和删除
- 将 finishedWork 树设置为当前
- componentDidMount 在标记有 Placement 效果的节点上调用生命周期方法
- componentDidUpdate 在标记有 Update 效果的节点上调用生命周期方法

在调用 pre-mutation 方法之后 getSnapshotBeforeUpdate，React 会在树中提交所有副作用。它分两次完成。第一遍执行所有 DOM（主机）插入、更新、删除和 ref 卸载。然后 React 将 finishedWork 树分配给将树 FiberRoot 标记 workInProgress 为 current 树。这是在提交阶段的第一遍之后完成的，因此前一棵树在 期间仍然是当前的 componentWillUnmount，但在第二遍之前，因此完成的工作在 期间是当前的。在第二遍中，React 调用所有其他生命周期方法和 ref 回调。这些方法作为单独的传递执行，因此整个树中的所有放置、更新和删除都已被调用。componentDidMount/Update

以下是运行上述步骤的函数的要点：

```jsx
function commitRoot(root, finishedWork) {
  commitBeforeMutationLifecycles();
  commitAllHostEffects();
  root.current = finishedWork;
  commitAllLifeCycles();
}
```

这些子函数中的每一个都实现了一个循环，该循环遍历效果列表并检查效果的类型。当它找到与功能目的相关的效果时，它会应用它。

### 突变前生命周期方法

例如，下面是遍历效果树并检查节点是否具有 Snapshot 效果的代码：

```jsx
function commitBeforeMutationLifecycles() {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;
    if (effectTag & Snapshot) {
      const current = nextEffect.alternate;
      commitBeforeMutationLifeCycles(current, nextEffect);
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```

对于一个类组件，这个效果意味着调用 getSnapshotBeforeUpdate 生命周期方法。

### DOM 更新

commitAllHostEffects 是 React 执行 DOM 更新的函数。该函数基本上定义了需要对节点执行的操作类型并执行它：

```jsx
function commitAllHostEffects() {
    switch (primaryEffectTag) {
        case Placement: {
            commitPlacement(nextEffect);
            ...
        }
        case PlacementAndUpdate: {
            commitPlacement(nextEffect);
            commitWork(current, nextEffect);
            ...
        }
        case Update: {
            commitWork(current, nextEffect);
            ...
        }
        case Deletion: {
            commitDeletion(nextEffect);
            ...
        }
    }
}
```

有趣的是，React 调用该 componentWillUnmount 方法作为 commitDeletion 函数中删除过程的一部分。

### 突变后生命周期方法

commitAllLifecycles 是 React 调用所有剩余生命周期方法 componentDidUpdate 和 componentDidMount.

我们终于完成了。让我知道你对这篇文章的看法或在评论中提问。查看 React 中状态和道具更新的深入解释系列中的下一篇文章。我还有更多的文章正在编写中，为调度程序、子协调过程以及如何构建效果列表提供了深入的解释。我还计划创建一个视频，在其中我将展示如何使用本文作为基础来调试应用程序。
