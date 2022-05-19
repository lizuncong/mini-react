## Fiber 内部：React 中新的协调算法的深入概述

> 深入了解 React 的 Fiber 新架构，并了解新协调算法的两个主要阶段。我们将详细了解 React 如何更新 state 和 props 以及处理子节点

React 是一个用于构建用户界面的 JavaScript 库。其核心机制在于跟踪组件状态变化并将更新的状态展示到屏幕。在 React 中，我们将此过程称为**协调**。我们调用 setState 方法，框架会检查状态(state)或属性(props)是否已更改，并重新渲染组件到页面上。

React 官方文档很好的概述了该机制：React 元素的角色、生命周期方法和 render 方法，以及应用于组件子节点的 dom diff 算法。**render 方法返回的不可变的 React elements tree 通常被称为“虚拟 DOM”**。该术语有助于在早期向人们解释 React，但它也引起了困惑，并且不再在 React 文档中使用。在本文中，我将统一称它为 React elements tree。

> 译者注：这里需要注意，每次调用 render 方法，都会重新生成一棵 react element tree，同时 react element tree 是不可修改的。

除了 React elements tree 之外，还有一个用于保存状态的内部实例(组件、DOM 节点等)树。从 16 版本开始，React 推出了该内部实例树的全新实现，对应的算法称为**Fiber**。要了解 Fiber 架构带来的优势，请查看 [The how and why on React’s usage of linked list in Fiber.](https://indepth.dev/posts/1007/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-to-walk-the-components-tree)。

这是本系列的第一篇文章，旨在介绍 React 的内部架构。在本文中，我想深入概述与算法相关的重要概念和数据结构。一旦我们有足够的背景知识，我们将探索用于遍历和处理**fiber tree**的算法和主要函数。本系列的下一篇文章将演示 React 如何使用该算法来执行初次渲染以及处理状态(state)和属性(props)更新。然后我们将继续详细介绍调度(scheduler)、子元素协调过程以及构建 effects list 的机制。

> 译者注：我们需要了解 React 第一次渲染是怎样的，当我们调用 setState 时，React 如何处理状态和属性的更新，然后怎么调度更新，当更新开始时，React 如何进行 DOM Diff 并构建副作用列表(effects list)

我并不是要在这里给你介绍一些非常高级的知识。我鼓励你阅读这篇文章以了解 Concurrent React 内部运作的底层原理。如果你打算开始为 React 源码做贡献，本系列文章也会是一个很好的指南。我是[Reverse Engineering](https://indepth.dev/posts/1005/level-up-your-reverse-engineering-skills)的坚定信徒，所以会有很多指向最近的 16.6.0 版本源码的链接。

> 译者注：Reverse Engineering 指不满足于使用某一工具，然后通过阅读源码去了解其内部原理，作者将此称为 reverse engineering(逆向工程)

这里肯定会有相当多的知识需要吸收，所以如果你没有马上理解一些东西，不要感到压力。一切都值得花时间。当然，你无需了解本篇文章的内容也是可以使用 React 的。这篇文章是介绍 React 内部工作原理的。

> 译者小结：本节主要对这篇文章的内容进行一个概述，本篇文章主要是介绍新的协调算法的两个主要阶段： render 和 commit。在这两个阶段中，生命周期方法是如何调用的。作者也简单介绍了下一篇文章将会介绍初次渲染以及更新，调度，协调过程，构建 effect list 的机制等

### 前置知识

这是一个简单的应用程序，我将在整个系列中使用它。我们有一个按钮，可以简单地增加屏幕上呈现的数字：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/reconciler-04.gif)

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

React 中的每个组件都有一个从 render 方法返回的 UI 表示，我们可以称为视图或模板。这是我们 ClickCounter 组件的模板：

```jsx
<button key="1" onClick={this.onClick}>Update counter</button>
<span key="2">{this.state.count}</span>
```

#### React Elements

一旦经过 babel 编译，render 方法返回的就是一个 react elements tree，而不是 html。由于我们不是必须使用 JSX，因此我们可以使用 `createElement` 重写我们的 ClickCounter 组件的 render 方法。

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

React.createElement 方法 将创建两个数据结构，如下所示：

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

你可以看到 React 为这些对象都添加了一个 $$typeof 属性，用于将它们标识为 React elements。type，key 和 props 用于描述 element，这些值从 React.createElement 传递进来。注意 React 如何将文本内容表示为 span 和 button 节点的子节点。button 元素的点击事件也添加到 props 属性中。React 元素上还有其他字段不在本篇文章讨论范围，例如 ref。

ClickCounter 元素没有任何属性或者 key

```jsx
{
    $$typeof: Symbol(react.element),
    key: null,
    props: {},
    ref: null,
    type: ClickCounter
}
```

#### Fiber 节点

在协调过程中，render 方法返回的每个 React 元素的数据都被合并到 Fiber tree 中。每个 React 元素都有一个对应的 Fiber 节点。与 React 元素不同，**Fiber 不会在每次渲染时重新创建**。Fiber 是保存组件状态和 DOM 的**可变**数据结构。

我们之前讨论过，根据 React 元素的类型，框架需要执行不同的活动。在我们的示例应用程序中，对于类组件 ClickCounter，它调用生命周期方法和 render 方法，而对于 span 宿主组件（DOM 节点），它执行 DOM 更新。因此，每个 React 元素都被转换为相应类型的 Fiber 节点，该节点描述了需要完成的工作。

**你可以将 fiber 当作一种数据结构，它代表一些要完成的工作，或者换句话说，一个工作单元。Fiber 的架构还提供了一种方便的方式来跟踪、调度、暂停和中止工作。**

当一个 React 元素第一次转换为一个 Fiber 节点时，React 在 createFiberFromTypeAndProps 函数中使用 element 中的数据创建一个 fiber。在随后的更新中，React 复用 Fiber 节点，并且仅使用对应的 react element 中的数据更新必要的属性。
React 可能需要基于 key 属性移动节点或者如果 render 方法返回的相应的 react element 已经不存在，则删除节点。

> [ChildReconciler](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactChildFiber.js#L239)函数列举了所有的 React 为 fiber 节点所执行的所有活动及其对应的函数

因为 React 为每个 React element 创建了一个 fiber，并且由于我们有一个 React element 树，那么对应的我们也会有一个 fiber 节点树。在我们的示例应用程序中，它看起来像这样：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/reconciler-01.png)

所有 fiber 节点都通过 child、sibling 以及 return 属性链接成一个链表。可以阅读我这篇文章[ The how and why on React’s usage of linked list in Fiber](https://medium.com/dailyjs/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7)去了解为什么需要这么做。

#### Current and work in progress trees

在第一次渲染之后，React 最终会生成一个 fiber 树，它反映了用于渲染 UI 的应用程序的状态。**这棵树通常被称为 current**。当 React 开始处理更新时，它会构建一个所谓的 workInProgress 树，以反映要刷新到屏幕的最新的状态。

> 译者注：current tree 就是当前屏幕上显示的页面对应的 fiber tree

所有工作都在 workInProgress 树中的 fiber 节点上执行。当 React 遍历 current 树时，对于每个现有的 Fiber 节点，它都会创建一个构成 workInProgress 树的 alternate (备用)节点。alternate 节点是使用 render 方法返回的 React element 中的数据创建的。处理完更新并完成所有相关工作后，React 将准备好 alternate 树以更新到屏幕上。一旦 workInProgress 树在屏幕上呈现，它就变成了 current 树。

React 的核心原则之一是一致性。React 总是一次性更新 DOM——它不会显示部分结果。workInProgress 树充当用户不可见的“草稿”，因此 React 可以首先处理所有组件，然后将它们的更改刷新到屏幕上。

> 译者注：更新 DOM 是同步的，根据 render 方法返回的 react element tree 构建 workInProgress tree 这个过程是可以批量，并且可打断的。

在源代码中，你会看到很多函数都使用了 current 和 workInProgress tree 中的 fiber 节点。这是其中一个函数的签名：

```jsx
function updateHostComponent(current, workInProgress, renderExpirationTime) {...}
```

每个 fiber 节点都有一个 alternate 字段引用旧的 fiber 树上的节点。current 树中的节点指向 workInProgress 树中的节点，反之亦然。

#### 副作用(Side-effects)

我们可以将 React 中的组件当作使用 state 和 props 来计算 UI 表示的函数。**任何活动，如改变 DOM 或调用生命周期方法都应该被视为副作用，或者简单地说，是一种效果(effect)**。文档中还提到了效果(Effects)：

> 你之前可能已经执行过数据获取、订阅或手动更改 React 组件中的 DOM。我们将这些操作称为“副作用”（或简称为“效果”），因为它们会影响其他组件并且在渲染期间无法完成。

你可以看到大多数 state 和 props 更新是怎样导致副作用。同时由于应用这些效果(effects)也是一种类型的工作，一个 fiber 节点提供了一种方便的机制去跟踪效果(effects)以及更新。每个 fiber 节点都可以有与之相关的效果。使用 effectTag 字段表示。

因此，在处理完更新后，Fiber 中的效果(effects)基本上定义了需要为实例完成的工作。对于宿主组件（DOM 元素），工作包括添加、更新或删除元素。对于类组件，React 可能需要更新 refs 并调用 componentDidMount 和 componentDidUpdate 生命周期方法。当然还有和其他类型 fiber 对应的效果。

#### 副作用列表(Effects list)

React 处理更新非常快，为了达到这种性能水平，它采用了一些有趣的技术。**其中之一是将有副作用的 fiber 节点构建成线性列表，方便快速遍历**。 遍历线性列表比树快得多，并且无需在没有副作用的节点上花费时间。

此列表的目标是标记具有 DOM 更新或其他相关联的副作用的节点。此列表是 finishedWork 树的子集，并且使用 nextEffect 属性相连，而不是使用 current 或者 workInProgress 树中的 child 属性

[Dan Abramov](https://medium.com/@dan_abramov) 提供了一个效果列表的类比。他喜欢把它想象成一棵圣诞树，用“圣诞灯”将所有有效的节点绑定在一起。为了直观的感受这一点，假设我们有以下 fiber 节点树，其中高亮的节点表示有一些工作要做。例如，我们的更新导致 c2 插入到 DOM 中，d2 和 c1 需要更新属性(attributes)，b2 调用生命周期方法。这些有副作用的节点会连接成一个链表，这样 React 就可以跳过其他没有副作用的节点

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/reconciler-02.png)

你可以看到具有副作用的节点是如何链接在一起的。当遍历节点时，React 使用 firstEffect 指针来确定列表的开始位置。所以上图可以表示为这样的线性列表：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/reconciler-03.png)

> 译者注：不管是效果列表还是副作用列表，其实都是指的 effect list。一般称为副作用列表会好点，用于指那些有副作用的 fiber 节点构成的链表

#### Fiber tree 的根(Root of the Fiber tree)

每个 React 应用程序都有一个或多个充当容器的 DOM 元素。在我们的例子中，它是 id 为 container 的 div 元素

```jsx
const domContainer = document.querySelector("#container");
ReactDOM.render(React.createElement(ClickCounter), domContainer);
```

React 为每个容器创建一个 fiber root 对象。你可以使用 DOM 元素上的引用来访问它：

```jsx
const fiberRoot = query("#container")._reactRootContainer._internalRoot;
```

这个 fiber root 是 React 保存对 fiber tree 的引用的地方。它保存在 fiber root 的 current 属性中

```jsx
const hostRootFiberNode = fiberRoot.current;
```

fiber 树的根节点是一种特殊的类型，即 HostRoot。它是在内部创建的，并充当最顶层组件的父级。HostRoot Fiber 节点有个 stateNode 属性 指向 fiberRoot(fiberRoot 即 query("#container").\_reactRootContainer.\_internalRoot)

```jsx
fiberRoot.current.stateNode === fiberRoot; // true
```

你可以通过 fiber root 访问最顶层的 HostRoot fiber 节点来探索 fiber tree。或者可以从组件实例中获取单个 fiber 节点，如下所示：

```jsx
compInstance._reactInternalFiber;
```

> 译者注：fiberRoot 的类型是 FiberRootNode，并不是 FiberNode 类型，因此这并不是一个 Fiber 节点。hostRootFiberNode 是 FiberNode 类型， 它是 container 容器对应的 Fiber 节点。也是整个 fiber tree 的根 fiber，因此也称为 HostRoot Fiber。

#### Fiber 节点结构

现在让我们看一下 ClickCounter 组件对应的 fiber 节点的结构：

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

span 元素对应的 fiber 节点结构：

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

fiber 节点有相当多的字段。在前面的章节中我已经描述了 alternate，effectTag 以及 nextEffect 的作用。现在让我们看看为什么我们需要其他字段

#### 状态节点(stateNode)

用于保存组件的类实例、DOM 节点或与 Fiber 节点相关的其他 React 元素类型。一般来说，我们可以说这个属性用于保存与 fiber 相关的本地状态。

#### 类型(type)

定义与 fiber 关联的函数或类。对于类组件，它指向构造函数，对于 DOM 元素，它指定 HTML 标记。我经常使用这个字段来了解 fiber 节点是什么类型的元素。

#### 标签(tag)

定义 fiber 的类型。它在协调算法中用于确定需要完成的工作。如前所述，工作因 React 元素的类型而异。函数 createFiberFromTypeAndProps 将 React 元素映射到相应的 fiber 节点类型。在我们的应用程序中，ClickCounter 组件的 tag 属性是 1，表示这是一个 ClassComponent。span 元素的 tag 属性是 5，表示这是一个 HostComponent。

#### 更新队列(updateQueue)

状态更新、回调和 DOM 更新的队列。

> 译者注：这是在类组件中使用的更新队列，函数组件的更新队列在 memoizedState.queue 中

#### memoizedState

保存 fiber 的状态。在处理更新时，它会反映当前在屏幕上呈现的状态。

> 译者注：在类组件中，memoizedState 用于保存状态(state)，然而在函数组件中，memoizedState 用来保存 hook 链表

#### memoizedProps

上一次渲染期间使用的 props

#### pendingProps

新的 React element 中的数据更新后的 props，需要应用到子组件或者 DOM 元素上

#### key

一组子节点的唯一标志，用于帮助 React 确定哪些元素更改，添加，或者删除。它与[此处](https://reactjs.org/docs/lists-and-keys.html#keys)描述的 React 的“列表和 keys”功能有关。

你可以在[此处](https://github.com/facebook/react/blob/6e4f7c788603dac7fccd227a4852c110b072fe16/packages/react-reconciler/src/ReactFiber.js#L78)找到 fiber 节点的完整结构。我在上面的解释中省略了一堆字段。特别是，我跳过了构成树数据结构的 child，sibling 以及 return 指针。我在[上一篇文章](https://indepth.dev/posts/1007/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-to-walk-the-components-tree)有介绍过。以及和调度有关的一类字段，比如 expirationTime，childExpirationTime 以及 mode

### 通用算法(General algorithm)

React 在两个主要阶段执行工作：**渲染(render)和提交(commit)**。

在第一阶段，即 render 阶段，react 将更新应用到组件上，通过 setState 或者 React.render 调度，并找出需要在 UI 中更新的内容。如果是第一次渲染，React 会为 render 方法返回的每个元素创建一个新的 Fiber 节点。在接下来的更新中，已存在的 React 元素的 fiber 节点将被重新使用和更新。**render 阶段的结果是一个标有副作用的 fiber 节点树**。效果(effects)描述了在下一个阶段(commit 阶段)需要完成的工作。在 commit 阶段，React 得到一个标记有效果的 fiber 树并将它们应用于实例。它遍历效果列表并执行 DOM 更新和用户可见的其他更改。

**重要的是要了解 render 阶段的工作可以异步执行**。React 可以根据可用时间处理一个或多个 fiber 节点，然后暂停以响应其他事件。然后它从暂停的地方继续。**但有时，它可能需要放弃已完成的工作并重新从头开始**。这些暂停之所以成为可能，是因为在 render 阶段执行的工作不会导致任何用户可见的更改，例如 DOM 更新。**相反，接下来的 commit 阶段总是同步的**。这是因为在 commit 阶段执行的工作会导致用户可见的更改，例如 DOM 更新。这就是为什么 React 需要一次性完成它们的原因。

> 译者注：由于 commit 阶段执行 DOM 的变更，操作真实的 DOM，如果是可中断的，那么用户看到的界面将是不完整的，因此 commit 阶段一旦开始，就不能停止

React 执行的其中一种工作就是调用生命周期方法。有些生命周期方法在 render 阶段调用，另外一些在 commit 阶段调用。以下是在 render 阶段工作时调用的生命周期方法：

- [UNSAFE_]componentWillMount (deprecated)
- [UNSAFE_]componentWillReceiveProps (deprecated)
- getDerivedStateFromProps
- shouldComponentUpdate
- [UNSAFE_]componentWillUpdate (deprecated)
- render

如您所见，从 16.3 版本开始，在 render 阶段执行的一些遗留的生命周期方法被标记为 UNSAFE。它们现在在文档中称为遗留生命周期。它们将在未来的 16.x 版本中被弃用，并且不带 UNSAFE 前缀的将在 17.0 中删除。你可以在[此处](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html)阅读有关这些更改和建议的迁移路径的更多信息。

你对这其中的原因感到好奇吗？(指的是为什么需要移除这些 API)

好吧，我们刚刚了解到，由于 render 阶段不会产生像 DOM 更新那样的副作用，React 可以异步处理对组件的更新（甚至可能在多个线程中进行）。但是，标记为 UNSAFE 的生命周期方法经常被误解并误用。开发人员倾向于将具有副作用的代码放在这些方法中，在新的异步渲染方案中，这可能会出现问题。尽管只会删除不带 UNSAFE 前缀的对应方法，但它们仍然可能在即将到来的并发模式中引起问题。

> 译者注：在 17 版本中，React 将会移除不带 UNSAFE 前缀的具有副作用的生命周期方法，即 componentWillMount，componentWillReceiveProps 以及 componentWillUpdate，带 UNSAFE 前缀的目前不会移除，但会在将来移除，因此建议不要使用。

**以下是在第二阶段，即 commit 阶段执行的生命周期方法列表：**

- getSnapshotBeforeUpdate
- componentDidMount
- componentDidUpdate
- componentWillUnmount

因为这些方法在同步的 commit 阶段执行，它们可能包含副作用并操作 DOM。

好的，现在我们有背景来看看用于遍历树并执行工作的通用算法。让我们深入探讨。

#### 渲染阶段(Render phase)

协调算法总是使用 [renderRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L1132) 函数从最顶层的 HostRoot fiber 节点开始。但是，React 会退出（跳过）已处理的 Fiber 节点，直到找到未完成工作的节点。**例如，如果你在组件树的深处调用 setState，React 将从顶部开始但快速跳过父节点，直到到达调用了 setState 方法的组件**

#### 工作循环的主要步骤(Main steps of the work loop)

所有 fiber 节点都在工作循环中处理。这是循环的同步部分的实现：

```jsx
function workLoop(isYieldy) {
  if (!isYieldy) {
    while (nextUnitOfWork !== null) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  } else {...}
}
```

在上面的代码中，nextUnitOfWork 保存了对 workInProgress 树中 fiber 节点的引用，该节点有一些工作要做。当 React 遍历 Fibers 树时，它使用这个变量来判断是否还有其他未完成工作的 Fiber 节点。处理当前 fiber 后，变量将包含对树中下一个 fiber 节点的引用或 null。 在 null 情况下，React 退出工作循环并准备好提交更改。

有 4 个主要函数用于遍历树，以及启动或完成工作：

- performUnitOfWork
- beginWork
- completeUnitOfWork
- completeWork

为了演示如何使用它们，请查看以下遍历 fiber 树的动画。我在演示中使用了这些函数的简化实现。每个函数都需要处理一个 fiber 节点，当 React 沿着树向下移动时，你可以看到当前活动的 fiber 节点发生了变化。你可以在视频中清楚地看到算法是如何从一个分支转到另一个分支的。**它首先完成了子节点的工作，然后才转移给父节点**。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/reconciler-03.gif)

> 请注意，垂直连接线表示兄弟节点，而弯曲的连线表示子节点，例如 b1 没有子节点，而 b2 有一个子节点 c1。

这是[视频的链接](https://vimeo.com/302222454)，你可以在其中暂停播放并检查当前节点和函数状态。从概念上讲，你可以将“开始”视为“进入”一个组件，将“完成”视为“走出”它。当我解释这些函数的作用时，你还可以在[此处](https://stackblitz.com/edit/js-ntqfil?file=index.js)使用示例和实现。

让我们从前两个函数 performUnitOfWork 和 beginWork 开始：

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

performUnitOfWork 函数从 workInProgress 树中接收一个 fiber 节点并通过调用 beginWork 函数开始工作。performUnitOfWork 函数将启动所有的需要为 fiber 执行的活动。出于演示的目的，我们只输出 fiber 的名称以表示工作已经完成。**beginWork 函数总是返回指向下一个需要处理的子节点的指针，或者 null**

如果有下一个子节点，它将在 workLoop 函数中被分配 给 nextUnitOfWork。但是，如果没有子节点，React 知道它到达了分支的末尾，因此它可以完成当前节点。**一旦节点完成，它需要为兄弟节点执行工作并在此之后回溯到父节点**。这是在 completeUnitOfWork 函数中完成的：

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

你可以看到 completeUnitOfWork 函数的要点是一个 while 循环。当一个 workInProgress 节点没有子节点时，React 会进入此函数。在完成当前 fiber 的工作后，它会检查是否有兄弟节点。如果找到，React 退出函数并返回指向兄弟节点的指针。它将被分配给 nextUnitOfWork 变量，React 将从这个兄弟节点开始执行分支的工作。重要的是要理解，此时 React 只完成了前面节点的工作。它还没有完成父节点的工作。**只有从子节点开始的所有分支都完成后，它才能完成父节点和回溯的工作。**

> 译者注：即当所有的子节点完成后，父节点才能完成并回溯

从实现中可以看出， performUnitOfWork 和 completeUnitOfWork 函数 都主要用于遍历，而主要的逻辑都在 beginWork 和 completeWork 函数中。在本系列的后续文章中，我们将了解 React 在 beginWork 和 completeWork 函数中如何处理 ClickCounter 组件以及 span 节点

### 提交阶段(Commit phase)

该阶段从函数 [completeRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L2306) 开始。这是 React 更新 DOM 并调用更新前及更新后(pre and post mutation)生命周期方法的地方。

**当 React 进入这个阶段时，它有 2 棵树和效果列表(effects list)**。第一个树代表当前在屏幕上呈现的状态。另外一棵树是在 render 阶段构建的备用树(alternate tree)。它在源代码中称为 finishedWork 或者 workInProgress，表示需要在屏幕上呈现的状态。和 current 树一样，alternate 树也是通过 child 和 sibling 指针链接在一起。

然后，有一个效果列表(effects list)——finishedWork 树的子集，通过 nextEffect 指针链接在一起。**请记住，效果列表(effect list)是 render 阶段的结果**。**渲染的重点是确定哪些节点需要插入、更新或删除，哪些组件需要调用其生命周期方法**。这就是效果列表告诉我们的。**它正是用于在 commit 阶段遍历的节点集**

> 出于调试目的，current 树可以通过 fiber root 的 current 属性访问。finishedWork 树可以通过 current 树中的 HostFiber 节点的 alternate 属性访问

在 commit 阶段运行的主要函数是 [commitRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L523)。基本上，它执行以下操作：

- 在标记有 Snapshot 效果(effect)的节点上调用 getSnapshotBeforeUpdate 生命周期方法
- 在标记有 Deletion 效果(effect)的节点上调用 componentWillUnmount 生命周期方法
- 执行所有的 DOM 插入、更新和删除操作
- 将 finishedWork 树设置为 current tree
- 在标记有 Placement 效果(effect)的节点上调用 componentDidMount 生命周期方法
- 在标记有 Update 效果(effect)的节点上调用 componentDidUpdate 生命周期方法

在更新前(pre-mutation)调用 getSnapshotBeforeUpdate 方法之后 ，React 会在树中 commit 所有副作用(side-effects)。它分两部分完成。第一部分执行所有 DOM（host）插入、更新、删除和卸载 ref。然后 React 将 finishedWork 树分配给 FiberRoot，将 workInProgress 树标记为 current 树。这是在 commit 阶段的第一部分之后完成的，因此前一棵树(previous tree)在 componentWillUnmount 期间仍然是当前的，但在第二遍之前，在 componentDidMount/Update 期间，finishedWork 树已经被设置为当前的 current tree。在第二部分中，React 调用所有其他生命周期方法和 ref 回调。这些方法作为单独的部分执行，至此整个树中的所有替换、更新和删除都已被调用。

> 译者注：这里有点拗口。在执行 commit 阶段的第一部分前，当前的有两棵树，一颗 current 树，一棵 finishedWork 树。在我们调用组件的 componentWillUnmount 方法期间，current 树此时还没改变。但是 commit 阶段第一部分执行完成后，finishedWork 树就变成了 current 树，因此在我们调用组件的 componentDidMount/Update 期间，此时的 current 树就已经被设置为 finishedWork 树，具体可以看下面函数的要点加以理解

下面是运行上述步骤的函数的要点：

```jsx
function commitRoot(root, finishedWork) {
  commitBeforeMutationLifecycles();
  commitAllHostEffects();
  root.current = finishedWork;
  commitAllLifeCycles();
}
```

> 译者注：注意 root.current = finishedWork;的时机

每一个子函数都实现了一个循环，遍历效果列表(the list of effects)并检查效果(effects)的类型(type)。当它找到与函数功能匹配的效果(effect)时，它会应用它。

#### 更新前的生命周期方法(Pre-mutation lifecycle methods)

例如，下面是遍历效果列表(effect list)并检查节点是否具有 Snapshot 效果(effect)的代码：

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

#### DOM 更新(DOM updates)

[commitAllHostEffects](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L376) 是 React 执行 DOM 更新的函数。该函数基本上定义了需要对节点执行的操作类型并执行它：

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

有趣的是，在 commitDeletion 函数中，React 将调用 componentWillUnmount 方法作为删除过程的一部分

#### 更新后的生命周期方法(Post-mutation lifecycle method)

[commitAllLifecycles](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L465) 函数是 React 调用所有剩余的 componentDidUpdate 和 componentDidMount 生命周期方法的地方

我们终于完成了。让我知道你对这篇文章的看法或在评论中提问。**可以点击查看本系列的下一篇文章：[In-depth explanation of state and props update in React](https://indepth.dev/in-depth-explanation-of-state-and-props-update-in-react/)**。我还有更多的文章正在编写中，深入解读 scheduler、子元素协调过程(children reconciliation process)、以及如何构建副作用列表(effects list)。我还计划录制一个视频，在其中我将展示如何使用本文作为基础来调试应用程序。

### 原文链接

- [Inside Fiber: in-depth overview of the new reconciliation algorithm in React](https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react)

### 读后总结核心知识点

- Virtual DOM。render 方法返回的不可变的 React elements tree。注意是不可改变的。
- current tree。当前界面对应的 fiber tree。
- workInProgress tree。React 开始处理更新时，构建的树
- alternate 节点。每个 fiber 节点都有一个 alternate 字段引用旧的 fiber 树上的节点。current 树中的节点指向 workInProgress 树中的节点，反之亦然。需要搞清楚 alternate 节点都有哪些属性，current 树中的节点如何指向 workInProgress 树
- 副作用。改变 DOM 或调用生命周期方法都应该被视为副作用
- 副作用列表。自底向上构建的线性链表。使用 nextEffect 属性相连接
- FiberRootNode。React 为每个容器创建的节点，里面有 current 和 finishWork 属性。可以通过 `root._reactRootContainer._internalRoot` 访问这个节点。
- render 阶段的结果是一个标有副作用的 fiber 节点树
- commit 阶段遍历副作用列表并执行 DOM 更新和调用生命周期方法等工作

#### render 阶段

render 阶段从 renderRoot 函数开始，从最顶层的 HostRoot Fiber 节点开始遍历，会快速跳过已处理的节点，直到到达调用了 setState 方法的组件。

```js
function workLoop(isYieldy) {
  if (!isYieldy) {
    while (nextUnitOfWork !== null) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  } else {...}
}
```

- performUnitOfWork
- beginWork
- completeUnitOfWork
- completeWork

```js
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

render 阶段调用的生命周期方法：

- [UNSAFE_]componentWillMount (deprecated)
- [UNSAFE_]componentWillReceiveProps (deprecated)
- getDerivedStateFromProps
- shouldComponentUpdate
- [UNSAFE_]componentWillUpdate (deprecated)
- render

#### commit 阶段

commit 阶段从[completeRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L2306)函数开始。进入这个阶段，React 就会有一棵 current tree 和 一棵 finishedWork tree(或者 workInProgress tree)，以及一个副作用列表

在 commit 阶段运行的主要函数是 commitRoot。基本上，它执行以下操作：

- 在标记有 Snapshot 效果(effect)的节点上调用 getSnapshotBeforeUpdate 生命周期方法
- 在标记有 Deletion 效果(effect)的节点上调用 componentWillUnmount 生命周期方法
- 执行所有的 DOM 插入、更新和删除操作
- 将 finishedWork 树设置为 current tree
- 在标记有 Placement 效果(effect)的节点上调用 componentDidMount 生命周期方法
- 在标记有 Update 效果(effect)的节点上调用 componentDidUpdate 生命周期方法

```js
function commitRoot(root, finishedWork) {
  commitBeforeMutationLifecycles();
  commitAllHostEffects(); // 执行dom更新
  root.current = finishedWork;
  commitAllLifeCycles();
}
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
