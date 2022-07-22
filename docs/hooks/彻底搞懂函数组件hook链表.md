> hook 链表保存在 fiber 节点的 memoizedState 属性上。

## Demo

```jsx
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from "react";
import ReactDOM from "react-dom";
const themes = {
  foreground: "red",
  background: "#eeeeee",
};
const ThemeContext = React.createContext(themes);

const Home = () => {
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
  const onClick = useCallback(() => {
    setCount(count + 1);
  }, [count]);
  return (
    <div style={{ color: theme.foreground }} ref={myRef} onClick={onClick}>
      {count}
    </div>
  );
};

ReactDOM.render(<Home />, document.getElementById("root"));
```

## 什么是hook
在React中，每一个函数组件都有对应的fiber节点。
```js
{
actualDuration: 0,
actualStartTime: -1,
alternate: null,
child: null,
childLanes: 0,
dependencies: null,
elementType: () => {},
firstEffect: null,
flags: 2,
index: 0,
key: null,
lanes: 0,
lastEffect: null,,
memoizedProps: null,
memoizedState: null,
mode: 0,
nextEffect: null
pendingProps: {}
ref: null
return: FiberNode {tag: 3, key: null, elementType: null, type: null, stateNode: FiberRootNode, …}
selfBaseDuration: 0
sibling: null
stateNode: null
tag: 2
treeBaseDuration: 0
type: () => {}
updateQueue: null
}
```

## 源码
- currentlyRenderingFiber。全局变量。当前正在执行的函数组件对应的fiber节点
- workInProgressHook。全局变量。当前正在调用的hook
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
