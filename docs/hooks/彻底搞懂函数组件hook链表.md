> hook 链表保存在 fiber 节点的 memoizedState 属性上。

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

在函数组件的 fiber 中，`memoizedState` 和`updateQueue` 属性和其他类型的 fiber 节点不同。

函数组件的 memoizedState 属性用于保存 hook 链表，hook 链表是单向链表。

函数组件的 updateQueue 属性用于保存`useEffect`、`useLayoutEffect`、`useImperativeHandle`这三个 hook 的 effect 信息，是一个环状链表，其中 updateQueue.lastEffect 指向最后一个 effect 对象。effect 描述了 hook 的信息，比如`useLayoutEffect` 的 effect 对象保存了监听函数，清除函数，依赖等。

## hook 链表

- useContext 比较特殊，并不会保存在 hook 链表中
- useState 是 useReducer 的语法糖，因此这里只需要用 useState 举例就好。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/hook-list-01.jpg)

## hook 对象及其属性介绍

函数组件每一个 hook 函数，都有对应的 hook 对象，hook 对象的属性如下，注意，hook 对象中的`memoizedState`属性和 fiber 的`memoizedState`属性含义不同。`next` 指向下一个 hook 对象，函数组件中的 hook 就是通过 next 指针连成链表

不同的 hook 中，memoizedState 的含义不同

```js
var hook = {
  memoizedState,,
  baseState,
  baseQueue,
  queue,
  next,
};
```

### useState

- hook.memoizedState 保存的是 useState 的 state 值。比如 `const [count, setCount] = useState(0)`中，memoizedState 保存的就是 state 的值。
- hook.queue 保存的是更新队列。queue 的属性如下：

```js
hook.queue = {
  pending: null,
  dispatch: null,
  lastRenderedReducer: basicStateReducer,
  lastRenderedState: initialState,
};
```

比如我们多次调用`setCount`：

```js
setCount(1);
setCount(2);
```

那么就会生成多个更新对象存入 hook.queue 中

### useRef

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

### useEffect 或者 useLayoutEffect

- memoizedState 保存的是一个 effect 对象，effect 对象保存的是 hook 的信息，比如监听函数，依赖，清除函数等，属性如下：

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

这里需要注意，hook.memoizedState 保存的是 useEffect 对应的 effect 对象，至于为什么 effect 有 next 属性，是因为在执行 useEffect 或者 useLayoutHook 的过程中，React 需要将函数组件中所有的 useEffect 以及 useLayoutEffect 的 effect 对象都添加到函数组件的 fiber.updateQueue 队列里面，以便 commit 阶段遍历 updateQueue 并执行相应的监听函数或者清除函数

fiber.updateQueue 是一个环状链表，lastEffect 指向最后一个 effect 对象。

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

### useImperativeHandle

- hook.memoizedState 保存的也是 effect，和 useLayoutEffect 的 effect 对象属性一致，同时，useImperativeHandle 的 effect 也会被添加到 fiber.updateQueue 队列中

```js
var effect = {
  tag: tag, // useImperativeHandle对应的tag等于3
  create: imperativeHandleEffect,
  destroy: undefined,
  deps: null,
  next: null, // 在updateQueue中使用，将所有的effect连成一个链表
};
```

### useCallback

- hook.memoizedState 保存的是回调函数和依赖

## 源码

- currentlyRenderingFiber。全局变量。当前正在执行的函数组件对应的 fiber 节点
- workInProgressHook。全局变量。当前正在执行的 hook
- currentHook?

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
