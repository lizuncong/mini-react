> 本章是手写 React Scheduler 源码系列的第三篇文章，前两篇可以点击下面链接查看：1.[哪些 API 适合用于任务调度](./%E5%93%AA%E4%BA%9BAPI%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6.md)。2.[scheduler 用法详解](./scheduler%E7%94%A8%E6%B3%95%E8%AF%A6%E8%A7%A3.md)

## 前置基础知识

如果对 `requestAnimationFrame`、`requestIdleCallback`、`setTimeout`、`MessageChannel`、`MutationObserver`、`Promise`等 API 还不熟悉的，可以先看[这篇文章](./%E5%93%AA%E4%BA%9BAPI%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6.md)熟悉一下。如果对 React Scheduler 用法还不熟悉的，可以先看[这篇文章](./scheduler%E7%94%A8%E6%B3%95%E8%AF%A6%E8%A7%A3.md)熟悉一下

## 一个简单的动画

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>schedule源码</title>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <style>
      #animation {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100px;
        height: 100px;
        background: red;
        animation: myfirst 5s;
        animation-iteration-count: infinite;
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
    <button id="btn">perform work</button>
    <div id="animation">Animation</div>
    <script></script>
  </body>
</html>
```

效果如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-01.jpg)

就是这么简单

## 点击按钮更新页面

给定一组任务，点击按钮的时候，全部执行完这组任务，然后将执行耗时更新到页面。很快我们就可以实现如下

```js
let works = [];
for (let i = 0; i < 3000; i++) {
  works.push(() => {
    const start = new Date().getTime();
    while (new Date().getTime() - start < 2) {}
  });
}
const btn = document.getElementById("btn");
const animate = document.getElementById("animation");
btn.onclick = () => {
  const startTime = new Date().getTime();
  flushWork();
  const endTime = new Date().getTime();
  animate.innerHTML = endTime - startTime;
};

function flushWork() {
  works.forEach((w) => w());
}
```

效果如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-02.jpg)

### 问题分析

点击按钮后，经过 6 秒后页面才更新，同时动画停止，页面卡顿响应不了用户输入，此时继续点击按钮是没任何反应的。因此，虽然说是实现了效果，但是交互体验不够友好。

## 将任务放到 setTimeout 定时器里面执行

为了不长时间占用主线程，阻塞浏览器渲染，这次我们将任务拆分到定时器执行，每个定时器执行一个任务。每执行一次都判断 works 是否全部执行完成，如果全部执行完成，则更新页面

```js
let works = [];
for (let i = 0; i < 3000; i++) {
  works.push(() => {
    const start = new Date().getTime();
    while (new Date().getTime() - start < 2) {}
  });
}
const btn = document.getElementById("btn");
const animate = document.getElementById("animation");
let endTime;
let startTime;
btn.onclick = () => {
  startTime = new Date().getTime();
  flushWork();
};

function flushWork() {
  setTimeout(workLoop, 0);
}

function workLoop() {
  const work = works.shift();
  if (work) {
    work();
    setTimeout(workLoop, 0);
  } else {
    const endTime = new Date().getTime();
    animate.innerHTML = endTime - startTime;
  }
}
```

点击按钮，可以发现，经过了漫长的等待，大概 19 秒的时间，页面才更新。但是，这次我们的动画还是很流畅的，页面不会卡顿，依然可以响应用户的输入。如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-03.jpg)

我们在上一节的时候，任务执行总耗时才 6000 毫秒，每个任务执行耗时 2 毫秒，3000 个任务，最多也就 6000 毫秒，为啥这次执行耗时 19266 毫秒，远比之前多出了 13266 毫秒？

我们来看下 Performance。即使这里我们使用了`setTimeout(workLoop, 0)`0 毫秒的时间间隔，但是浏览器依然会有 4 到 5 毫秒的间隔时间。如果两次 setTimeout 之间最少间隔 4 毫秒，都有 3000 \* 4 = 12000 毫秒的耗时了。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-04.jpg)

### 问题分析

即使我们使用`setTimeout(workLoop, 0)`，但两次 setTimeout 之间依然有 4 到 5 毫秒的时间间隔，在执行一组数量不限的任务时，这个耗时是不容忽视的。**作为一个专业的前端切图仔，我们在追求页面动画流畅、不卡顿的同时，应该还要快速响应用户的输入从而快速更新页面**。显然，setTimeout 由于 4 毫秒间隔的原因，不适用于我们的场景。在[哪些 API 适用于任务调度](https://github.com/lizuncong/mini-react/blob/master/docs/schedule/%E5%93%AA%E4%BA%9BAPI%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6.md)我们学到，`MessageChannel`在一帧内的调用频率超高，且两次调用的时间间隔极短。我们可以尝试一下这个 API

## 使用 MessageChannel 改良我们的工作循环

这次，我们使用 `MessageChannel` 触发一个宏任务，在宏任务事件中执行工作。每执行完一个工作，判断是否已经执行完全部的工作，如果是，则更新页面，否则调用`port.postMessage(null)`触发下一个宏任务，继续执行剩余的工作。

```js
let works = [];
for (let i = 0; i < 3000; i++) {
  works.push(() => {
    const start = new Date().getTime();
    while (new Date().getTime() - start < 2) {}
  });
}
const btn = document.getElementById("btn");
const animate = document.getElementById("animation");

var channel = new MessageChannel();
var port = channel.port2;
channel.port1.onmessage = workLoop;

let endTime;
let startTime;
btn.onclick = () => {
  startTime = new Date().getTime();
  port.postMessage(null);
};

function workLoop() {
  const work = works.shift();
  if (work) {
    work();
    port.postMessage(null);
  } else {
    const endTime = new Date().getTime();
    animate.innerHTML = endTime - startTime;
  }
}
```

效果如下，可以发现耗时只用了 6009 毫秒！！！为什么会多出了 9 毫秒？实际上，我们观察 performance 可以看出，虽然两次宏任务之间间隔非常短，但实际上也是有一些耗时的，累积起来就有了几毫秒的差异。不过，这已经很贴近 6000 毫秒的执行耗时了，优势远胜于 setTimeout

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-05.jpg)

如果多试几次，就会发现耗时不固定的，有时是 6000 毫秒，有时 6001 毫秒，有时 6002 毫秒，极少数需要 6009 毫秒，这取决于两次 message channel 之间的间隔

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-06.jpg)

### 问题分析

这次，我们能够同时兼顾页面动画流畅、不卡顿以及快速响应用户输入，尽早更新页面。但是还有一点小瑕疵，由于两次任务之间还是会有一点点的时间间隔，执行数量众多的任务时，这些间隔的时间就会累加起来，就会有几毫秒的差异。作为一个有追求有理想的专业切图仔，我们是不允许有这种时间消耗的

## 任务切片：争取一次宏任务事件执行更多的任务

在上一节中，我们额外消耗的时间等于两次宏任务之间的时间间隔 \* 工作的数量：

```js
额外消耗的时间 = 两次宏任务之间的时间间隔 * works.length;
```

显然，我们无法控制两次宏任务之间的时间间隔，但是我们可以减少触发宏任务事件的次数。我们可以通过在一次宏任务事件中执行更多的工作来达到这个目的。同时，我们一次宏任务事件的执行耗时又不能超过 1 帧的时间(16.6ms)，毕竟我们需要留点时间给浏览器绘制页面

**因此，我们需要在一次宏任务事件中尽可能多的执行工作，同时又不能长时间占用浏览器。**这次，我们需要将任务拆分成几小段执行，即任务切片。既然一帧 16.6 毫秒，我们执行一次工作需要 2 毫秒，那我们只需要在一次宏任务事件中执行 7 个工作就好，这样浏览器还有 2.6 毫秒绘制页面。

```js
let works = [];
for (let i = 0; i < 3000; i++) {
  works.push(() => {
    const start = new Date().getTime();
    while (new Date().getTime() - start < 2) {}
  });
}
const btn = document.getElementById("btn");
const animate = document.getElementById("animation");

var channel = new MessageChannel();
var port = channel.port2;
channel.port1.onmessage = workLoop;

let endTime;
let startTime;
btn.onclick = () => {
  startTime = performance.now();
  port.postMessage(null);
};
function workLoop() {
  let i = 0;
  while (i < 7) {
    let work = works.shift();
    if (work) {
      work();
      i++;
    } else {
      const endTime = performance.now();
      animate.innerHTML = endTime - startTime;
      i = 7; // 没有剩余工作就直接退出循环
    }
  }
  if (works.length) {
    port.postMessage(null);
  }
}
```

效果如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-07.jpg)
