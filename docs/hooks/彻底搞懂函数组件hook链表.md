> hook 链表保存在 fiber 节点的 memoizedState 属性上。

## 概述

- 每一个 hook 函数都有对应的 hook 对象保存状态信息
- `useContext`是唯一一个不需要添加到 hook 链表的 hook 函数
- 只有 useEffect、useLayoutEffect 以及 useImperativeHandle 这三个 hook 具有副作用，在 render 阶段需要给函数组件 fiber 添加对应的副作用标记。同时这三个 hook 都有对应的 effect 对象保存其状态信息
- 每次渲染都是重新构建 hook 链表以及 收集 effect list(fiber.updateQueue)
- 初次渲染调用 mountWorkInProgressHook 构建 hook 链表。更新渲染调用 updateWorkInProgressHook 构建 hook 链表并复用上一次的 hook 状态信息

## Demo

可以用下面的 demo 在本地调试

```jsx
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  forwardRef,
} from "react";
import ReactDOM from "react-dom";
const themes = {
  foreground: "red",
  background: "#eeeeee",
};
const ThemeContext = React.createContext(themes);

const Home = forwardRef((props, ref) => {
  debugger;
  const [count, setCount] = useState(0);
  const myRef = useRef(null);
  const theme = useContext(ThemeContext);
  useEffect(() => {
    console.log("useEffect", count);
  }, [count]);
  useLayoutEffect(() => {
    console.log("useLayoutEffect...", myRef);
  });
  const res = useMemo(() => {
    console.log("useMemo");
    return count * count;
  }, [count]);
  console.log("res...", res);
  useImperativeHandle(ref, () => ({
    focus: () => {
      myRef.current.focus();
    },
  }));

  const onClick = useCallback(() => {
    setCount(count + 1);
  }, [count]);
  return (
    <div style={{ color: theme.foreground }} ref={myRef} onClick={onClick}>
      {count}
    </div>
  );
});

ReactDOM.render(<Home />, document.getElementById("root"));
```

## fiber

React 在初次渲染或者更新过程中，都会在 render 阶段创建新的或者复用旧的 fiber 节点。每一个函数组件，都有对应的 fiber 节点。

fiber 的主要属性如下：

```js
var fiber = {
  alternate,
  child,
  elementType: () => {},
  memoizedProps: null,
  memoizedState: null, // 在函数组件中，memoizedState用于保存hook链表
  pendingProps: {},
  return,
  sibling,
  stateNode,
  tag, // fiber的类型，函数组件对应的tag为2
  type: () => {}
  updateQueue: null,
}
```

在函数组件的 fiber 中，有两个属性和 hook 有关：`memoizedState` 和`updateQueue` 属性。

- memoizedState 属性用于保存 hook 链表，hook 链表是单向链表。
- updateQueue 属性用于保存`useEffect`、`useLayoutEffect`、`useImperativeHandle`这三个 hook 的 effect 信息，是一个环状链表，其中 updateQueue.lastEffect 指向最后一个 effect 对象。effect 描述了 hook 的信息，比如`useLayoutEffect` 的 effect 对象保存了监听函数，清除函数，依赖等。

## hook 链表

React 为我们提供的以`use`开头的函数就是 hook，本质上函数在执行完成后，就会被销毁，然后状态丢失。React 能记住这些函数的状态信息的根本原因是，在函数组件执行过程中，React 会为每个 hook 函数创建对应的 hook 对象，然后将状态信息保存在 hook 对象中，在下一次更新渲染时，会从这些 hook 对象中获取上一次的状态信息。

在函数组件执行的过程中，比如上例中，当执行 `Home()` 函数组件时，React 会为组件内每个 hook 函数创建对应的 hook 对象，这些 hook 对象保存 hook 函数的信息以及状态，然后将这些 hook 对象连成一个链表。上例中，第一个执行的是`useState` hook，React 为其创建一个 hook：stateHook。第二个执行的是`useRef` hook，同样为其创建一个 hook：refHook，然后将 stateHook.next 指向 refHook：stateHook.next = refHook。同理，refHook.next = effectHook，...

需要注意：

- **`useContext`是唯一一个不会出现在 hook 链表中的 hook。**
- useState 是 useReducer 的语法糖，因此这里只需要用 useState 举例就好。
- `useEffect`、`useLayoutEffect`、`useImperativeHandle`这三个 hook 都是属于 effect 类型的 hook，他们的 effect 对象都需要被添加到函数组件 fiber 的 updateQueue 中，以便在 commit 阶段执行。

上例中，hook 链表如下红色虚线中所示：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-list-01.jpg)

## hook 对象及其属性介绍

函数组件内部的每一个 hook 函数，都有对应的 hook 对象用来保存 hook 函数的状态信息，hook 对象的属性如下：

```js
var hook = {
  memoizedState,,
  baseState,
  baseQueue,
  queue,
  next,
};
```

注意，hook 对象中的`memoizedState`属性和 fiber 的`memoizedState`属性含义不同。`next` 指向下一个 hook 对象，函数组件中的 hook 就是通过 next 指针连成链表

同时，不同的 hook 中，memoizedState 的含义不同，下面详细介绍各类型 hook 对象的属性含义

### useState Hook 对象

- hook.memoizedState 保存的是 useState 的 state 值。比如 `const [count, setCount] = useState(0)`中，memoizedState 保存的就是 state 的值。
- hook.queue 保存的是更新队列，是个环状链表。queue 的属性如下：

```js
hook.queue = {
  pending: null,
  dispatch: null,
  lastRenderedReducer: basicStateReducer,
  lastRenderedState: initialState,
};
```

比如我们在 onClick 中多次调用`setCount`：

```js
const onClick = useCallback(() => {
  debugger;
  setCount(count + 1);
  setCount(2);
  setCount(3);
}, [count]);
```

每次调用`setCount`，都会创建一个新的 update 对象，并添加进 hook.queue 中，update 对象属性如下：

```js
var update = {
  lane: lane,
  action: action, // setCount的参数
  eagerReducer: null,
  eagerState: null,
  next: null,
};
```

queue.pending 指向最后一个更新对象。queue 队列如下红色实线所示

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-list-02.jpg)

在 render 阶段，会遍历 hook.queue，计算最终的 state 值，并存入 hook.memoizedState 中

### useRef Hook

- hook.memoizedState 保存的是 ref 的值。比如

```js
const myRef = useRef(null);
```

那么 memoizedState 保存的是 myRef 的值，即：

```js
hook.memoizedState = {
  current,
};
```

### useEffect、useLayoutEffect 以及 useImperativeHandle

- memoizedState 保存的是一个 effect 对象，effect 对象保存的是 hook 的状态信息，比如监听函数，依赖，清除函数等，属性如下：

```js
var effect = {
  tag: tag, // effect的类型，useEffect对应的tag为5，useLayoutEffect对应的tag为3
  create: create, // useEffect或者useLayoutEffect的监听函数，即第一个参数
  destroy: destroy, // useEffect或者useLayoutEffect的清除函数，即监听函数的返回值
  deps: deps, // useEffect或者useLayoutEffect的依赖，第二个参数
  // Circular
  next: null, // 在updateQueue中使用，将所有的effect连成一个链表
};
```

**这三个 hook 都属于 effect 类型的 hook，即具有副作用的 hook**

- useEffect 的副作用为：Update | Passive，即 516
- useLayoutEffect 和 useImperativeHandle 的副作用都是：Update，即 4

**在函数组件中，也就只有这三个 hook 才具有副作用**，在 hook 执行的过程中需要给 fiber 添加对应的副作用标记。然后在 commit 阶段执行对应的操作，比如调用`useEffect`的监听函数，清除函数等等。

因此，React 需要将这三个 hook 函数的 effect 对象存到 fiber.updateQueue 中，以便在 commit 阶段遍历 updateQueue，执行对应的操作。updateQueue 也是一个环状链表，lastEffect 指向最后一个 effect 对象。effect 和 effect 之间通过 next 相连。

```js
const effect = {
    create: () => { console.log("useEffect", count); },
    deps: [0]
    destroy: undefined,
    tag: 5,
}
effect.next = effect
fiber.updateQueue = {
  lastEffect: effect,
};
```

fiber.updateQueue 如下图红色实线所示：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-list-03.jpg)

hook 对应的 effect 对象如下图红色实线所示：
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-list-04.jpg)

### useMemo

- hook.memoizedState 保存的是 useMemo 的值和依赖。比如

```js
const res = useMemo(() => {
  return count * count;
}, [count]);
```

那么 memoizedState 保存的是返回值以及依赖，即

```js
hook.memoizedState = [count * count, [count]];
```

### useCallback

hook.memoizedState 保存的是回调函数和依赖，比如

```js
const onClick = useCallback(callback dep);
```

那么 memoizedState=[callback, dep]

## 构建 Hook 链表的源码

React 在**初次渲染**和**更新**这两个过程，构建 hook 链表的算法不一样，因此 React 对这两个过程是分开处理的：

```js
var HooksDispatcherOnMount = {
  useCallback: mountCallback,
  useContext: readContext,
  useEffect: mountEffect,
  useImperativeHandle: mountImperativeHandle,
  useLayoutEffect: mountLayoutEffect,
  useMemo: mountMemo,
  useRef: mountRef,
  useState: mountState,
};
var HooksDispatcherOnUpdate = {
  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useRef: updateRef,
  useState: updateState,
};
```

如果是初次渲染，则使用`HooksDispatcherOnMount`，此时如果我们调用 useState，实际上调用的是`HooksDispatcherOnMount.useState`，执行的是`mountState`方法。

如果是更新阶段，则使用`HooksDispatcherOnUpdate`，此时如果我们调用 useState，实际上调用的是`HooksDispatcherOnUpdate.useState`，执行的是`updateState`

**初次渲染和更新渲染执行 hook 函数的区别在于：**

- 构建 hook 链表的算法不同。初次渲染只是简单的构建 hook 链表。而更新渲染会遍历上一次的 hook 链表，构建新的 hook 链表，并复用上一次的 hook 状态
- 依赖的判断。初次渲染不需要判断依赖。更新渲染需要判断依赖是否变化。
- 对于 useState 来说，更新阶段还需要遍历 queue 链表，计算最新的状态。

### renderWithHooks 函数组件执行

不管是初次渲染还是更新渲染，函数组件的执行都是从`renderWithHooks`函数开始执行。

```js
function renderWithHooks(current, workInProgress, Component, props) {
  currentlyRenderingFiber = workInProgress;
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate;

  var children = Component(props, secondArg);

  currentlyRenderingFiber = null;
  currentHook = null;
  workInProgressHook = null;

  return children;
}
```

renderWithHooks 的`Component`参数就是我们的函数组件，在本例中，就是`Home`函数。

**Component 开始执行前，会重置 memoizedState 和 updateQueue 属性，因此每次渲染都是重新构建 hook 链表以及收集 effect list**

renderWithHooks 方法初始化以下全局变量

- currentlyRenderingFiber。fiber 节点。当前正在执行的函数组件对应的 fiber 节点，这里是 Home 组件的 fiber 节点
- ReactCurrentDispatcher.current。负责派发 hook 函数，初次渲染时，指向 HooksDispatcherOnMount，更新渲染时指向 HooksDispatcherOnUpdate。比如我们在函数组件内部调用 useState，实际上调用的是：

```js
function useState(initialState) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
function resolveDispatcher() {
  var dispatcher = ReactCurrentDispatcher.current;
  return dispatcher;
}
```

**每一个 hook 函数在执行时，都会调用`resolveDispatcher`方法获取当前的`dispatcher`，然后调用`dispatcher`中对应的方法处理 mount 或者 update 逻辑。**

以 useEffect 为例，在初次渲染时调用的是：

```js
function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
  var hook = mountWorkInProgressHook();
  var nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    HasEffect | hookFlags,
    create,
    undefined,
    nextDeps
  );
}
```

在更新渲染时，调用的是

```js
function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
  var hook = updateWorkInProgressHook();
  var nextDeps = deps === undefined ? null : deps;
  var destroy = undefined;

  if (currentHook !== null) {
    var prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;

    if (nextDeps !== null) {
      var prevDeps = prevEffect.deps;

      if (areHookInputsEqual(nextDeps, prevDeps)) {
        pushEffect(hookFlags, create, destroy, nextDeps);
        return;
      }
    }
  }

  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    HasEffect | hookFlags,
    create,
    destroy,
    nextDeps
  );
}
```

pushEffect 方法构建一个 effect 对象并添加到 fiber.updateQueue 中，同时返回 effect 对象。

mountEffectImpl 方法逻辑比较简单，而 updateEffectImpl 方法还多了一个判断依赖是否变化的逻辑。

`mountWorkInProgressHook`以及`updateWorkInProgressHook`方法用来在函数组件执行过程中构建 hook 链表，这也是构建 hook 链表的算法。每一个 hook 函数在执行的过程中都会调用这两个方法

### 构建 hook 链表的算法

初次渲染和更新渲染，构建 hook 链表的算法不同。初次渲染使用`mountWorkInProgressHook`，而更新渲染使用`updateWorkInProgressHook`。

- mountWorkInProgressHook 直接为每个 hook 函数创建对应的 hook 对象
- updateWorkInProgressHook 在执行每个 hook 函数时，同时遍历上一次的 hook 链表，以复用上一次 hook 的状态信息。这个算法稍稍复杂

React 使用全局变量`workInProgressHook`保存当前正在执行的 hook 对象。比如，本例中，第一个执行的是`useState`，则此时`workInProgressHook=stateHook`。第二个执行的是`useRef`，则此时`workInProgressHook=refHook`，...。

可以将 `workInProgressHook` 看作链表的指针

#### mountWorkInProgressHook 构建 hook 链表算法

代码如下

```js
function mountWorkInProgressHook() {
  var hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // hook链表中的第一个hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // 添加到hook链表末尾
    workInProgressHook = workInProgressHook.next = hook;
  }

  return workInProgressHook;
}
```

可以看出，初次渲染构建 hook 链表的算法逻辑非常简单，为每一个 hook 函数创建对应的 hook 对象，然后添加到 hook 链表末尾就行

#### updateWorkInProgressHook 构建 hook 链表算法

更新渲染阶段构建 hook 链表的算法就比较麻烦。我们从 fiber 开始

我们知道 React 在 render 阶段会复用 fiber 节点，假设我们第一次渲染完成的 fiber 节点如下：

```js
var firstFiber = {
  ..., // 省略其他属性
  alternate: null, // 由于是第一次渲染，alternate为null
  memoizedState, // 第一次渲染构建的hook链表
  updateQueue, // 第一次渲染收集的effect list
};
```

经过第一次渲染以后，我们将得到下面的 hook 链表：
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-list-05.jpg)

当我们点击按钮触发更新，renderWithHooks 函数开始调用，但 Home 函数执行前，此时`workInProgressHook`、`currentHook`都为 null。同时新的 fiber 的`memoizedState`、`updateQueue`都被重置为 null
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-list-06.jpg)

`workInProgressHook`用于构建新的 hook 链表

`currentHook`用于遍历上一次渲染构建的 hook 链表，即旧的链表，或者当前的链表(即和当前显示的页面对应的 hook 链表)

按照本例中调用 hook 函数的顺序，一步步拆解`updateWorkInProgressHook`算法的过程

- 第一步 调用 useState

由于此时 `currentHook` 为 null，因此我们需要初始化它指向旧的 hook 链表的第一个 hook 对象。

```js
if (currentHook === null) {
  var current = currentlyRenderingFiber.alternate;

  if (current !== null) {
    nextCurrentHook = current.memoizedState;
  } else {
    nextCurrentHook = null;
  }
}

currentHook = nextCurrentHook;
```

创建一个新的 hook 对象，复用上一次的 hook 对象的状态信息，并初始化 hook 链表

```js
var newHook = {
  memoizedState: currentHook.memoizedState,
  baseState: currentHook.baseState,
  baseQueue: currentHook.baseQueue,
  queue: currentHook.queue,
  next: null, // 注意，next被重置了!!!!!
};

if (workInProgressHook === null) {
  currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
}
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-list-07.jpg)

- 第二步 调用 useRef

此时 currentHook 已经有值，指向第一个 hook 对象。因此将 currentHook 指向它的下一个 hook 对象，即第二个

```js
if (currentHook === null) {
} else {
  nextCurrentHook = currentHook.next;
}
currentHook = nextCurrentHook;
```

同样的，也需要为 useRef 创建一个新的 hook 对象，并复用上一次的 hook 状态
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-list-08.jpg)

后面的 hook 的执行过程和 useRef 一样，都是一边遍历旧的 hook 链表，为当前 hook 函数创建新的 hook 对象，然后复用旧的 hook 对象的状态信息，然后添加到 hook 链表中

**从更新渲染的过程也可以看出，hook 函数的执行是会遍历旧的 hook 链表并复用旧的 hook 对象的状态信息。这也是为什么我们不能将 hook 函数写在条件语句或者循环中的根本原因，我们必须保证 hook 函数的顺序在任何时候都要一致**

#### 完整源码

最终完整的算法如下：

```js
function updateWorkInProgressHook() {
  var nextCurrentHook;

  if (currentHook === null) {
    var current = currentlyRenderingFiber$1.alternate;

    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }

  var nextWorkInProgressHook;

  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber$1.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }

  if (nextWorkInProgressHook !== null) {
    // There's already a work-in-progress. Reuse it.
    workInProgressHook = nextWorkInProgressHook;
    nextWorkInProgressHook = workInProgressHook.next;
    currentHook = nextCurrentHook;
  } else {
    // Clone from the current hook.
    if (!(nextCurrentHook !== null)) {
      {
        throw Error(formatProdErrorMessage(310));
      }
    }

    currentHook = nextCurrentHook;
    var newHook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null,
    };

    if (workInProgressHook === null) {
      // This is the first hook in the list.
      currentlyRenderingFiber$1.memoizedState = workInProgressHook = newHook;
    } else {
      // Append to the end of the list.
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }

  return workInProgressHook;
}
```
