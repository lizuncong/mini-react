> React 异常处理最重要的目标之一就是避免吞没用户业务代码异常，从而保持浏览器的`Pause on exceptions`行为。这里你不仅能学到 React 异常捕获的知识，还能学到如何模拟 try catch

## 学习目标

- React 开发和生产环境捕获异常的实现不同
- 如何捕获异常，同时不吞没用户业务代码的异常
- 如何模拟 try catch 捕获异常
- React 捕获用户所有的业务代码中的异常，除了异步代码无法捕获以外。
- React 使用 handleError 处理 render 阶段用户业务代码的异常，使用 captureCommitPhaseError 处理 commit 阶段用户业务代码的异常，而事件处理函数中的业务代码异常则简单并特殊处理
- render 阶段抛出的业务代码异常，会导致 React 从 ErrorBoundary 组件或者 root 节点重新开始执行。而 commit 阶段抛出的业务代码异常，会导致 React 从 root 节点重新开始调度执行！重新执行的目的就是为了显示错误边界的备用 UI，如果没有错误边界组件，那么页面将显示白屏

## 前置基础知识

如果还不熟悉 JS 异常捕获，比如全局异常捕获，Promise 异常捕获，异步代码异常捕获。自定义事件，以及 dispatchEvent 的用法。React 错误边界等基础知识的，可以参考以下几篇短文。如果已经熟悉了，可以跳过。

- [JS 异常捕获基础](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/JS%E5%BC%82%E5%B8%B8%E6%8D%95%E8%8E%B7%E5%9F%BA%E7%A1%80.md)
- [自定义事件以及 dispatchEvent 基础知识](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/dispatchEvent%E5%9F%BA%E7%A1%80.md)
- [React 错误边界](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/React%E9%94%99%E8%AF%AF%E8%BE%B9%E7%95%8C.md)

>目前只有类组件才能作为错误边界，关于函数组件支持错误边界的场景，可以看看这个[issue](https://github.com/facebook/react/issues/14347)
## 为什么 Dev 模式下， React 不直接使用 try catch，而是自己模拟 try catch 机制实现异常捕获？

### 开发环境的目标：保持 Pause on exceptions 的预期行为

要回答这个问题，我们先看下 React 源码中一段关于异常捕获机制的描述：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/exception-01.jpg)

同时结合这个[issue](https://github.com/facebook/react/issues/4982)可以知道，**React 异常处理最重要的目标之一就是，避免吞没用户业务代码的异常，从而保持浏览器的`Pause on exceptions`行为**。如果对`Pause on exceptions`不熟悉的，可以看[这篇文章](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/JS%E5%BC%82%E5%B8%B8%E6%8D%95%E8%8E%B7%E5%9F%BA%E7%A1%80.md#%E5%A6%82%E4%BD%95%E5%88%A9%E7%94%A8%E8%B0%B7%E6%AD%8C-devtool-%E5%9C%A8%E5%BC%82%E5%B8%B8%E4%BB%A3%E7%A0%81%E5%A4%84%E6%89%93%E6%96%AD%E7%82%B9)

为了达到这个目标，React 将用户的所有业务代码包裹在 `invokeGuardedCallback` 函数中执行，比如构造函数，生命周期方法等。在`invokeGuardedCallback`内部，dev 环境下，React 模拟实现了 try catch 机制，而在生产环境中，react 简单的使用了 try catch

**构造函数、生命周期等方法内部的逻辑是用户自己实现的，理论上这些方法内部所抛出的任何异常，都应该让用户自行捕获**，比如下面的代码中

```js
useLayoutEffect(() => {
  console.log(aaadd);
}, []);
```

`useLayoutEffect`内部的逻辑是用户自己实现的，由于用户没有自己实现 try catch 捕获异常，那么`useLayoutEffect`内部抛出的异常应该可以被浏览器的`Pause on exceptions`自动定位到。

在生产环境中，`invokeGuardedCallback` 使用 try catch，因此所有的用户代码异常都被视为已经捕获的异常，不会被`Pause on exceptions`自动定位到，当然用户也可以通过开启 `Pause On Caught Exceptions` 自动定位到被捕获的异常代码位置。

但是这并不直观，因为即使 React 已经捕获了错误，从开发者的角度来说，错误是没有捕获的(毕竟用户没有自行捕获这个异常，而 React 作为库，不应该吞没异常)，**因此为了保持预期的 `Pause on exceptions` 行为，React 不会在 Dev 中使用 try catch**，而是使用 [custom event](https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent)以及[dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)模拟 try catch 的行为。

在上面的 `useLayoutEffect` 中，当执行我们的函数时，React 会将其包裹在 `invokeGuardedCallback` 中执行，即：

```js
invokeGuardedCallback(() => {
  console.log(aaadd);
});
```

### 防止用户业务代码被第三方库吞没

根据这个[issue](https://github.com/facebook/react/issues/6895#issuecomment-281405036)可以知道，React 异常捕获还有一个目标就是防止用户业务代码被其他第三方库的代码吞没。比如 react redux，redux saga 等。例如在 redux saga 中这么调用了 setState：

```js
Promise.resolve()
  .then(() => {
    this.setState({ a: 1 });
  })
  .catch((err) => {
    console.log(err);
  });
```

如果 React 不经过 invokeguardcallback 包裹执行`this.setState`，那么 setState 触发的异常将会被 promise.catch 捕获，在用户的角度看来，这个异常被吞没了。

React16 以后由于有了 invokeguardcallback 处理异常，在异步代码中调用 setState 触发的异常不会被任何第三方的 try catch 或者 promise catch 吞没。比如：

```jsx
<div
  onClick={() => {
    Promise.resolve()
      .then(() => {
        setCount({ a: 1 });
      })
      .catch((e) => {
        console.log("Swallowed!", e);
      });
  }}
>
  {count}
</div>
```

虽然这里用户自行使用 Promise 的 catch 捕获异常，但是 React 还是可以照样抛出异常，控制台还是会打印 Error 信息

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/exception-04.jpg)

```jsx
<div
  onClick={() => {
    setTimeout(() => {
      try {
        setCount({ a: 1 });
      } catch (e) {
        console.log("e...", e);
      }
    }, 0);
  }}
>
  {count}
</div>
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/exception-05.jpg)

> 这同时也告诉我们一个道理，作为一个库工具开发者，我们不应该吞没用户的异常

### 使用 dispatchEvent 模拟 try catch，同时又能保持浏览器开发者工具 Pause on exceptions 的预期行为

dispatchEvent 能够模拟 try catch，是基于下面的特性：

- 通过 dispatchEvent 触发的事件监听器是按顺序同步执行的，具体例子可以看[这里](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/dispatchEvent%E5%9F%BA%E7%A1%80.md#%E5%90%8C%E6%AD%A5%E8%B0%83%E7%94%A8%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%E7%A8%8B%E5%BA%8F%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D)
- 自定义事件监听器内部抛出的异常可以被全局异常监听器监听到并且会**立即执行!!!!!同时仍然可以被 Pause on exceptions 自动定位到**，具体例子可以看[这里](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/dispatchEvent%E5%9F%BA%E7%A1%80.md#%E5%A6%82%E6%9E%9C%E8%87%AA%E5%AE%9A%E4%B9%89%E4%BA%8B%E4%BB%B6%E7%9B%91%E5%90%AC%E5%99%A8%E6%8A%9B%E5%87%BA%E5%BC%82%E5%B8%B8%E4%BC%9A%E6%80%8E%E6%A0%B7)

这么说有点抽象，我们再来复习一个简单的例子：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>dispatchEvent</title>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
  </head>
  <body>
    <div id="root">
      <button id="btn">click me</button>
    </div>
    <script>
      window.onerror = (e) => {
        console.log("全局异常监听器...", e);
      };
      const event = new Event("MyCustomEvent", { bubbles: true });
      root.addEventListener("MyCustomEvent", function (e) {
        console.log("root第一个事件监听器", e);
      });
      btn.addEventListener("MyCustomEvent", function (e) {
        console.log("btn第一个事件监听器", e);
        throw Error("btn事件监听器抛出的异常");
        console.log("这一句不会被执行到，因此不会被打印");
      });
      btn.addEventListener("MyCustomEvent", function (e) {
        console.log("btn第2个事件监听器", e);
      });
      console.log("开始触发自定义事件");
      btn.dispatchEvent(event);
      console.log("自定义事件监听函数执行完毕");
    </script>
  </body>
</html>
```

这个例子首先注册一个全局异常监听器，然后创建自定义的事件，给 btn、root 添加监听自定义事件的监听器，其中 btn 的第一个监听器抛出一个异常。最后通过 `dispatchEvent` 触发自定义事件监听器的执行。执行结果如下所示：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/exception-02.jpg)

**从图中的执行结果可以看出，btn 的第一个事件监听器抛出的异常会立即被全局异常监听器捕获到，并立即执行。** 这个效果和 try catch 完全一致！！！同时，即使自定义事件监听器的异常被全局异常监听器捕获到了，仍然可以被`Pause on exceptions`自动定位到，这就是 React 想要的效果！！！

```js
console.log("开始");
try {
  console.log("aaaa", dd);
} catch (e) {
  console.log("捕获异常...", e);
}
console.log("结束");
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/exception-03.jpg)

在开发环境中，React 将自定义事件(fake event)**同步派发**到自定义 dom(fake dom noe)上，并在自定义事件监听器内调用用户的回调函数，如果用户的回调函数抛出错误，则使用全局异常监听器捕获错误。这为我们提供了 try catch 的行为，而无需实际使用 try catch，又能保持浏览器 `Pause on exceptions` 的预期行为。

## Dev 模式下，React 如何实现模拟 try catch 的行为

在 dev 环境下，invokeGuardedCallback 的实现如下所示，这里是精简后的代码，func 是需要包裹执行的回调函数，比如前面的 useLayoutEffect 中的监听函数。在 render 阶段，react 将 beginWork 包裹进 invokeGuardedCallback 执行，这样在 render 阶段执行所有的用户业务代码里面抛出来的异常都能被 React 处理，比如 render 阶段执行的构造函数、shouldComponentUpdate、render 等方法。

dev 环境下在自定义事件监听器中执行用户的回调函数，如果用户的回调函数抛出异常，则被全局的异常监听器捕获，并且立即执行全局异常监听器

```js
let caughtError = null;
function invokeGuardedCallback(func) {
  const evt = document.createEvent("Event");
  const evtType = "react-invokeguardedcallback";
  const fakeNode = document.createElement("react");

  function callCallback() {
    fakeNode.removeEventListener(evtType, callCallback, false);
    // 执行回调函数
    func();
  }

  function handleWindowError(event) {
    caughtError = event.error;
  }

  // 注册全局异常监听器
  window.addEventListener("error", handleWindowError);
  // 注册自定义事件监听器，在自定义事件中调用用户提供的回调函数
  fakeNode.addEventListener(evtType, callCallback, false);

  evt.initEvent(evtType, false, false);
  fakeNode.dispatchEvent(evt);

  // 移除全局异常监听器
  window.removeEventListener("error", handleWindowError);
}
```

在生产环境下，invokeGuardedCallback 的实现如下，使用普通的 try catch 捕获用户提供的函数 func 里面的异常

```js
function invokeGuardedCallbackProd(func) {
  try {
    func();
  } catch (error) {
    this.onError(error);
  }
}
```

## React Dev 模式异常捕获及处理

在 Dev 环境下，React 使用 `invokeGuardedCallback` 包裹所有的用户业务代码，我全局搜索了一下 `invokeGuardedCallback` 函数的调用，总共有以下几个地方调用了 `invokeGuardedCallback` 函数捕获异常，涵盖了所有的用户业务代码：

- 合成事件的回调函数，将第一个错误重新抛出
- 类组件 componentWillUnmount 生命周期方法，避免 componentWillUnmount 中的异常阻断组件卸载。然后在 captureCommitPhaseError 中处理异常
- DetachRef，释放 Ref。如果 Ref 是一个函数，在组件卸载的时候会执行 ref，用户业务代码的异常(包括生命周期方法和 refs)都不应该打断删除的过程，因此这些方法都会使用 `invokeGuardedCallback` 包括执行。然后 ref 中的异常会在 captureCommitPhaseError 中处理
- useLayoutEffect 以及 useEffect 的清除函数以及 useEffect 的监听函数，然后使用 captureCommitPhaseError 处理异常
- commit 阶段的 commitBeforeMutationEffects、commitMutationEffects、commitLayoutEffects 函数，然后使用 captureCommitPhaseError 处理异常
- render 阶段的 beginWork 方法先使用 try catch 捕获异常，如果 beginWork 有异常抛出，则将 beginWork 包裹进 invokeGuardedCallback 重新执行，并重新抛出异常，然后在 handleError 方法中处理异常

可以看出，在 dev 环境中，我们**所有的业务代码**都被`invokeGuardedCallback`包裹并且执行，我们业务代码中的异常都会被 `invokeGuardedCallback` 捕获。除了合成事件中的异常特殊处理外，在 render 阶段调用的方法，比如构造函数，一些生命周期方法中的异常，都在`handleError`中处理。在 commit 阶段调用的方法，比如 useEffect 的监听函数等方法的异常，都在`captureCommitPhaseError`中处理。

**总的来说，React 使用 invokeGuardedCallback 捕获我们业务代码中的异常，然后在`handleError`或者`captureCommitPhaseError`处理异常，这也正是 React 错误边界的逻辑**

**但是，我们也需要明白一点，并不是所有的用户业务代码中的异常都会被错误边界处理**

并不是用户的所有业务代码都能被 React 错误边界处理！！！

并不是用户的所有业务代码都能被 React 错误边界处理！！！

并不是用户的所有业务代码都能被 React 错误边界处理！！！

一般情况下，[React 错误边界](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/React%E9%94%99%E8%AF%AF%E8%BE%B9%E7%95%8C.md)能够处理大部分的用户业务代码的异常，包括 render 阶段以及 commit 阶段执行的业务代码，但是并不能捕获并处理以下的用户业务代码异常：

- 事件处理
- 异步代码
- 服务端渲染的异常

下面，逐一介绍合成事件异常捕获及处理、`handleError`异常处理、`captureCommitPhaseError`异常处理

### 合成事件回调函数中的异常捕获及处理

合成事件中的异常不会被 React 错误边界处理

React 会捕获合成事件中的错误，但只会将第一个重新抛出，**同时并不会在控制台打印 fiber 栈信息**，举个例子：

```jsx
<div
  onClick={() => {
    console.log("b...", b);
  }}
>
  <div
    onClick={() => {
      console.log("a..", a);
    }}
  >
    click me
  </div>
</div>
```

当我们点击 'click me' 时，React 会沿着冒泡阶段调用所有的监听函数，并捕获这些错误打印出来。但是，React 只会将第一个错误**重新抛出(rethrowCaughtError)**。可以发现下图中 React 捕获了这两个监听函数中的错误并打印了出来，但 React 只会将第一个监听函数中的错误重新抛出。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/exception-06.jpg)

### handleError 如何处理异常

handleError 只用于处理 render 阶段在`beginWork`函数中执行的用户业务代码抛出的异常，比如构造函数，类组件的 render 方法、函数组件、生命周期方法等

为了方便演示，我将`renderRootSync`的主要逻辑简化如下，这也是 React render 阶段的主要逻辑，以下代码可以直接复制在浏览器控制台运行：

```js
let workInProgress = 0;
let caughtError;
function renderRootSync(root, lanes) {
  do {
    try {
      workLoopSync();
      break;
    } catch (thrownValue) {
      console.log("renderRootSync捕获了异常.....", thrownValue);
      // handleError(root, thrownValue);
      return;
    }
  } while (true);
}

function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  const next = beginWork$1(unitOfWork);
  if (next > 4) {
    // 模拟completeUnitOfWork
    // completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}
function invokeGuardedCallback(func, arg) {
  const evt = document.createEvent("Event");
  const evtType = "react-invokeguardedcallback";
  const fakeNode = document.createElement("react");

  function callCallback() {
    fakeNode.removeEventListener(evtType, callCallback, false);
    func(arg);
  }

  function handleWindowError(event) {
    caughtError = event.error;
  }

  window.addEventListener("error", handleWindowError);
  fakeNode.addEventListener(evtType, callCallback, false);

  evt.initEvent(evtType, false, false);
  fakeNode.dispatchEvent(evt);

  window.removeEventListener("error", handleWindowError);
}
function beginWork(unitOfWork) {
  console.log("beginWork....", unitOfWork);
  if (unitOfWork === 2) {
    throw Error("unitOfWork等于2时抛出错误，模拟异常");
  }
  return unitOfWork + 1;
}
function beginWork$1(unitOfWork) {
  const originalWorkInProgressCopy = unitOfWork;

  try {
    // 先执行一遍beginWork
    return beginWork(unitOfWork);
  } catch (originalError) {
    // 重置unitOfWork
    unitOfWork = originalWorkInProgressCopy; // assignFiberPropertiesInDEV

    // 重新开始执行beginWork
    invokeGuardedCallback(beginWork, unitOfWork);

    // 重新抛出错误，这次抛出的错误会被handleError捕获并处理
    if (caughtError) {
      throw caughtError;
    }
  }
}

renderRootSync();
```

从上面代码可以看出，如果`beginWork`函数发生了异常，那么会被 try catch 捕获，并且 React 会在 catch 里面重新将 beginWork 包裹进`invokeGuardedCallback`函数中**重复执行!!!**。前面说过，使用 try catch 捕获异常，会破坏浏览器的`Pause on exceptions`预期的行为，因此如果 beginWork 抛出了异常，则需要将 beginWork 包裹进`Pause on exceptions`重复执行，在`invokeGuardedCallback`抛出的异常不会被吞没

> 其实我不太明白这里为啥需要重复执行，一开始就完全可以将 beginWork 包裹进`invokeGuardedCallback`中执行，这样既能捕获异常，还能保持浏览器的预期行为，详情可以查看这个[issue](https://github.com/facebook/react/issues/25041)，有懂哥可以指教一下。

第二次执行`beginWork`时，如果抛出异常，则会被`handleError`捕获并处理，下面我们详细了解下`handleError`如何处理异常

以下面的代码为例：

```jsx
import React from "react";
import ReactDOM from "react-dom";
import Counter from "./counter";
import ErrorBoundary from "./error";
class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ErrorBoundary>
        <Counter />
      </ErrorBoundary>
    );
  }
}
const Counter = () => {
  const [count, setCount] = useState({});
  return <div id="counter">{count}</div>;
};
ReactDOM.render(<Home />, document.getElementById("root"));
```

`renderRootSync`也是一个循环，这里需要注意，循环结束的条件是要么`hanleError`重新抛出异常终止函数执行，要么`workLoopSync`正常执行完成，到 break 语句退出。

```js
function renderRootSync(root, lanes) {
  do {
    try {
      workLoopSync();
      break;
    } catch (thrownValue) {
      console.log("renderRootSync捕获了异常.....", thrownValue);
      handleError(root, thrownValue);
    }
  } while (true);
}
```

当`workLoopSync`执行的过程中发生异常时，会被`handleError`捕获。`handleError` 会从当前抛出异常的 fiber 节点开始(这里是 div#counter 对应的 fiber 节点)往上找到最近的错误边界组件，即 ErrorBoundary，如果不存在 ErrorBoundary 组件，则会找到 root fiber。然后 handleError 执行完成。循环继续，此时`workLoopSync`重新执行，`workLoopSync`又会从 root fiber 重新执行，这里有两种情况

- 如果存在 ErrorBoundary，那么`workLoopSync`会从 ErrorBoundary 开始执行，并渲染 ErrorBoundary 的备用 UI
- 如果不存在 ErrorBoundary，那么`workLoopSync`会从 root 节点开始执行，React 会直接卸载整个组件树，页面崩溃白屏。然后在 commit 阶段执行完成后将异常重新抛出，这次抛出的异常会被浏览器的 `Pause on exceptions` 捕获到

因此，`workLoopSync`的重复执行，要么会让页面崩溃，要么显示我们的备用 UI。

```js
function handleError(root, thrownValue) {
  do {
    var erroredWork = workInProgress;

    try {
      throwException(root, erroredWork.return, erroredWork, thrownValue);
      completeUnitOfWork(erroredWork);
    } catch (yetAnotherThrownValue) {
      // Something in the return path also threw.
      continue;
    }

    return;
  } while (true);
}
```

而往上查找 ErrorBoundary 的任务就由`throwException`函数完成。throwException 主要做两件事：

- 1. 调用`createCapturedValue`从当前抛出异常的 fiber 节点开始往上找出所有的 fiber 节点并收集起来，用于在控制台打印 fiber 栈，如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/exception-07.jpg)

- 2. while 循环负责往上找 ErrorBoundary 组件，如果找不到 ErrorBoundary 组件，则找到 root fiber 来处理异常。这里需要注意这个查找过程，只会找类组件以及
     root 节点。同时，类组件需要满足实现`getDerivedStateFromError`或者`componentDidCatch`方法才能成为 ErrorBoundary

> 注意！！createRootErrorUpdate 创建的更新对象中，update.element 已经被重置为 null 了，因此在 workLoopSync 第二次执行时，root 的子节点是 null，这也是为啥我们页面白屏的原因。如果是找到了 ErrorBoundary 组件，createClassErrorUpdate 在创建 update 对象时，会将 getDerivedStateFromError 做为 update.payload，这样在 workLoopSync 重复执行时，render 阶段就会执行这个 getDerivedStateFromError 函数以获取 ErrorBoundary 的 state

```js
function throwException(root, returnFiber, sourceFiber, value) {
  sourceFiber.flags |= Incomplete; // 将当前fiber节点标记为未完成
  // 由于当前fiber节点已经抛出异常，他对应的副作用链表已经没用了，需要重置
  sourceFiber.firstEffect = sourceFiber.lastEffect = null;
  // createCapturedValue主要的一个功能就是从发生异常的fiber节点开始，往上继续找出所有的fiber节点信息，用于在控制台
  // 打印fiber栈信息
  value = createCapturedValue(value, sourceFiber);

  var workInProgress = returnFiber;

  do {
    switch (workInProgress.tag) {
      case HostRoot: {
        var _errorInfo = value;
        workInProgress.flags |= ShouldCapture;
        // 注意！！createRootErrorUpdate创建的更新对象中，update.element已经被重置为null了，因此在workLoopSync第二次执行时，root的子节点是null，这也是为啥我们页面白屏的原因
        var _update = createRootErrorUpdate(workInProgress, _errorInfo, lane);

        enqueueCapturedUpdate(workInProgress, _update);
        return;
      }

      case ClassComponent:
        // Capture and retry
        var errorInfo = value;
        var ctor = workInProgress.type;
        var instance = workInProgress.stateNode;

        if (
          (workInProgress.flags & DidCapture) === NoFlags &&
          (typeof ctor.getDerivedStateFromError === "function" ||
            (instance !== null &&
              typeof instance.componentDidCatch === "function"))
        ) {
          workInProgress.flags |= ShouldCapture;

          var _update2 = createClassErrorUpdate(
            workInProgress,
            errorInfo,
            _lane
          );

          enqueueCapturedUpdate(workInProgress, _update2);
          return;
        }

        break;
    }

    workInProgress = workInProgress.return;
  } while (workInProgress !== null);
}
```

注意，`throwException`执行完成后，会调用`completeUnitOfWork`继续完成工作。此时的 completeUnitOfWork 会走 else 的逻辑，主要做几件事：

- 调用 unwindWork 恢复 context 栈信息，并且找到 ErrorBoundary 组件，如果存在 ErrorBoundary，则将当前的 fiber 返回并终止 completeUnitOfWork 函数执行。否则返回 root 节点。
- 往上将抛出异常的 fiber 节点的父节点都标记为 Incomplete 并调用 completeUnitOfWork 完成父节点

```js
// 主要两个工作
// 调用unwinkWork重置context，然后往上找到最近的能够处理异常的ErrorBoundary，找不到的话，那就是root节点
function completeUnitOfWork(unitOfWork) {
  var completedWork = unitOfWork;
  do {
    var current = completedWork.alternate;
    var returnFiber = completedWork.return;

    if ((completedWork.flags & Incomplete) === NoFlags) {
    } else {
      // 当前fiber没有完成，因为有异常抛出，因此需要从栈恢复
      var _next = unwindWork(completedWork);
      if (_next !== null) {
        _next.flags &= HostEffectMask;
        workInProgress = _next;
        return;
      }
      if (returnFiber !== null) {
        returnFiber.firstEffect = returnFiber.lastEffect = null;
        returnFiber.flags |= Incomplete;
      }
    }
    completedWork = returnFiber; // Update the next thing we're working on in case something throws.
    workInProgress = completedWork;
  } while (completedWork !== null);
}
```

看到这里，需要注意一点，workLoopSync 第二次重复执行时，从哪个节点开始，也是分情况的：

- 如果没有找到 ErrorBoundary，那么从 root fiber 节点开始执行 performUnitOfWork
- 如果找到 ErrorBoundary 组件，那么只需要从 ErrorBoundary 组件开始执行 performUnitOfWork

#### handleError 总结

总的来说，handleError 主要是处理 render 阶段抛出的异常。 从当前抛出异常的节点开始，往上找，直到找到 ErrorBoundary 组件或者 root 节点。并将 cotext 恢复到 ErrorBoundary 或者 root 节点，然后重复执行 workLoopSync，第二次执行的 workLoopSync 从 ErrorBoundary 或者 root 节点开始执行 render 的过程

### captureCommitPhaseError 如何处理异常

还是以上面的代码为例，这次修改一下 Couter 组件，在 useEffect 中抛出异常：

```jsx
const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("use effect...", a);
  });
  return <div id="counter">{count}</div>;
};
```

`captureCommitPhaseError`用来处理 commit 阶段抛出的异常。主要是做了以下几件事：

- 从当前抛出异常的 fiber 节点开始，往上找，找到 ErrorBoundary 组件或者 root 节点，并创建对应的 update 更新对象。
- 调用 `ensureRootIsScheduled` 从 root 节点开始执行。

> 这里可以看出，render 阶段的异常会导致 React 从 ErrorBoundary 组件或者 root 节点开始重新执行。而 commit 阶段抛出的异常会导致 React 从 root 节点重新调度执行

```js
function captureCommitPhaseError(sourceFiber, error) {
  var fiber = sourceFiber.return;

  while (fiber !== null) {
    if (fiber.tag === HostRoot) {
      // captureCommitPhaseErrorOnRoot(fiber, sourceFiber, error);
      return;
    } else if (fiber.tag === ClassComponent) {
      var ctor = fiber.type;
      var instance = fiber.stateNode;

      if (
        typeof ctor.getDerivedStateFromError === "function" ||
        typeof instance.componentDidCatch === "function"
      ) {
        var errorInfo = createCapturedValue(error, sourceFiber);
        var update = createClassErrorUpdate(fiber, errorInfo, SyncLane);
        enqueueUpdate(fiber, update);

        if (root !== null) {
          markRootUpdated(root, SyncLane, eventTime);
          ensureRootIsScheduled(root, eventTime);
        } else {
        }
        return;
      }
    }
    fiber = fiber.return;
  }
}
```
