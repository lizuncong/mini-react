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

React 将用户的所有业务代码包装在 `invokeGuardedCallback` 函数中执行，比如构造函数，生命周期方法等。

**这些方法内部的逻辑是用户自己实现的，并且大部分在 React 的 render 阶段调用，理论上这些方法内部所抛出的任何异常，都应该让用户自行捕获**，比如下面的代码中

```js
useLayoutEffect(() => {
  console.log(aaadd);
}, []);
```

`useLayoutEffect`内部的逻辑是用户自己实现的，由于用户没有自己实现 try catch 捕获异常，那么理论上`useLayoutEffect`内部抛出的异常应该可以被浏览器的`Pause on exceptions`自动定位到。

在生产环境中，`invokeGuardedCallback` 使用 try catch，因此所有的用户代码异常都被视为已经捕获的异常，不会被`Pause on exceptions`自动定位到，当然用户也可以通过开启 `Pause On Caught Exceptions` 自动定位到被捕获的异常代码位置。

但是这并不直观，因为即使 React 已经捕获了错误，从开发者的角度来说，错误是没有捕获的(毕竟用户没有自行捕获这个异常，而 React 作为库，不应该吞没异常)，**因此为了保持预期的 `Pause on exceptions` 行为，React 不会在 Dev 中使用 try catch**，而是使用 [custom event](https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent)以及[dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)模拟 try catch 的行为。

### 防止用户业务代码被第三方库吞没

根据这个[issue](https://github.com/facebook/react/issues/6895#issuecomment-281405036)可以知道，React 异常捕获还有一个目标就是防止用户业务代码被其他第三方库的**异步代码**吞没。比如 react redux，redux saga 等。例如在 redux saga 中这么调用了 setState：

```js
Promise.resolve()
  .then(() => {
    this.setState({ a: 1 });
  })
  .catch((err) => {
    console.log(err);
  });
```

如果 React 不经过 invokeguardcallback 处理，那么 setState 的触发的 render 的异常将会被 promise.catch 捕获，在用户的角度看来，这个异常被吞没了。

React16 以后由于有了 invokeguardcallback 处理异常，在异步代码中调用 setState 触发的 render 的异常不会被任何 try catch 或者 promise catch 吞没。比如：

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

Promise 的 catch 虽然可以捕获异常，但是 React 还是可以照样抛出异常，控制台还是会打印 Error 信息

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

在 dev 环境下，invokeGuardedCallback 的实现如下所示，这里是精简后的代码，func 是用户提供的回调函数，比如在 render 阶段，func 就是 beginWork 函数。

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

在 Dev 环境下，React 使用 `invokeGuardedCallback` 包裹几乎所有的用户业务代码，我全局搜索了一下 `invokeGuardedCallback` 函数的调用，总共有以下几个地方调用了 `invokeGuardedCallback` 函数捕获异常，涵盖了所有的用户业务代码：

- 合成事件的回调函数，将第一个错误重新抛出
- 类组件 componentWillUnmount 生命周期方法，避免 componentWillUnmount 中的异常阻断组件卸载。然后在 captureCommitPhaseError 中处理异常
- DetachRef，释放 Ref。如果 Ref 是一个函数，在组件卸载的时候会执行 ref，用户业务代码的异常(包括生命周期方法和 refs)都不应该打断删除的过程，因此这些方法都会使用 `invokeGuardedCallback` 包括执行。然后 ref 中的异常会在 captureCommitPhaseError 中处理
- useLayoutEffect 以及 useEffect 的清除函数以及 useEffect 的监听函数，然后使用 captureCommitPhaseError 处理异常
- commit 阶段的 commitBeforeMutationEffects、commitMutationEffects、commitLayoutEffects 函数，然后使用 captureCommitPhaseError 处理异常
- render 阶段的 beginWork 方法先使用 try catch 捕获异常，如果 beginWork 有异常抛出，则将 beginWork 包裹进 invokeGuardedCallback 重新执行，并重新抛出异常，然后在 handleError 方法中处理异常

可以看出，在 dev 环境中，我们**所有的业务代码**都被`invokeGuardedCallback`包裹并且执行，我们业务代码中的异常都会被 `invokeGuardedCallback` 捕获。除了合成事件中的异常特殊处理外，在 render 阶段调用的方法，比如构造函数，一些生命周期方法中的异常，都在`handleError`中处理。在 commit 阶段调用的方法，比如 useEffect 的监听函数等方法的异常，都在`captureCommitPhaseError`中处理。

**总的来说，React 使用 invokeGuardedCallback 捕获我们业务代码中的异常，然后在`handleError`或者`captureCommitPhaseError`处理异常**

**但是，我们也需要明白一点，并不是所有的用户业务代码中的异常都会被错误边界处理**

并不是用户的所有业务代码都能被 React 错误边界处理！！！

并不是用户的所有业务代码都能被 React 错误边界处理！！！

并不是用户的所有业务代码都能被 React 错误边界处理！！！

[React 错误边界](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/React%E9%94%99%E8%AF%AF%E8%BE%B9%E7%95%8C.md)只能够处理以下业务代码中的异常：

- 子组件树渲染期间的错误，比如调用类组件的 render 方法，执行函数组件等
- 生命周期方法中的错误，比如类组件的所有生命周期方法，函数组件的 useEffect、useLayoutEffect 等 hook
- 构造函数中的错误

事件处理、异步代码、服务端渲染的异常并不能被错误边界处理。

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

`beginWork` 阶段异常捕获主要逻辑如下：

```js

```
