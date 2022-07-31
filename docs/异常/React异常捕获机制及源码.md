> React 异常处理最重要的目标之一就是保持浏览器的`Pause on exceptions`行为。这里你不仅能学到 React 异常捕获的知识，还能学到如何模拟 try catch

## 前置基础知识

如果还不熟悉 JS 异常捕获，比如全局异常捕获，Promise 异常捕获，异步代码异常捕获。自定义事件，以及 dispatchEvent 的用法。React 错误边界等基础知识的，可以参考以下几篇短文。如果已经熟悉了，可以跳过。

- [JS 异常捕获基础](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/JS%E5%BC%82%E5%B8%B8%E6%8D%95%E8%8E%B7%E5%9F%BA%E7%A1%80.md)
- [自定义事件以及 dispatchEvent 基础知识](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/dispatchEvent%E5%9F%BA%E7%A1%80.md)
- [React 错误边界](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/React%E9%94%99%E8%AF%AF%E8%BE%B9%E7%95%8C.md)

## 为什么 Dev 模式下， React 不直接使用 try catch，而是自己模拟 try catch 机制实现异常捕获？

### 开发环境的目标：保持 Pause on exceptions 的预期行为

要回答这个问题，我们先看下 React 源码中一段关于异常捕获机制的描述：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/exception-01.jpg)

同时结合这个[issue](https://github.com/facebook/react/issues/4982)可以知道，**React 异常处理最重要的目标之一就是保持浏览器的`Pause on exceptions`行为**。如果对`Pause on exceptions`不熟悉的，可以看[这篇文章](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/JS%E5%BC%82%E5%B8%B8%E6%8D%95%E8%8E%B7%E5%9F%BA%E7%A1%80.md#%E5%A6%82%E4%BD%95%E5%88%A9%E7%94%A8%E8%B0%B7%E6%AD%8C-devtool-%E5%9C%A8%E5%BC%82%E5%B8%B8%E4%BB%A3%E7%A0%81%E5%A4%84%E6%89%93%E6%96%AD%E7%82%B9)

React 将所有用户提供的函数包装在 `invokeGuardedCallback` 函数中执行，用户提供的函数包括以下方法：

- 子组件树渲染期间的错误，比如调用类组件的 render 方法，执行函数组件等
- 构造函数中的错误
- 生命周期方法中的错误，比如类组件的所有生命周期方法，函数组件的 useEffect，useLayoutEffect 等 hook 内部的逻辑

实际上，这也是[React 错误边界](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/React%E9%94%99%E8%AF%AF%E8%BE%B9%E7%95%8C.md)能够处理的异常。**以上函数内部的逻辑是用户自己实现的，并且大部分在 React 的 render 阶段调用，理论上这些方法内部所抛出的任何异常，都应该让用户自行捕获**，比如下面的代码中

```js
useLayoutEffect(() => {
  console.log(aaadd);
}, []);
```

`useLayoutEffect`内部的逻辑是用户自己实现的，由于用户没有自己实现 try catch 捕获异常，那么理论上`useLayoutEffect`内部抛出的异常应该可以被浏览器的`Pause on exceptions`自动定位到。

在生产环境中，`invokeGuardedCallback` 使用 try catch，因此所有的用户代码异常都被视为已经捕获的异常，当然用户也可以通过开启 `Pause On Caught Exceptions` 自动定位到被捕获的异常代码位置。

但是这并不直观，因为即使 React 已经捕获了错误，从开发者的角度来说，错误是没有捕获的，**因此为了保持预期的 `Pause on exceptions` 行为，React 不会在 Dev 中使用 try catch**，而是使用 [custom event](https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent)以及[dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)模拟 try catch 的行为。

### 使用 dispatchEvent 模拟 try catch，同时又能保持 Pause on exceptions 的预期行为

dispatchEvent 能够模拟 try catch，是基于下面的前提条件：

- 通过 dispatchEvent 触发的事件监听器是按顺序同步执行的，具体例子可以看[这里](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/dispatchEvent%E5%9F%BA%E7%A1%80.md#%E5%90%8C%E6%AD%A5%E8%B0%83%E7%94%A8%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%E7%A8%8B%E5%BA%8F%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D)
- 自定义事件监听器内部抛出的异常可以被全局异常监听器监听到并且会**立即执行!!!!!**，具体例子可以看[这里](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/dispatchEvent%E5%9F%BA%E7%A1%80.md#%E5%A6%82%E6%9E%9C%E8%87%AA%E5%AE%9A%E4%B9%89%E4%BA%8B%E4%BB%B6%E7%9B%91%E5%90%AC%E5%99%A8%E6%8A%9B%E5%87%BA%E5%BC%82%E5%B8%B8%E4%BC%9A%E6%80%8E%E6%A0%B7)

在开发环境中，React 将自定义事件(fake event)**同步派发**到自定义 dom(fake dom noe)上，

React 将所有用户提供的函数包装在 invokeGuardedCallback 中，并且 invokeGuardedCallback 的生产版本使用 try-catch，所以所有用户异常都被视为捕获的异常，除非开发人员采取额外的步骤来启用 pause on，否则 DevTools 不会暂停捕获的异常。然而，这是不直观的，因为即使 React 已经捕获了错误，从开发人员的角度来看，错误是未被捕获的。为了保持预期的“异常暂停”行为，我们不在 DEV 中使用 try-catch。相反，我们将假事件同步分派到假 DOM 节点，并从事件处理程序内部为该假事件调用用户提供的回调。如果回调抛出，则使用全局事件处理程序“捕获”错误。但是因为错误发生在不同的事件循环上下文中，所以它不会中断正常的程序流程。实际上，这为我们提供了 try-catch 行为，而无需实际使用 try-catch。整洁的！检查浏览器是否支持我们需要实现我们的特殊 DEV 版本的 invokeGuardedCallback 的 API

在[React 错误边界]()React 需要处理

子组件树渲染期间的错误，比如调用类组件的 render 方法，执行函数组件等

- 生命周期方法中的错误，比如类组件的所有生命周期方法，函数组件的 useEffect、useLayoutEffect 等 hook
- 构造函数中的错误

## React 是怎么捕获已经被吞噬的异常的？

比如下面中，`setCount({ a: 1 })` 由于 count 是一个对象，在 render 阶段会报错，但按理会被 promise 的 catch 语句捕获，而不会抛出错误，但是 React 是如何做到的呢？

```jsx
const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div
      onClick={() => {
        Promise.resolve()
          .then(() => {
            setCount({ a: 1 });
          })
          .catch(() => {
            console.log("Swallowed!");
          });
      }}
    >
      {count}
    </div>
  );
};
```

## 如何只捕获 React 渲染过程相关的异常

## 源码

```js
function renderRootSync(root, lanes) {
  do {
    try {
      workLoopSync();
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue);
    }
  } while (true);

  return workInProgressRootExitStatus;
}
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  var current = unitOfWork.alternate;
  var next;
  if ((unitOfWork.mode & ProfileMode) !== NoMode) {
    next = beginWork$1(current, unitOfWork, subtreeRenderLanes);
  } else {
    next = beginWork$1(current, unitOfWork, subtreeRenderLanes);
  }
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
  ReactCurrentOwner$2.current = null;
}
var dummyFiber = null;

beginWork$1 = function (current, unitOfWork, lanes) {
  // If a component throws an error, we replay it again in a synchronously
  // dispatched event, so that the debugger will treat it as an uncaught
  // error See ReactErrorUtils for more information.
  // Before entering the begin phase, copy the work-in-progress onto a dummy
  // fiber. If beginWork throws, we'll use this to reset the state.
  var originalWorkInProgressCopy = assignFiberPropertiesInDEV(
    dummyFiber,
    unitOfWork
  );

  try {
    return beginWork(current, unitOfWork, lanes);
  } catch (originalError) {
    if (
      originalError !== null &&
      typeof originalError === "object" &&
      typeof originalError.then === "function"
    ) {
      // Don't replay promises. Treat everything else like an error.
      throw originalError;
    } // Keep this code in sync with handleError; any changes here must have
    // corresponding changes there.

    resetContextDependencies();
    resetHooksAfterThrow(); // Don't reset current debug fiber, since we're about to work on the
    // same fiber again.
    // Unwind the failed stack frame

    unwindInterruptedWork(unitOfWork); // Restore the original properties of the fiber.

    assignFiberPropertiesInDEV(unitOfWork, originalWorkInProgressCopy);

    if (unitOfWork.mode & ProfileMode) {
      // Reset the profiler timer.
      startProfilerTimer(unitOfWork);
    } // Run beginWork again.

    invokeGuardedCallback(null, beginWork, null, current, unitOfWork, lanes);

    if (hasCaughtError()) {
      var replayError = clearCaughtError(); // `invokeGuardedCallback` sometimes sets an expando `_suppressLogging`.
      // Rethrow this error instead of the original one.

      throw replayError;
    } else {
      // This branch is reachable if the render phase is impure.
      throw originalError;
    }
  }
};
```

## 链接

- [React16 错误处理](https://zh-hans.reactjs.org/blog/2017/07/26/error-handling-in-react-16.html)
- [服务端渲染的一篇文章](https://medium.com/@aickin/whats-new-with-server-side-rendering-in-react-16-9b0d78585d67)
- [Fiber 架构](https://code.facebook.com/posts/1716776591680069/react-16-a-look-inside-an-api-compatible-rewrite-of-our-frontend-ui-library/)

- [issue](https://github.com/facebook/react/issues/4982)
