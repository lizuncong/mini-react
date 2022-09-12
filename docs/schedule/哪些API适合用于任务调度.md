> 本章是手写 React Scheduler 源码系列的第一篇文章，第二篇查看[Scheduler 基础用法详解](./scheduler%E7%94%A8%E6%B3%95%E8%AF%A6%E8%A7%A3.md)

## 学习目标

了解屏幕刷新率，下面这些 API 的基础用法及执行时机。从浏览器 Performance 面板中看每一帧的执行时间以及工作。探索哪些 API 适合用来调度任务

- requestAnimationFrame
- requestIdleCallback
- setTimeout
- MessageChannel
- 微任务
  - MutationObserver
  - Promise

## 屏幕刷新率

- 目前大多数设备的屏幕刷新率为 60 次/秒
- 页面是一帧一帧绘制出来的，当每秒绘制的帧数(FPS)达到 60 时，页面是流畅的，小于这个值时，用户会感觉到卡顿
- 每帧的预算时间是 16.66 毫秒(1 秒/60)，因此在写代码时，注意避免一帧的工作量超过 16ms。在每一帧内，浏览器都会执行以下操作：
  - 执行宏任务、用户事件等。
  - 执行 requestAnimationFrame
  - 执行样式计算、布局和绘制。
  - 如果还有空闲时间，则执行 requestIdelCallback
  - 如果某个任务执行时间过长，则当前帧不会绘制，会造成掉帧的现象。
- 显卡会在每一帧开始时间给浏览器发送一个 vSync 标记符，从而让浏览器刷新频率和屏幕的刷新频率保持同步。

以下面的例子为例：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Frame</title>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <style>
      #animation {
        width: 30px;
        height: 30px;
        background: red;
        animation: myfirst 5s infinite;
      }
      @keyframes myfirst {
        from {
          width: 30px;
          height: 30px;
          border-radius: 0;
          background: red;
        }
        to {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: yellow;
        }
      }
    </style>
  </head>
  <body>
    <div id="animation">test</div>
  </body>
  <script>
    function rafCallback(timestamp) {
      window.requestAnimationFrame(rafCallback);
    }
    window.requestAnimationFrame(rafCallback);

    function timeoutCallback() {
      setTimeout(timeoutCallback, 0);
    }
    setTimeout(timeoutCallback, 0);

    const timeout = 1000;
    requestIdleCallback(workLoop, { timeout });
    function workLoop(deadline) {
      requestIdleCallback(workLoop, { timeout });
      const start = new Date().getTime();
      while (new Date().getTime() - start < 2) {}
    }
  </script>
</html>
```

在浏览器控制台的 performance 中查看上例的运行结果，如下图所示：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/frame-01.jpg)

从图中可以看出每一帧的执行时间都是 16.7ms，在这一帧内，浏览器执行 raf，计算样式，布局，重绘，requestIdleCallback、定时器，放大每一帧可以看到：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/frame-02.jpg)

> 在本篇文章中，会复用上面的 html 中的动画 demo

## requestAnimationFrame

requestAnimationFrame 在每一帧绘制之前执行，嵌套(递归)调用 requestAnimationFrame 并不会导致页面死循环从而崩溃。每执行完一次 raf 回调，js 引擎都会将控制权交还给浏览器，等到下一帧时再执行。

```js
function rafCallback(timestamp) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 2) {}
  window.requestAnimationFrame(rafCallback);
}
window.requestAnimationFrame(rafCallback);
```

上面的例子中使用 while 循环模拟耗时 2 毫秒的任务，观察浏览器页面发现动画很流畅，Performance 查看每一帧的执行情况如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/frame-05.jpg)

如果将 while 循环改成 100 毫秒，页面动画明显的卡顿，Performance 查看会提示一堆长任务

```js
function rafCallback(timestamp) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  window.requestAnimationFrame(rafCallback);
}
window.requestAnimationFrame(rafCallback);
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/frame-06.jpg)

> raf 在每一帧开始绘制前执行，两次 raf 之间间隔 16ms。在执行完一次 raf 回调后，会让出控制权给浏览器。嵌套递归调用 raf 不会导致页面死循环

## requestIdleCallback

requestIdleCallback 在每一帧剩余时间执行。

本例中使用`deadline.timeRemaining() > 0 || deadline.didTimeout`判断如果当前帧中还有剩余时间，则继续 while 循环

```js
const timeout = 1000;
requestIdleCallback(workLoop, { timeout });
function workLoop(deadline) {
  while (deadline.timeRemaining() > 0 || deadline.didTimeout) {}
  requestIdleCallback(workLoop, { timeout });
}
```

Performance 查看如下，几乎用满了一帧的时间，极致压榨 😁

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/frame-07.jpg)

> requestIdleCallback 会在每一帧剩余时间执行，两次调用之间的时间间隔不确定，同时这个 API 有兼容性问题。在执行完一次 requestIdleCallback 回调后会主动让出控制权给浏览器，嵌套递归调用不会导致死循环

## setTimeout

setTimeout 是一个宏任务，用于启动一个定时器，当然时间间隔并不一定准确。在本例中我将间隔设置为 0 毫秒

```js
function work() {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 2) {}
  setTimeout(work, 0);
}
setTimeout(work, 0);
```

Performance 查看如下，可以发现，即使我将时间间隔设置为 0 毫秒，两次 setTimeout 之间的间隔差不多是 4 毫秒(如图中红线所示)。可以看出 setTimeout 会有至少 4 毫秒的延迟

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/frame-08.jpg)

> setTimeout 嵌套调用不会导致死循环，js 引擎执行完一次 settimeout 回调就会将控制权让给浏览器。settimeout 至少有 4 毫秒的延迟

## MessageChannel

和 setTimeout 一样，MessageChannel 回调也是一个宏任务，具体用法如下：

```js
var channel = new MessageChannel();
var port = channel.port2;
channel.port1.onmessage = work;
function work() {
  port.postMessage(null);
}
port.postMessage(null);
```

Performance 查看如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/frame-09.jpg)

放大每一帧可以看到，一帧内，MessageChannel 回调的调用频次超高

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/frame-10.jpg)

从图中可以看出，相比于 setTimeout，MessageChannel 有以下特点：

- 在一帧内的调用频次超高
- 两次之间的时间间隔几乎可以忽略不计，没有 setTimeout 4 毫秒延迟的特点

## 微任务

微任务是在当前主线程执行完成后立即执行的，浏览器会在页面绘制前清空微任务队列，嵌套调用微任务会导致死循环。这里我会介绍两个微任务相关的 API

### Promise

在这个例子中，我使用 count 来控制 promise 嵌套的次数，防止死循环

```js
let count = 0;
function mymicrotask() {
  Promise.resolve(1).then((res) => {
    count++;
    if (count < 100000) {
      mymicrotask();
    }
  });
}
function rafCallback(timestamp) {
  mymicrotask();
  count = 0;
  window.requestAnimationFrame(rafCallback);
}
window.requestAnimationFrame(rafCallback);
```

这里，我在 requestAnimationFrame 调用 mymicrotask，mymicrotask 中会调用 Promise 启用一个微任务，在 Promise then 中又会嵌套调用 mymicrotask 递归的调研 Promise。从图中可以看到，在本次页面更新前执行完全部的微任务

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/frame-03.jpg)

如果像下面这样嵌套调用，页面直接卡死，和死循环效果一样

```js
function mymicrotask() {
  Promise.resolve(1).then((res) => {
    mymicrotask();
  });
}
function rafCallback(timestamp) {
  mymicrotask();
  window.requestAnimationFrame(rafCallback);
}
window.requestAnimationFrame(rafCallback);
```

### MutationObserver

和 Promise 一样，为了防止死循环，我使用 count 控制，在一次 raf 中只调用 2000 次 mymicrotask

```js
let count = 0;
const observer = new MutationObserver(mymicrotask);
let textNode = document.createTextNode(String(count));
observer.observe(textNode, {
  characterData: true,
});
function mymicrotask() {
  if (count > 2000) return;
  count++;
  textNode.data = String(count);
}
function rafCallback(timestamp) {
  mymicrotask();
  count = 0;
  window.requestAnimationFrame(rafCallback);
}
window.requestAnimationFrame(rafCallback);
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/frame-04.jpg)

当然，如果取消 count 的限制，页面直接卡死，死循环了。

```js
let count = 0;
const observer = new MutationObserver(mymicrotask);
let textNode = document.createTextNode(String(count));
observer.observe(textNode, {
  characterData: true,
});
function mymicrotask() {
  count++;
  textNode.data = String(count);
}
function rafCallback(timestamp) {
  mymicrotask();
  window.requestAnimationFrame(rafCallback);
}
window.requestAnimationFrame(rafCallback);
```

## 小结

从上面的例子中可以看出

- 嵌套递归调用微任务 API 会导致死循环，JS 引擎需要执行完全部微任务才会让出控制权，因此不适用于任务调度
- requestAnimationFrame、requestIdleCallback、setTimeout、MessageChannel 等 API 嵌套递归调用不会导致死循环，JS 引擎每执行完一次回调都会让出控制权，适用于任务调度。我们需要综合考虑这几个 API 调用间隔、执行时机等因素选择合适的 API

## 相关 issue

实际上，React 团队也针对这些 API 进行尝试，下面是相关 issue

- [为什么不使用 web worker](https://github.com/facebook/react/issues/3092)
- [为什么不使用 generator](https://github.com/facebook/react/issues/7942)
- [为什么不使用 requestAnimationFrame](https://github.com/facebook/react/pull/16214)
