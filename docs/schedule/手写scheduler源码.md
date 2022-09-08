> 本章是手写 React Scheduler 异步任务调度源码系列的第三篇文章，前两篇可以点击下面链接查看：1.[哪些 API 适合用于任务调度](./%E5%93%AA%E4%BA%9BAPI%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6.md)。2.[scheduler 用法详解](./scheduler%E7%94%A8%E6%B3%95%E8%AF%A6%E8%A7%A3.md)。来看看为啥采用 MessageChannel 而不是 setTimeout 等 api 实现异步任务调度。任务切片，时间切片这些概念听着吓人，但原理其实很简单。实际上这篇文章不需要 react 背景即可看懂，给我们提供了一种解决耗时长的任务的思路。

## 学习目标

- 同步更新 & 异步更新
- 为什么不使用 setTimeout
- 为什么使用 Message Channel
- 任务切片
- 时间切片

## 前置基础知识

如果对 `requestAnimationFrame`、`requestIdleCallback`、`setTimeout`、`MessageChannel`、`MutationObserver`、`Promise`等 API 还不熟悉的，可以先看[这篇文章](./%E5%93%AA%E4%BA%9BAPI%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6.md)熟悉一下。如果对 React Scheduler 用法还不熟悉的，可以先看[这篇文章](./scheduler%E7%94%A8%E6%B3%95%E8%AF%A6%E8%A7%A3.md)熟悉一下。当然，不看也不影响理解本章的内容

## 故事从一个动画开始

这天，老板让小李开发一个放大缩小的无限循环的动画。这是老板的一句话需求，没有 UI 也没有需求文档。那既然是一句话需求，小李也就三两句代码就实现了：

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
    <script>
      const btn = document.getElementById("btn");
      const animate = document.getElementById("animation");
    </script>
  </body>
</html>
```

呐，老板，我实现了，效果如下，小李开心的说。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-01.jpg)

老板看了看，摇了摇头，这是啥玩意啊

## 同步更新页面

老板说了，他有一组任务，点击按钮的时候，需要遍历执行完这组任务，统计全部任务执行完成的耗时，然后更新到页面。每个任务执行耗时差不多 2ms，如下：

```js
let works = [];
for (let i = 0; i < 3000; i++) {
  works.push(() => {
    const start = new Date().getTime();
    while (new Date().getTime() - start < 2) {}
  });
}
```

小李看了看，老板的需求总是这么简单，不到 2 秒，小李已经实现了如下：

```js
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

小李屁颠屁颠的跑过去给老板看效果：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-02.jpg)

老板心想小伙子能力不错，10 点钟给的需求，10:02 分就已经完成了，真是一个有(压榨)潜力的员工。于是老板满心欢喜的点了下按钮。结果，过了差不多 6 秒页面才更新，同时页面卡死了。。。再次点击按钮都点不了。老板的脸渐渐黑化，这又是啥玩意，赶紧优化一下

### 问题分析

失望的小李分析了下，点击按钮时，这组任务是同步执行的，所有任务执行完成，总共耗时差不多 6 秒，而在这个过程中，js 引擎一直占用着控制权，浏览器无法绘制页面，也无法响应用户，用户体验相当不好，怪不得老板的脸黑了。所以，这组耗时长的任务不应该同步执行

## 使用 setTimeout 异步更新页面

这次，小李打算使用异步的方式执行任务，将任务放到 setTimeout 定时器里面执行。为了不长时间占用主线程，阻塞浏览器渲染，小李将任务拆分到定时器执行，每个定时器执行一个任务。每执行一次都判断 works 是否全部执行完成，如果全部执行完成，则更新页面。每执行完一次任务，都主动将控制权让出给浏览器。这次，小李花了 10 分钟整改了下代码：

```js
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

小李这次不太敢屁颠屁颠的去找老板了，转而悄咪咪地过去。老板以为会有惊喜，立马点击按钮，这次页面动画终于不卡顿了，老板似乎看到了希望，嘴角微微上扬，然而等了差不多 19 秒的时间，页面才更新。这又是啥玩意啊，老板突然歇斯底里。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-03.jpg)

小李确实大意了，在上一次的时候，任务执行总耗时才 6000 毫秒，每个任务执行耗时 2 毫秒，3000 个任务，最多也就 6000 毫秒，为啥这次执行耗时 19266 毫秒，远比之前多出了 13266 毫秒？

小李看了下 Performance。虽然使用了`setTimeout(workLoop, 0)`0 毫秒的时间间隔，但是浏览器依然会有 4 到 5 毫秒的间隔时间。如果两次 setTimeout 之间最少间隔 4 毫秒，都有至少 3000 \* 4 = 12000 毫秒的耗时了。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-04.jpg)

### 问题分析

即使`setTimeout(workLoop, 0)`设置了 0 毫秒的时间间隔，但浏览器也会有至少 4 到 5 毫秒的延迟。在执行一组数量不限的任务时，这个耗时是不容忽视的。**作为一个专业的前端切图仔，我们在追求页面动画流畅、不卡顿的同时，应该还要快速响应用户的输入从而快速更新页面**。显然，setTimeout 由于 4 毫秒间隔的原因，不适用于我们的场景。那还有哪些 API 既可以出发宏任务事件，两次宏任务之间间隔有非常短呢？小李想起了在[哪些 API 适用于任务调度](https://github.com/lizuncong/mini-react/blob/master/docs/schedule/%E5%93%AA%E4%BA%9BAPI%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6.md)一文中学到的知识，`MessageChannel`在一帧内的调用频率超高，且两次调用的时间间隔极短。于是小李决定尝试一下这个 API

> 不使用 Promise 或者 MutationObserver 等微任务 API 的原因是，微任务是在页面更新前全部执行完成的，效果和同步执行任务差不多。

## 使用 MessageChannel 异步更新页面

这次，小李使用 `MessageChannel` 触发一个宏任务，在宏任务事件中执行工作。每执行完一个工作，判断是否已经执行完全部的工作，如果是，则更新页面，否则调用`port.postMessage(null)`触发下一个宏任务，继续执行剩余的工作。

```js
var channel = new MessageChannel();
var port = channel.port2;
channel.port1.onmessage = workLoop;

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

这次小李学聪明了，自测了下，效果如下，可以发现耗时只用了 6090 毫秒！！！为什么会多出了 90 毫秒？观察 performance 可以看出，虽然两次宏任务之间间隔非常短，但也会导致额外的开销，累积起来就有了几毫秒的差异。不过，这已经很贴近 6000 毫秒的执行耗时了，优势远胜于 setTimeout

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-05.jpg)

可以看到一帧之内浏览器的绘制时间，以及 message channel 触发的次数

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-06.jpg)

注意，这里的执行耗时也会受机器性能的影响，目前小李在多台电脑上尝试了下，一样的代码，执行耗时不太一样。当然不影响我们理解 schedule 的原理。在同一台电脑上跑，有时候耗时也不一样，比如：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-07.jpg)

老板终于满意了

### 问题分析

这次，小李能够同时兼顾页面动画流畅、不卡顿以及快速响应用户输入，尽早更新页面。但是还有一点小瑕疵，由于两次任务之间还是会有一点点的时间间隔，执行数量众多的任务时，这些间隔的时间就会累加起来，就会有几毫秒的额外开销。作为一个有追求有理想的专业切图仔，小李是不允许有这种时间消耗的

## 任务切片：一次宏任务事件尽可能执行更多的任务

在上一节中，额外消耗的时间等于两次宏任务之间的时间间隔 \* 工作的数量：

```js
额外消耗的时间 = 两次宏任务之间的时间间隔 * works.length;
```

显然，我们无法控制两次宏任务之间的时间间隔，但是我们可以减少触发宏任务事件的次数。可以通过在一次宏任务事件中执行更多的任务来达到这个目的。同时，一次宏任务事件的执行耗时又不能超过 1 帧的时间(16.6ms)，毕竟我们需要留点时间给浏览器绘制页面

**因此，我们需要在一次宏任务事件中尽可能多的执行任务，同时又不能长时间占用浏览器。**为了达到这个目的，小李将任务拆分成几小段执行，即**任务切片**。既然一帧 16.6 毫秒，执行一次任务需要 2 毫秒，那只需要在一次宏任务事件中执行 7 个任务就好，这样浏览器还有 2.6 毫秒绘制页面。

```js
var channel = new MessageChannel();
var port = channel.port2;
channel.port1.onmessage = workLoop;

let startTime;
btn.onclick = () => {
  startTime = new Date().getTime();
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
      const endTime = new Date().getTime();
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

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-08.jpg)

放大每一帧可以看到：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-09.jpg)

### 问题分析

这次，小李采用任务切片的方法极大减少了触发 message channel 的次数，减少了宏任务之间调度的额外消耗。但是这里还有个问题，任务切片的一个前提是，每个任务执行耗时是确定的，比如这里是 2 毫秒，但真实的业务场景是无法知道任务的执行耗时的，因此我们很难判断该如何将任务进行切片，本例中我们采用的是 7 个任务一个片段，那如果一个任务的执行耗时不确定，我们又怎么设置这个片段的大小？可想而知，任务切片虽然理想，但不太现实

## 时间切片

我们来探讨一种时间切片的方式。我们知道浏览器一帧只有 16.6ms，同时我们的工作执行耗时又不是确定的。那我们是不是可以，将一次宏任务的执行时间尽可能的控制在一定的时间内，比如 5ms。在当前的宏任务事件内，我们循环执行我们的工作任务，每完成一个工作任务，都判断执行时间是否超出了 5 毫秒，如果超出了 5 毫秒，则不继续执行下一个工作任务，结束本轮宏任务事件，**主动让出控制权**给浏览器绘制页面。如果没有超过 5 毫秒，则继续执行下一个工作任务。

实现如下：

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
const yieldInterval = 5; // 单位毫秒
function workLoop() {
  const currentEventStartTime = new Date().getTime();
  let work = works.shift();
  while (work) {
    work();
    // 执行完当前工作，则判断时间是否超过5ms，如果超过，则退出while循环
    if (new Date().getTime() - currentEventStartTime > yieldInterval) {
      // 执行耗时超过了5ms，结束本轮事件，主动让出控制权给浏览器绘制页面或者执行其他操作
      break;
    }
    work = works.shift();
  }
  // 如果还有剩余的工作，则放到下一个事件中处理
  if (works.length) {
    port.postMessage(null);
  } else {
    const endTime = new Date().getTime();
    animate.innerHTML = endTime - startTime;
  }
}
```

效果如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-10.jpg)

放大每一帧可以看到，每一个宏任务事件执行时间大约 5-6ms。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-11.jpg)

### 问题分析

这次，我们采用时间切片的方式，每个宏任务事件最多执行 5ms，超过 5ms 则主动结束执行，让出控制权给浏览器。时间切片的好处就是我们不用关心每个任务的执行耗时。比如，这里我用随机的方法，让每个工作任务执行耗时在 0-1 毫秒之间。

```js
let works = [];
for (let i = 0; i < 3000; i++) {
  works.push(() => {
    const start = performance.now();
    const time = Math.random();
    while (performance.now() - start < time) {}
  });
}
```

效果如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-12.jpg)

放大每一帧可以看到：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-13.jpg)

至此，似乎我们的目标已经达成：在尽可能短的时间内完成耗时长的一组工作任务，同时又不会长时间占用浏览器，让浏览器处理高优先级的任务，比如响应用户输入、绘制页面等

## 小结

到目前为止，效果还是很不错的。小李收获了以下知识：

- 耗时长的同步任务会长时间占用浏览器导致无法响应用户输入，页面卡顿等问题
- setTimeout 由于有至少 4 毫秒的延迟，因此不适合用于异步任务的调度
- MessageChannel 在一帧的时间内调用频率超高，两次 message channel 宏任务事件之间的间隔开销极少，适合用于异步任务的调度。
- 由于无法提前得知任务执行时间，从而无法计算一帧之内应该执行几个任务，所以任务切片不太适用于一帧内调度异步任务。
- 时间切片是比较理想的选择

小李决定将这个小工具开源

## 开源第一步

首先需要将 Message Channel 触发宏任务事件封装成一个方法 requestHostCallback，使用 performWorkUntilDeadline 监听 Message Channel 事件。理想情况下，performWorkUntilDeadline 的执行时间不应该超过 yieldInterval，即 5 毫秒。在开始执行 performWorkUntilDeadline 前获取当前时间，然后根据 deadline = currentTime + yieldInterval 计算出本次事件 performWorkUntilDeadline 的截止执行时间。

如果 scheduledHostCallback 返回 true，说明还有剩余的工作没完成，则调度下一个宏任务事件执行剩余的工作。

```js
const yieldInterval = 5;
let deadline = 0;
const channel = new MessageChannel();
let port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;
// 触发message channel事件执行时，会调用performWorkUntilDeadline，在开始执行
// performWorkUntilDeadline时获取当前的时间，计算performWorkUntilDeadline的截止时间
function performWorkUntilDeadline() {
  if (scheduledHostCallback) {
    // 当前宏任务事件开始执行
    let currentTime = new Date().getTime();
    // 计算当前宏任务事件结束时间
    deadline = currentTime + yieldInterval;
    const hasMoreWork = scheduledHostCallback(currentTime);
    if (!hasMoreWork) {
      scheduledHostCallback = null;
    } else {
      // 如果还有工作，则触发下一个宏任务事件
      port.postMessage(null);
    }
  }
}
function requestHostCallback(callback) {
  scheduledHostCallback = callback;
  port.postMessage(null);
}
```

其次，我们需要暴露一个 scheduleCallback 方法给用户添加任务，用户添加的任务保存在 taskQueue 中。然后触发一个 message channel 事件，异步执行 taskQueue 中的任务。

注意，这里面并不是每调用一次 scheduleCallback 都触发一个 message channel 事件，而是先将添加的任务保存在 taskQueue 中，只触发一次 message channel 事件，然后在异步的事件中执行数组中的任务即可。

```js
let taskQueue = [];
let isHostCallbackSchedule = false;
function scheduleCallback(callback) {
  let newTask = {
    callback: callback,
  };
  taskQueue.push(newTask);
  // 这里需要加个判断，避免触发多次事件。
  if (!isHostCallbackScheduled) {
    isHostCallbackScheduled = true;
    requestHostCallback(flushWork);
  }
  return newTask;
}
```

最后需要实现 flushwork 方法，在 workLoop 方法中，每执行一个工作，都需要判断当前 performWorkUntilDeadline 事件执行时间是否超过 5ms

```js
let currentTask = null;
function flushWork(initialTime) {
  return workLoop(initialTime);
}

function workLoop(initialTime) {
  currentTask = taskQueue[0];

  while (currentTask) {
    if (new Date().getTime() >= deadline) {
      // 每执行一个任务，都需要判断当前的performWorkUntilDeadline执行时间是否超过了截止时间
      break;
    }
    var callback = currentTask.callback;
    callback();

    taskQueue.shift();
    currentTask = taskQueue[0];
  }
  if (currentTask) {
    // 如果taskQueue中还有剩余工作，则返回true
    return true;
  } else {
    return false;
  }
}
```

然后我们就可以这样使用：

```js
const btn = document.getElementById("btn");
const animate = document.getElementById("animation");
let startTime;
btn.onclick = () => {
  startTime = new Date().getTime();
  for (let i = 0; i < 3000; i++) {
    if (i === 2999) {
      scheduleCallback(() => {
        // 这里，最后一次任务用于更新页面
        const start = new Date().getTime();
        while (new Date().getTime() - start < 2) {}
        const endTime = new Date().getTime();
        animate.innerHTML = endTime - startTime;
      });
    } else {
      scheduleCallback(() => {
        const start = new Date().getTime();
        while (new Date().getTime() - start < 2) {}
      });
    }
  }
};
```

以上就是 schedule 的简单实现。可以看出 scheduler 的原理其实真的很简单。任务调度就是通过 scheduleCallback 添加的一组任务，在 message channel 异步事件中处理。

我们来测试一下嵌套调用 scheduleCallback 的情况，这次我将 btn 的点击事件改成下面这样，在奇数项时，我会继续嵌套调用 scheduleCallback 添加任务。观察控制台可以发现完全按照预期输出

```js
btn.onclick = () => {
  for (let i = 0; i < 150; i++) {
    scheduleCallback(() => {
      sleep();
      if (i % 2) {
        scheduleCallback(() => {
          console.log("奇数", i);
        });
      }
      console.log("i", i);
    });
  }
};
```

现在看下通过定时器添加的任务，这里先在 for 循环中添加了 150 个任务，然后 1 秒后又添加一个。前面的 150 个任务 300 毫秒就可以执行完成，理论上 1 秒后打印“通过定时器添加的任务”，但观察控制台发现并没有打印，这是为啥？

```js
btn.onclick = () => {
  for (let i = 0; i < 150; i++) {
    scheduleCallback(() => {
      sleep();
      console.log("i", i);
    });
  }
  setTimeout(() => {
    scheduleCallback(() => {
      sleep();
      console.log("通过定时器添加的任务");
    });
  }, 1000);
};
```

这是因为我们在 scheduleCallback 中将 isHostCallbackScheduled 设置为 true，然后执行完全部工作时我们应该将其重置为 false。因此我们需要修改下 workLoop 的逻辑：

```js
function workLoop(initialTime) {
  currentTask = taskQueue[0];

  while (currentTask) {
    if (new Date().getTime() >= deadline) {
      // 当前的currentTask还没过期，但是当前宏任务事件已经到达执行的最后期限，即我们需要
      // 将控制权交还给浏览器，剩下的任务在下一个事件循环中再继续执行
      //console.log("yield");
      break;
    }
    var callback = currentTask.callback;
    callback();

    taskQueue.shift();
    currentTask = taskQueue[0];
  }
  if (currentTask) {
    // 如果taskQueue中还有剩余工作，则返回true
    return true;
  } else {
    isHostCallbackScheduled = false; // 重置为false
    return false;
  }
}
```

下一篇文章会继续实现优先级、延迟任务。
