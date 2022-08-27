> 这篇文章介绍了 react 中 context 的实现原理，以及 context 变化时，React 如何查找所有订阅了 context 的组件并跳过 shouldComponentUpdate 强制更新。可以让我们更加充分认识到 context 的性能瓶颈并能够合理设计全局状态管理。

## 学习目标

- React Context 的实现原理
- 订阅了 context 的组件是如何跳过`shouldComponentUpdate`强制 render 的
- React 是如何使用堆栈来存储 Provider 的 value 以支持嵌套 Provider 的
- context 的存取发生在 React 渲染的哪些阶段
- fiber.dependencies 用于保存当前组件订阅的 context 依赖，一般情况下组件只有一个 context 依赖。但是通过 useContext 订阅多个 context 时，fiber.dependencies 就是一个链表

## 前言

先来简单回顾一下，React 的渲染分为两大阶段，五小阶段：

- render 阶段
  - beginWork
  - completeUnitOfWork
- commit 阶段。
  - commitBeforeMutationEffects
  - commitMutationEffects
  - commitLayoutEffects

在 render 阶段，React 为每一个 fiber 节点调用 beginWork 开始执行工作，如果 fiber 没有子节点或者子节点都已经完成了工作，那么这个 fiber 就可以调用 completeUnitOfWork 完成自身的工作，这个过程就是深度优先遍历，具体可以看这篇文章[深入概述 React 初次渲染及状态更新主流程](https://github.com/lizuncong/mini-react/blob/master/docs/render/%E6%B7%B1%E5%85%A5%E6%A6%82%E8%BF%B0%20React%E5%88%9D%E6%AC%A1%E6%B8%B2%E6%9F%93%E5%8F%8A%E7%8A%B6%E6%80%81%E6%9B%B4%E6%96%B0%E4%B8%BB%E6%B5%81%E7%A8%8B.md)。我们可以将进入节点的过程理解为 beginWork，离开节点的过程叫 completeUnitOfWork。

beginWork 阶段主要是协调子元素，也就是常说的 dom diff。在这个阶段，React 会调用类组件的 render 方法或者执行函数组件。**context 的存取就是作用于 beginWork 阶段。**在 beginWork 阶段，如果当前组件订阅了 context，则从 context 中读取 value 值。

context 提供了一种存取全局共享数据的方式

## Context API 简介

React 提供的与 Context 相关的 API，按用途可以划分如下：

- 创建 context: React.createContext
- 提供 context 值: Context.Provider
- 订阅 context 值：
  - Class.contextType。用于类组件订阅 Context
  - Context.Consumer。用于函数组件订阅 Context，这种方式也可以间接的订阅多个 context
  - useContext。用于函数组件订阅 Context，唯一的订阅多个 context 的 api。通过 useContext 订阅多个 context 时，函数组件的 fiber.dependencies 就是一个链表

下面逐一介绍每个 API 的原理

## React.createContext

createContext 负责创建一个 context 对象，包含 Provider 和 Consumer 属性，其中 \_currentValue 用于存储全局共享状态，订阅了 context 的组件都是从 context.\_currentValue 中读取最新值的

```js
var symbolFor = Symbol.for;
const REACT_CONTEXT_TYPE = symbolFor("react.context");
const REACT_PROVIDER_TYPE = symbolFor("react.provider");
function createContext(defaultValue) {
  var context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null,
  };
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context,
  };
  context.Consumer = {
    $$typeof: REACT_CONTEXT_TYPE,
    _context: context,
  };

  return context;
}
const context = createContext({ count: 0 });
console.log("context....", context);
```

## Context.Provider

Provider 有三个特性：

- 如果没有对应的 Provider，那么消费组件将读取 context 的默认值，即传递给 createContext 的 defaultValue
- 多个 Provider 可以嵌套使用，里层的会覆盖外层的数据
- Provider 的 value 值发生变化时，它内部的所有消费组件都会跳过 shouldComponentUpdate 强制更新

在介绍 Provider 的源码实现前，我们思考一下，如果让我们设计一个类似 Provider 的 API，如何设计才能满足前面两个特性？（第三个特性机制较复杂，后面会详细介绍）

### 特性 1：Context 默认值的读取

如果没有对应的 Provider，那么消费组件将读取 context 的默认值，即传递给 createContext 的 defaultValue

注意，useContext(CounterContext)等价于 CounterContext.\_currentValue，为了减少干扰方便演示，这里我直接使用 CounterContext.\_currentValue 替代 useContext

```jsx
const CounterContext = React.createContext(-1);

const Counter = () => {
  // const context = useContext(CounterContext);
  const context = CounterContext._currentValue;
  return <div>{context}</div>;
};
class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <Counter />;
  }
}
```

由于没有 Provider，Counter 将读取 context 的默认值，即页面显示-1。但如果我们用 Provider 包裹一下：

```jsx
render() {
  return (
    <CounterContext.Provider value={1}>
      <Counter />
    </CounterContext.Provider>
  );
}
```

由于有 Provider，Counter 将读取 Provider 的 value 值，即页面显示 1。

在调用 React.createContext 创建 context 时，context.\_currentValue 的值保存的就是默认值。因此，如果没有 CounterContext.Provider 时，Counter 可以通过 context.\_currentValue 读取到默认值。

同理，如果有 CounterContext.Provider 包裹 Counter 组件时，我们只需要将 Provider 的 value 值保存到 context.\_currentValue 中就能让 Counter 读取到。

在 render 阶段，CounterContext.Provider 开始 beginWork 时，我们可以将 CounterContext.\_currentValue 设置为新的 value 值。这样在后续的渲染阶段，Counter 就能够通过 CounterContext.\_currentValue 读取到 Provider 最新的 value 值。我们似乎已经满足了第一个特性

```js
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      CounterContext._currentValue = workInProgress.pendingProps.value;
  }
}
```

但考虑到下面的案例

```jsx
render() {
  return [
    <CounterContext.Provider value={1}>
      <Counter />
    </CounterContext.Provider>,
    <Counter />,
  ];
}
```

第二个 Counter 由于没有 Provider，理论上它要读取 context 的默认值。但是我们在 beginWork 时，已经将 CounterContext.\_currentValue 修改成最新的值了，第二个 Counter 读取到的也将是最新的值，而不是默认值。我们需要修改一下 beginWork 的逻辑

```js
let valueCursor;
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      valueCursor = CounterContext._currentValue; // 先将旧值保存起来
      CounterContext._currentValue = workInProgress.pendingProps.value; // pendingProps保存的是新值
  }
}
```

我们声明一个全局变量，将旧值保存起来，然后再将 CounterContext.\_currentValue 设置成新的 value 值。那么问题来了，我们应该在哪个阶段将 CounterContext.\_currentValue 的值恢复成旧值？

> 在前面介绍过，React 在遍历 fiber 树时，进入节点时会调用 beginWork 方法开始工作，离开节点时会调用 completeUnitOfWork 完成工作。因此我们可以在离开 fiber 节点时，将 context.\_currentValue 恢复成旧值

completeUnitOfWork 内部调用 completeWork 完成工作，大概如下：

```js
function completeWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      // 在离开Provider节点时，将context._currentValue恢复成旧值
      const oldValue = valueCursor;
      CounterContext._currentValue = oldValue;
      return null;
  }
}
```

### 特性 2：多个相同 Provider 可以嵌套使用，里层的会覆盖外层的数据

我们自己设计的 api 已经能够满足 Provider 的第一个特性了，我们在进入 Provider fiber 节点时，将当前的 context.\_currentValue 值保存起来，然后再将 Provider 新的 value 值保存在 context.\_currentValue 中，这样 Provider 内部的所有组件都能够通过 context.\_currentValue 读取到最新的值。然后在离开 Provider fiber 节点时，我们将 context.\_currentValue 恢复成旧值。

现在让我们考虑下面多个 Provider 嵌套的场景：

```jsx
render() {
  return [
    <CounterContext.Provider id="provider1" value={1}>
      <CounterContext.Provider id="provider2" value={2}>
        <Counter id="counter1" />
      </CounterContext.Provider>
      <Counter id="counter2" />
    </CounterContext.Provider>,
    <Counter id="counter3" />,
  ];
}
```

根据 Provider 里层覆盖外层值的特性：

- `counter1`读取的是`provider2`的 value 值，即 2
- `counter2`读取的是`provider1`的 value 值，即 1
- `counter3`由于没有 Provider 包裹，因此读取的是 context 的默认值，即-1

页面显示 2，1，-1。

**同时，我们必须要理解的一点是，`provider1`和`provider2`虽然是两个组件，但他们的 context 是同一个引用，三个 Counter 组件都是从 context.\_currentValue 中读取的值**

显然我们在前面设计的 api 满足不了这种场景，为了能实现嵌套的机制，我们遵循 React 遍历 fiber 节点的顺序，来看下这个思路：

- 在进入`provider1`时，将当前 context.\_currentValue 的值(记为`oldValue1`)保存起来，然后将`provider1`新的 value 值赋值给 context.\_currentValue
- React 继续遍历`provider2`，进入`provider2`时，我们又需要将当前 context.\_currentValue 的值(记为`oldValue2`)保存起来，然后将`provider2`新的 value 值赋值给 context.\_currentValue
- React 继续遍历`counter1`，`counter1`读取 context.\_currentValue 的值，就是`provider2`的 value 值。遍历完`counter1`后，就可以调用 completeUnitOfWork 完成工作
- 当为`provider2`完成工作时，即离开`provider2`时，我们需要将 context.\_currentValue 的值恢复成`provider1`的 value 值，即`oldValue2`
- 开始遍历 counter2，此时 counter2 通过 context.\_currentValue 读取到的就是 provider1 的 value 值
- 当为`provider1`完成工作时，即离开`provider1`时，我们需要将 context.\_currentValue 的值恢复成默认值，即`oldValue1`

看上去这个思路行得通，我们只需要多声明几个全局变量保存 context 的当前值就可以了

```js
let valueCursor1; // 保存oldValue1
let valueCursor2; // 保存oldValue2
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      if (workInProgress.id === "provider1") {
        valueCursor1 = CounterContext._currentValue; // 进入provider1时，将CounterContext的当前值保存起来，此时是默认值
        CounterContext._currentValue = workInProgress.pendingProps.value; //将provider1新的value值赋值给CounterContext._currentValue
      }
      if (workInProgress.id === "provider2") {
        valueCursor2 = CounterContext._currentValue; // 进入provider2时，将CounterContext的当前值保存起来，此时是provider1的value值
        CounterContext._currentValue = workInProgress.pendingProps.value; //将provider2新的value值赋值给CounterContext._currentValue
      }
  }
}
function completeWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      if (workInProgress.id === "provider2") {
        CounterContext._currentValue = valueCursor2; // 离开provider2节点时，需要将context._currentValue恢复成provider1的value值
      }
      if (workInProgress.id === "provider1") {
        CounterContext._currentValue = valueCursor1; // 离开provider1节点时，需要将context._currentValue恢复成默认值
      }

      return null;
  }
}
```

似乎这个实现思路已经满足两个 provider 的嵌套，如果有代码洁癖的同学会发现，valueCursor1，valueCursor2，以及 if 判断不太友好。同时，最重要的是，我们无法满足更多层级的 provider 的嵌套：

```jsx
  render() {
    return [
      <CounterContext.Provider id="provider1" value={1}>
        <CounterContext.Provider id="provider2" value={2}>
          <CounterContext.Provider id="provider3" value={3}>
            <CounterContext.Provider id="provider4" value={4}>
              <Counter id="counter1" />
            </CounterContext.Provider>
          </CounterContext.Provider>
        </CounterContext.Provider>
        <Counter id="counter2" />
      </CounterContext.Provider>,
      <Counter id="counter3" />,
    ];
  }
```

如果按照我们的做法，得声明好几个变量保存当前值，然后我们又无法确定有多少层级根本无法提前声明这些变量。看到这里，fiber 节点进进出出的很容易让我们想到堆栈，我们可以使用栈来保存当前的 context 值

```js
let valueStack = [];
let index = -1;
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider: {
      var context = workInProgress.type._context;
      index++;
      valueStack[index] = context._currentValue; // 先将context当前的值保存起来
      context._currentValue = workInProgress.pendingProps.value; // 然后将provider新的value值赋值给context._currentValue
    }
  }
}
function completeWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider: {
      const preValue = valueStack[index];
      valueStack[index] = null;
      index--;
      var context = providerFiber.type._context;
      context._currentValue = preValue;
    }
  }
}
```

这个版本的实现已经可以满足嵌套任意层的 Provider 了，同时还能满足不同的 Provider 组件嵌套，比如：

```jsx
render() {
  return [
    <CounterContext.Provider id="provider1" value={1}>
      <UserContext.Provider id="userprovider1" value={"mike"}>
        <Counter id="counter1" />
      </UserContext.Provider>
    </CounterContext.Provider>,
  ];
}
```

实际上，这正是 React 所采用的实现方式，这种方式既能满足读取默认值的特性，又能满足里层的 Provider 覆盖外层的 Provider 的场景(指的是相同的 Provider 的覆盖)

### Context.Provider 源码实现

在 render 阶段，React 进入 Provider 类型的 fiber 节点时，beginWork 会调用`updateContextProvider`函数为 Provider 类型的节点执行工作，主要逻辑如下：

- 调用 pushProvider，将 context.\_currentValue 保存到 valueStack 栈中。然后将 context.\_currentValue 设置成 Provider 新的 value 值
- 使用浅比较判断 Context.Provider 的新旧 value 值是否发生了改变，如果发生了改变，则调用 propagateContextChange 找出所有订阅了这个 context 的组件，然后跳过 shouldComponenentUpdate 强制更新。查找算法放在后面单独一节介绍

在 completeWork 阶段，Provider 类型的 fiber 节点执行的主要工作有一点：

- 调用 popProvider 将 context.\_current 恢复成上一个值，即直接从 valueStack 取出第一项即可

```js
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ContextProvider:
      return updateContextProvider(current, workInProgress, renderLanes);
  }
}
function completeWork(current, workInProgress, renderLanes) {
  var newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case ContextProvider:
      popProvider(workInProgress);
      return null;
  }
}
var valueCursor = { current: null };
var valueStack = [];
var index = -1;
function pushProvider(providerFiber, nextValue) {
  var context = providerFiber.type._context;
  index++;
  valueStack[index] = valueCursor.current;
  valueCursor.current = context._currentValue;
  context._currentValue = nextValue;
}
function updateContextProvider(current, workInProgress, renderLanes) {
  var context = workInProgress.type._context; // React.createContext的返回值
  var newProps = workInProgress.pendingProps;
  var oldProps = workInProgress.memoizedProps;
  var newValue = newProps.value;

  pushProvider(workInProgress, newValue);

  if (oldProps !== null) {
    var oldValue = oldProps.value;
    var changedBits = newValue === oldValue;
    if (changedBits === 0) {
      if (oldProps.children === newProps.children && !hasContextChanged()) {
        // 没有改变
        return bailoutOnAlreadyFinishedWork(
          current,
          workInProgress,
          renderLanes
        );
      }
    } else {
      // context变了，遍历Provider所有的子孙fiber节点，查找订阅了该context的组件并标记为强制更新
      propagateContextChange(workInProgress, context, changedBits, renderLanes);
    }
  }

  var newChildren = newProps.children;
  reconcileChildren(current, workInProgress, newChildren, renderLanes);
  return workInProgress.child;
}

function popProvider(providerFiber) {
  var currentValue = valueCursor.current;
  pop(valueCursor);
  var context = providerFiber.type._context;
  context._currentValue = currentValue;
}
```

## 消费组件如何读取 Context 的值？

React 提供了三种方式读取 Context 的值：

- Class.contextType。用于类组件订阅 Context
- Context.Consumer。用于函数组件订阅 Context
- useContext。用于函数组件订阅 Context

以上三种方式，都是需要手动传递 context 对象的，比如 useContext(context)，Class.contextType = context。

对于函数组件，useContext 本质上就是调的`readContext`函数，即我们可以直接认为`useContext === readContext`，readContext 返回 context.\_currentValue

对于类组件，React 会判断类组件上是否有静态属性 contextType，如果有，则调用 `readContext` 读取 context 值，并赋值给类实例的 context 属性

```js
prepareToReadContext(workInProgress, renderLanes);
const ctor = workInProgress.type;
const instance = new ctor();
const contextType = ctor.contextType;
if (typeof contextType === "object" && contextType !== null) {
  instance.context = readContext(contextType);
}
```

对于 Context.Consumer，context 本身就存在 Consumer 里面

```js
var context = workInProgress.type;
var newProps = workInProgress.pendingProps;
var render = newProps.children;
prepareToReadContext(workInProgress, renderLanes);
var newValue = readContext(context, newProps.unstable_observedBits);
var newChildren = render(newValue);
```

这三种方式在读取 context 时都要进行两个操作：

- 在读取 context 前，都需要先调用`prepareToReadContext`进行准备工作，重置几个和 contex 有关的全局变量，以及判断 context 的 value 是否变更了
- 都是调用 readContext 方法读取 context 值，readContext 方法返回 context.\_currentValue 的值

`prepareToReadContext`主要逻辑如下：

- 将全局变量 currentlyRenderingFiber 设置为当前正在工作的 fiber，在 readContext 时可以通过这个全局变量拿到正在工作中的 fiber
- 将全局变量 lastContextWithAllBitsObserved 重置为 null，这个变量在 readContext 函数中会被设置成 context 对象
- 全局变量 lastContextDependency 在通过 useContext 订阅多个不同的 context 时，用于构造 dependencies 列表
- 重置 fiber dependencies 列表

```js
function prepareToReadContext(workInProgress, renderLanes) {
  currentlyRenderingFiber = workInProgress;
  lastContextDependency = null;
  lastContextWithAllBitsObserved = null; // 这个全局变量保存的是context对象
  var dependencies = workInProgress.dependencies;

  if (dependencies !== null) {
    var firstContext = dependencies.firstContext;

    if (firstContext !== null) {
      if (includesSomeLane(dependencies.lanes, renderLanes)) {
        // Context list has a pending update. Mark that this fiber performed work.
        didReceiveUpdate = true;
      } // Reset the work-in-progress list
      // 重置fiber context依赖
      dependencies.firstContext = null;
    }
  }
}
```

### readContext 读取 context 最新值

context 本质上就是一个全局变量，我们完全可以在函数组件或者类组件中通过`context._currentValue`直接访问 context 值，比如：

```js
const Counter = () => {
  return <div>{CounterContext._currentValue}</div>;
};
```

不信你可以在代码中试试。虽然我们可以直接读取值，但是直接读取值无法解决下面两个问题：

- context 的值变了，如何通知所有读取 context 的组件强制刷新？
- 怎么知道哪些组件订阅了 context？

也正是为了解决全局变量的这两个问题，React 使用 Provider 显示声明全局状态，使用 useContext 或者 contextType 显示使用全局状态。React 通过在 useContext 或者 contextType 中读取全局状态时，会将 context 的信息存储在消费组件的 fiber.dependencies 中，然后 Provider 会判断 value 值是否改变，如果改变，则查找内部所有订阅了这个 context 的消费组件并强制更新

**这也是为什么 React 会引入 Provider 和 useContext、contextType 的根本原理**

下面我们看看 readContext 的逻辑，**readContext 的一个主要目标就是收集组件依赖的所有不同的 context，如果组件订阅了 context，则将 context 添加到 fiber.dependencies 链表中**，比如

```jsx
const CounterContext = React.createContext(-1);
const UserContext = React.createContext("mike");

const Counter = () => {
  const context = useContext(CounterContext);
  const context2 = useContext(CounterContext);
  const usercontext = useContext(UserContext);

  return (
    <div>
      {context}
      {usercontext}
    </div>
  );
};
```

这个例子中，虽然我们调用了三次 useContext，但是 context 和 contex2 是同一个 context，React 认为 Counter 组件订阅了两个 context，而不是三个，因此将这两个 context 添加到 fiber 的 dependencies 依赖链表中，最终，fiber.dependencies 长这样：

```js
fiber.dependencies = {
  lanes,
  firstContext: {
    context: CounterContext,
    next: {
      context: UserContext,
      next: null,
    },
  },
  responders,
};
```

readContext 收集依赖的算法如下，首先判断 `lastContextWithAllBitsObserved === context`，如果相等，说明是同一个 context，这种判断是为了防止重复添加依赖。如果不等，则将 lastContextWithAllBitsObserved 设置为 context，并将 context 添加到 fiber.dependencies 链表末尾

```js
function readContext(context, observedBits) {
  if (lastContextWithAllBitsObserved === context) {
  } else {
    lastContextWithAllBitsObserved = context;
    var resolvedObservedBits = MAX_SIGNED_31_BIT_INT;

    var contextItem = {
      context: context,
      observedBits: resolvedObservedBits,
      next: null,
    };

    if (lastContextDependency === null) {
      // 这是第一个依赖
      lastContextDependency = contextItem;
      currentlyRenderingFiber.dependencies = {
        lanes: NoLanes,
        firstContext: contextItem,
        responders: null,
      };
    } else {
      // 添加到dependencies表尾
      lastContextDependency = lastContextDependency.next = contextItem;
    }
  }

  return context._currentValue;
}
```

以上面的例子为例介绍 context 的读取过程

render 阶段进入 Counter 节点时开始调用 beginWork 执行工作，在读取 context 前，调用 prepareToReadContext 进行一些准备工作，比如：

```js
currentlyRenderingFiber = workInProgress;
lastContextDependency = null;
lastContextWithAllBitsObserved = null;
```

然后开始调用 readContext 读取 context 的\_currentValue 值，步骤如下

- 首先调用 const context = useContext(CounterContext)，由于此时的 lastContextWithAllBitsObserved 为 null，lastContextWithAllBitsObserved !== context，因此将这个 context 添加到 fiber 的 dependencies 链表中。同时 lastContextDependency 指针指向表尾，目前链表只有一个 context 依赖
- 然后调用 const context2 = useContext(CounterContext)再次读取 CounterContext，由于此时的 lastContextWithAllBitsObserved === CounterContext，说明 CounterContext 已经被添加到 fiber.dependencies 链表中了，不必重复添加，直接返回 CounterContext.\_currentValue
- 最后调用 const usercontext = useContext(UserContext)，发现 lastContextWithAllBitsObserved !== UserContext，说明 UserContext 还没添加到 fiber.dependencies 链表中，因此添加进去即可

## Context.Provider value 变化，React 如何强制更新？

Provider 的 value 值变化时，其内部所有订阅了这个 context 的组件都会强制更新。

```jsx
<CounterContext.Provider id="provider1" value={this.state.count}>
  <CounterContext.Provider id="provider2" value="2">
    <Counter />
  </CounterContext.Provider>
</CounterContext.Provider>
```

比如在这个例子中，有两个嵌套的 CounterContext.Provider，但是 Counter 组件只会读取最里层的 Provider，即`provider2`的 value 值。即使`provider1`的 value 发生变化，也不会影响到 Counter 组件。`provider2`的 value 值发生变化时，才会强制 Counter 更新。

Provider 的 value 值变化时，React 会遍历 Provider 内部所有的 fiber 节点，然后查看其 fiber.dependencies，如果 dependencies 中存在一个 context 和当前 Provider 的 context 相等，那说明这个组件订阅了当前的 Provider 的 context，需要将其标记为强制更新

下面的 demo 演示了 React 跳过 sCU 更新消费组件的场景：

```jsx
const CounterContext = React.createContext({
  count: 0,
  addCount: () => {},
});

class Counter extends React.Component {
  static contextType = CounterContext;
  shouldComponentUpdate() {
    return false;
  }
  render() {
    console.log("Counter render");
    return (
      <button id="counter" onClick={this.context.addCount}>
        {this.context.count}
      </button>
    );
  }
}

class CounterWrap extends React.Component {
  render() {
    console.log("CounterWrap render，控制台只会输出一次");
    return <Counter />;
  }
}

class NeverUpdate extends React.Component {
  render() {
    console.log("NeverUpdate render，控制台只会输出一次");
    return <div>永远不会更新</div>;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    console.log("App render，控制台只会输出一次");
    return [<CounterWrap />, <NeverUpdate />];
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.addCount = () => {
      console.log("点击按钮触发更新", this.state.count + 1);
      this.setState({
        count: this.state.count + 1,
      });
    };
    this.state = {
      count: 0,
      addCount: this.addCount,
    };
  }

  render() {
    console.log("Home render");
    return (
      <CounterContext.Provider value={this.state}>
        <App />
      </CounterContext.Provider>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
```

- App 组件的 shouldComponentUpdate 永远返回 false，理论上 App 组件以及它的所有子组件的 render 在更新的过程中都不会执行，即不会更新。
- Counter 组件的 shouldComponentUpdate 永远返回 false，理论上 Counter 也不会更新

但是我们点击按钮，观察控制台可以发现：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/context-01.jpg)

- 第一次渲染时，所有组件都会更新，组件的 render 方法都被执行
- 在随后的点击过程中，只有 Home 组件以及订阅了 Context 的 Counter 组件更新了，它们对应的 render 方法执行

Home 的更新很容易理解，因为点击按钮触发了它的 state 更新，**那么 Counter 组件是如何跳过父组件 App 以及其自身的 shouldComponentUpdate 强制更新的？**我们稍后再回答这个问题

前面介绍过在`updateContextProvider`方法中，使用浅比较判断 Provider 的 value 是否变化，如果变化，则调用`propagateContextChange`查找所有订阅了这个 context 的组件

### propagateContextChange 查找算法

以下面的代码为例：

```jsx
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 1,
    };
  }

  render() {
    return [
      <CounterContext.Provider id="provider1" value={this.state.count + 1}>
        <div id="wrap">
          <CounterContext.Provider id="provider2" value={2}>
            <Counter id="counter1" />
          </CounterContext.Provider>
          <UserContext.Provider id="userprovider1" value="mike">
            <Counter id="counter2" />
          </UserContext.Provider>
        </div>
        <Counter id="counter3" />
      </CounterContext.Provider>,
      <button
        onClick={() => {
          this.setState({
            count: this.state.count + 1,
          });
        }}
      >
        click
      </button>,
    ];
  }
}
```

当点击按钮触发更新时，`provider1`的 value 发生变更，因此调用`propagateContextChange`开始查找所有订阅了`provider1`的 context 的 fiber 节点，按以下顺序：

- 首先是 `div#wrap`，由于它没有订阅了 CounterContext，因此没有任何操作，继续遍历它的子节点
- 由于 `provider2` 和 `provider1` 是同一个 context，因此不需要继续遍历`provider2`内部的子节点。

  > 前面介绍过，在嵌套的相同的 Provider 中，里层的会覆盖外层的，因此外层的 Provider 的 value 变化，不会影响到消费组件。只有最里层的 Provider 的 value 变化才会强制消费组件更新。因此就没必要再继续遍历`provider2`内部的所有节点了。

- 继续遍历 `userprovider1`，没有订阅 CounterContext，因此继续遍历`couter2`，发现`counter2`订阅了 CounterContext，因此将其标记为更新
  - 如果 counter2 是类组件，那么会创建一个更新对象 update，并将 update.tag 标记为强制更新
- 继续遍历 counter3，发现 counter3 也订阅了 CounterContext

如果找到订阅了 context 的消费组件，则将其 fiber.lane 标记为更新，然后合并到父节点。

比如在我们上面那个例子中，Counter 需要更新，但是 App、CounterWrap、NeverUpdate 都不需要更新，因此这三个 fiber 节点在 beginWork 阶段会直接跳过，然后更新 Counter 组件。

至于怎么标记更新，这涉及到 fiber lane 的知识，就不在本节的讨论范围

**可以发现，当有 Provider 的 value 发生变化时，React 会遍历这个 Provider 内部所有的 fiber 节点，找出订阅了这个 Provider 的 context 的 fiber 节点。这个查找的过程也是挺耗时的，特别是组件层级很深时**

最后，propagateContextChange 查找算法如下：

```js
function propagateContextChange(
  workInProgress,
  context,
  changedBits,
  renderLanes
) {
  var fiber = workInProgress.child;

  while (fiber !== null) {
    var nextFiber = void 0; // Visit this fiber.

    var list = fiber.dependencies;
    // 首先判断这个fiber是否有dependencies，如果没有，说明这个fiber没有订阅任何context
    if (list !== null) {
      nextFiber = fiber.child;
      var dependency = list.firstContext;
      // 如果这个fiber有订阅context，则判断是否是当前Provider的context
      while (dependency !== null) {
        // 检查context是否匹配
        if (
          dependency.context === context &&
          (dependency.observedBits & changedBits) !== 0
        ) {
          // 匹配到了context，说明这个组件订阅了当前Provider的context，我们需要给这个fiber调度更新
          if (fiber.tag === ClassComponent) {
            // 如果是类组件，则创建一个更新对象update，并标记为强制更新
            var update = createUpdate(
              NoTimestamp,
              pickArbitraryLane(renderLanes)
            );
            update.tag = ForceUpdate;
            // 添加到更新队列
            enqueueUpdate(fiber, update);
          }

          fiber.lanes = mergeLanes(fiber.lanes, renderLanes);
          var alternate = fiber.alternate;

          if (alternate !== null) {
            alternate.lanes = mergeLanes(alternate.lanes, renderLanes);
          }

          scheduleWorkOnParentPath(fiber.return, renderLanes);

          list.lanes = mergeLanes(list.lanes, renderLanes);

          break;
        }

        dependency = dependency.next;
      }
    } else if (fiber.tag === ContextProvider) {
      // 如果是相同的Provider，则不用继续遍历了，因为相同的嵌套的Provider，内部的消费组件取最里层的，外层的Provider变化
      // 和里面的消费组件没啥关系
      nextFiber = fiber.type === workInProgress.type ? null : fiber.child;
    } else {
      // 继续遍历子节点
      nextFiber = fiber.child;
    }

    if (nextFiber === null) {
      // 没有子节点，则继续遍历兄弟节点
      nextFiber = fiber;

      while (nextFiber !== null) {
        if (nextFiber === workInProgress) {
          // 所有fiber节点已经遍历完成，退出
          nextFiber = null;
          break;
        }

        var sibling = nextFiber.sibling;

        if (sibling !== null) {
          nextFiber = sibling;
          break;
        }
        // 如果没有兄弟节点，则查找父节点的兄弟节点
        nextFiber = nextFiber.return;
      }
    }

    fiber = nextFiber;
  }
}
```

### beginWork 强制更新消费组件

在 propagateContextChange 方法中已经找到并标记了消费组件强制更新，那在 beginWork 阶段，react 怎么判断组件要不要更新？

在更新阶段，React 会判断 workInProgress.lanes 和 renderLanes，如果两者不同，说明当前 fiber 不需要更新，调用`bailoutOnAlreadyFinishedWork`退出。如果两者相同，说明需要更新，则继续执行 beginWork 的逻辑。

beginWork 的判断逻辑如下：

```js
function beginWork(current, workInProgress, renderLanes) {
  var updateLanes = workInProgress.lanes;
  // 在执行beginWork的逻辑前，需要判断当前fiber是否需要更新
  // current为null，说明这个fiber第一次渲染。如果不为null说明是更新阶段
  if (current !== null) {
    var oldProps = current.memoizedProps;
    var newProps = workInProgress.pendingProps;

    if (oldProps !== newProps) {
      // 如果props变更了，将fiber标记为需要更新，即设置didReceiveUpdate为true
      didReceiveUpdate = true;
    } else if (!includesSomeLane(renderLanes, updateLanes)) {
      didReceiveUpdate = false;
      // 当前fiber没有工作，因此提前退出，不需要进入beginWork阶段

      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    } else {
      // 当前fiber需要被调度更新，但是props没有变化。设置为false。如果fiber的update queue或者context
      // consumer发生了变化，didReceiveUpdate将被设置为true
      didReceiveUpdate = false;
    }
  } else {
    didReceiveUpdate = false;
  }

  workInProgress.lanes = NoLanes;
  // 开始执行beginWork的逻辑
  switch (workInProgress.tag) {
  }
}
```

bailoutOnAlreadyFinishedWork 会通过 workInProgress.childLanes 判断当前 fiber 节点的子节点需不需要更新，如果不需要更新，则返回 null，即 beginWork 阶段返回 null，说明当前 fiber 节点可以完成工作了。

如果子节点需要更新，则调用 cloneChildFibers 复用旧的子节点，然后对子节点继续执行 beginWork 开始工作

```js
function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes) {
  if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
    // 通过childLanes判断子节点是否有工作，如果没有，则直接返回null
    return null;
  } else {
    // 这个fiber没有工作，但是它的子节点有工作，复制子节点并继续执行beginWork
    cloneChildFibers(current, workInProgress);
    return workInProgress.child;
  }
}
```

#### 类组件强制更新流程

在 updateClassComponent 中会调用 updateClassInstance 判断组件是否应该更新。在 updateClassInstance 中会判断全局变量 hasForceUpdate 或者组件的 shouldComponentUpdate 的返回值。

这里最关键的是 hasForceUpdate 变量。前面 propagateContextChange 说过，如果类组件订阅了 context，那么会给类组件的 fiber 创建一个 update 对象，并将 update.tag 标记为 ForceUpdate，然后在 processUpdateQueue 处理 update 时，发现 tag 为 ForceUpdate，则将全局变量 hasForceUpdate 设置为 true。这就是 context 发生变化，订阅了 context 的类组件能够跳过 sCU 强制更新的原因

shouldUpdate 为 true，finishClassComponent 会调用类组件的 render 方法走强制更新逻辑

```js
function updateClassComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes
) {
  prepareToReadContext(workInProgress, renderLanes);
  var instance = workInProgress.stateNode;
  var shouldUpdate;

  if (instance === null) {
    // 第一次渲染
    shouldUpdate = true;
  } else {
    // 更新阶段
    shouldUpdate = updateClassInstance(
      current,
      workInProgress,
      Component,
      nextProps,
      renderLanes
    );
  }

  var nextUnitOfWork = finishClassComponent(
    current,
    workInProgress,
    Component,
    shouldUpdate,
    hasContext,
    renderLanes
  );

  return nextUnitOfWork;
}

function updateClassInstance(
  current,
  workInProgress,
  ctor,
  newProps,
  renderLanes
) {
  // 省略前面一大段逻辑....
  processUpdateQueue(workInProgress, newProps, instance, renderLanes);
  // ...
  var shouldUpdate =
    hasForceUpdate ||
    instance.shouldComponentUpdate(newProps, newState, nextContext);

  // 省略后面一大段逻辑...
  return shouldUpdate;
}
function finishClassComponent(
  current,
  workInProgress,
  Component,
  shouldUpdate,
  hasContext,
  renderLanes
) {
  // ...
  if (!shouldUpdate) {
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  // 省略后面的一大段逻辑：调用类组件的render方法，执行reconcileChildren协调子元素

  nextChildren = instance.render();
  // ...
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  // ....
  return workInProgress.child;
}
```

#### 函数组件强制更新流程

前面 propagateContextChange 说过，如果组件订阅了 context，不管是函数组件还是类组件，都会将 fiber.lanes 设置为 renderLanes。在 beginWork 阶段，发现 fiber.lanes 等于 renderLanes，则走 beginWork 的逻辑，强制组件更新

## 如何合理设计全局共享状态

从上面 Provider 的 value 变化，查找所有订阅组件的过程可以看出，每次 Provider 一变化，都要遍历一次，像下面的代码：

```js
<CounterContext.Provider value={this.state.count}>
  <UserContext.Provider value={this.state.count + "mike"}>
    <App />
  </UserContext.Provider>
</CounterContext.Provider>
```

如果 this.state.count 发生变化，则导致在 beginWork 阶段：

- CounterContext.Provider 的 value 发生了变化，则遍历内部所有的 fiber 节点找出消费组件
- UserContext.Provider 的 value 也发生了变化，则遍历内部所有的 fiber 节点找出消费组件

如果页面很复杂，组件层级很深数量庞大，遍历树的开销也是很大的。

因此，我们应该尽量少的避免 Provider 的 value 发生变化。避免以下用法：

```jsx
<Provider store={{ count: 1 }}>
  <ClientApp />
</Provider>
```

即使 count 值没变，但是每次 render，value 的引用都发生了变化。

## React Redux 是如何设计 Provider 的？

React Redux 的 `Provider` 接收 store，而 store 在创建初期就保持不变，因此 Provider 的 store 在整个应用生命周期内都不会发生改变，也就不会触发订阅的组件重新渲染。

我们通过 dispatch 触发的状态变更，实际上改变的是 store.state，然后通过 useSelector 或者 connect 订阅了状态的组件会强制更新，有兴趣可以参考这里[mini-react-redux](https://github.com/lizuncong/mini-react-redux)
