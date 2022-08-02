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

在生产环境中，`invokeGuardedCallback` 使用 try catch，因此所有的用户代码异常都被视为已经捕获的异常，不会被`Pause on exceptions`自动定位到，当然用户也可以通过开启 `Pause On Caught Exceptions` 自动定位到被捕获的异常代码位置。

但是这并不直观，因为即使 React 已经捕获了错误，从开发者的角度来说，错误是没有捕获的(毕竟用户没有自行捕获这个异常，而 React 作为库，不应该吞没异常)，**因此为了保持预期的 `Pause on exceptions` 行为，React 不会在 Dev 中使用 try catch**，而是使用 [custom event](https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent)以及[dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)模拟 try catch 的行为。

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

## React Dev 模式异常捕获

### React 错误边界

经过前面的铺垫，我们已经知道了 Dev 环境下 React 怎么模拟 try catch 的行为。也了解了`invokeGuardedCallback` 的实现。

React 只会捕获以下场景产生的错误，这也是 React 错误边界能够处理的异常情况

- 子组件树渲染期间，比如调用类组件的 render 方法，执行函数组件等
- 生命周期方法，比如类组件的所有生命周期方法，函数组件的 useEffect、useLayoutEffect 等 hook
- 构造函数

React 在执行以上方法时，会包裹进`invokeGuardedCallback`中执行。以上的方法都是用户的业务代码，因此 React 不能够吞没用户业务代码的异常。当上述代码发生异常时，React 需要往上找到最近的错误边界组件，如果存在错误边界组件，则渲染错误边界组件的备用 UI，如果没找到，则直接卸载整个组件树，页面白屏

虽然以下代码也是用户自身的业务代码，但是由于下面的代码不会导致页面异常，因此 React 不会处理下面这些场景中的异常

- 事件处理
- 异步代码，例如 setTimeout 或 requestAnimationFrame 回调函数
- 服务端渲染
- 错误边界组件自身抛出来的错误

在[深入概述 React 初次渲染及状态更新主流程](https://github.com/lizuncong/mini-react/blob/master/docs/render/%E6%B7%B1%E5%85%A5%E6%A6%82%E8%BF%B0%20React%E5%88%9D%E6%AC%A1%E6%B8%B2%E6%9F%93%E5%8F%8A%E7%8A%B6%E6%80%81%E6%9B%B4%E6%96%B0%E4%B8%BB%E6%B5%81%E7%A8%8B.md)一文中介绍过，React 渲染可以概括为**两大阶段，五小阶段**

- render 阶段
  - beginWork
  - completeUnitOfWork
- commit 阶段
  - commitBeforeMutationEffects
  - commitMutationEffects
  - commitLayoutEffects

在 beginWork 阶段调用子组件树中类组件的 render 方法或者执行函数组件以协调子元素，调用类组件构造函数，执行部分生命周期函数

因此可以发现，React 错误边界需要处理的异常大部分都在 beginWork 阶段，而有些生命周期方法或者函数组件的 useEffect 等 hook 的执行是在 commit 阶段，我们可以从这两个阶段入手解析 React 如何捕获并且处理异常

## beginWork 阶段异常捕获处理

beginWork 阶段主要就是调用类组件的构造函数、部分生命周期方法、类组件的 render 方法，然后协调子元素。

## TODO

源码中调用 invokeGuardedCallback 的地方有：

- beginWork 阶段先使用try catch捕获异常，如果beginWork有异常抛出，则将beginWork包裹进invokeGuardedCallback重新执行

合成事件

- executeDispatch 触发貌似合成事件也调用了？

以下是 commit 阶段的异常捕获及处理，使用 captureCommitPhaseError 处理异常

- safelyCallComponentWillUnmount，调用 ComponentWillUnmount 生命周期方法
- safelyDetachRef 当 ref 是个函数的时候，将 ref 包裹进 invokeGuardedCallback 执行
- safelyCallDestroy 调用 useLayoutEffect 的清除函数
- 将 commitBeforeMutationEffects、 commitMutationEffects、commitLayoutEffects这三个函数都包裹进invokeGuardedCallback执行

- 将useEffect的监听函数以及清除函数都包裹进invokeGuardedCallback执行