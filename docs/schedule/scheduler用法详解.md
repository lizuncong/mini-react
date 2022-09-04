> 本章是手写 React Scheduler 源码系列的第二篇文章，第一篇查看[哪些 API 适合用于任务调度](./%E5%93%AA%E4%BA%9BAPI%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6.md)。React Scheduler 是 react 提供的一个可以独立使用的包，即可以单独使用。由于 React 官网对于这个包的用法介绍较少，因此本章全面介绍 react scheduler 的基本用法，熟练使用是阅读源码的前提，本章对于后续的源码阅读有很大的帮助

## 学习目标

- scheduler 基础用法
- 高优先级任务如何插队
- 长任务如何切片
- 任务切片如何中途取消
- 任务过期

如果本篇文章所有的 demo 的输出顺序都能理清楚，那说明你已经彻底搞懂了 React Scheduler 的用法

## 准备工作

新建 html 文件，用于测试 scheduler 的用法，如无特别说明，本节将使用下面的`printA`、`printB`、`printC`、`printD`、`printE`方法

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>schedule用法</title>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <script src="./schedule.js"></script>
  </head>

  <body>
    <div id="animation">
      <div>Scheduler</div>
    </div>
    <script>
      function printA(didTimeout) {
        const start = new Date().getTime();
        while (new Date().getTime() - start < 7) {}
        console.log("A didTimeout：", didTimeout);
      }
      function printB(didTimeout) {
        const start = new Date().getTime();
        while (new Date().getTime() - start < 3) {}
        console.log("B didTimeout：", didTimeout);
      }
      function printC(didTimeout) {
        const start = new Date().getTime();
        while (new Date().getTime() - start < 4) {}
        console.log("C didTimeout：", didTimeout);
      }
      function printD(didTimeout) {
        const start = new Date().getTime();
        while (new Date().getTime() - start < 7) {}
        console.log("D didTimeout：", didTimeout);
      }
      function printE(didTimeout) {
        const start = new Date().getTime();
        while (new Date().getTime() - start < 10) {}
        console.log("E didTimeout：", didTimeout);
      }
    </script>
  </body>
</html>
```

[schedule.js](./schedule.js)文件可以在[这里](./schedule.js)获取

## Scheduler 简介

Scheduler 是 React 提供的调度器，当我们通过`unstable_scheduleCallback(NormalPriority, task)`调度任务时，Scheduler 会将我们的 task 存到一个数组`taskQueue`中，然后启动一个宏任务（类似于 setTimeout 定时器）。在宏任务事件中，Scheduler 会遍历`taskQueue`取出每一个 task 执行，每执行完一个 task，都需要判断执行时间是否超过 5 毫秒，如果超过了 5 毫秒，则主动让出控制权，剩下的任务在下一个事件循环中处理。如果没超过 5 毫秒，则在当前事件中继续执行下一个 task。**这里，你可以简单理解为，Scheduler 为每个宏任务事件的执行时间设定的最大执行时间是 5 毫秒**，比如：

```js
setTimeout(() => {
  performWork();
}, 0);
```

在每一个事件循环中，`performWork`的执行时间最大是 5 毫秒，超过 5 毫秒则主动让出控制权。

Scheduler 支持任务按优先级排序执行，优先级通过`过期时间`体现，比如 `ImmediatePriority` 对应的过期时间是 `-1毫秒`，需要立即执行。

同时 Scheduler 还支持对单个 task 进行切片，这也正是 React concurrrent 模式采用的方式。

```js
var ImmediatePriority = 1; // 对应的过期时间：IMMEDIATE_PRIORITY_TIMEOUT -1毫秒 立即执行
var UserBlockingPriority = 2; // 对应的过期时间：USER_BLOCKING_PRIORITY_TIMEOUT 250毫秒 后过期
var NormalPriority = 3; // 对应的过期时间：NORMAL_PRIORITY_TIMEOUT 5000毫秒 后过期
var LowPriority = 4; // 对应的过期时间：LOW_PRIORITY_TIMEOUT 10000毫秒 后过期
var IdlePriority = 5; // 对应的过期时间：IDLE_PRIORITY_TIMEOUT maxSigned31BitInt永不过期
```

## Scheduler 用法

### 1.相同优先级

相同优先级的任务按照调度的顺序执行

```js
unstable_scheduleCallback(NormalPriority, printA);
unstable_scheduleCallback(NormalPriority, printB);
unstable_scheduleCallback(NormalPriority, printC);
unstable_scheduleCallback(NormalPriority, printD);
unstable_scheduleCallback(NormalPriority, printE);
```

可以看到，控制台依次按顺序输出：A、B、C、D、E

performance 查看调用栈信息：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/scheduler-01.jpg)

### 2.取消某个任务

可以通过 unstable_cancelCallback 取消某个任务

```js
const callbackA = unstable_scheduleCallback(NormalPriority, printA);
unstable_scheduleCallback(NormalPriority, printB);
unstable_scheduleCallback(NormalPriority, printC);
unstable_scheduleCallback(NormalPriority, printD);
unstable_scheduleCallback(NormalPriority, printE);
unstable_cancelCallback(callbackA);
```

控制台依次按顺序输出：

```js
B didTimeout： false
C didTimeout： false
D didTimeout： false
E didTimeout： false
```

### 3.不同优先级，高优先级先执行

```js
unstable_scheduleCallback(IdlePriority, printA);
unstable_scheduleCallback(LowPriority, printB);
unstable_scheduleCallback(NormalPriority, printC);
unstable_scheduleCallback(UserBlockingPriority, printD);
unstable_scheduleCallback(ImmediatePriority, printE);
```

控制台依次按顺序输出：

```js
E didTimeout： true
D didTimeout： false
C didTimeout： false
B didTimeout： false
A didTimeout： false
```

由于`ImmediatePriority`对应的过期时间是`-1`毫秒，因此 printE 任务是立即过期的，所以输出的 didTimeout 为 true

### 4.任务超时

任务超时是指执行任务的开始时间(currentTime)大于等于任务的过期时间(expirationTime)。

比如当我们调用`unstable_scheduleCallback(UserBlockingPriority, printB)`时，任务 B 的过期时间计算方式如下：

```js
//调用unstable_scheduleCallback添加任务的当前时间 + 优先级对应的过期时间;
expirationTime = currentTime + timeout;
```

其中，currentTime 等于调用 unstable_scheduleCallback 添加任务的当前时间。timeout 是任务优先级对应的过期时间，这里 UserBlockingPriority 对应的 timeout 为 250 毫秒

#### 简单的超时任务

```js
function printA(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("A didTimeout：", didTimeout);
}
const taskA = unstable_scheduleCallback(NormalPriority, printA);
const currentTime = performance.now();
console.log(taskA);
console.log(currentTime);
const start = new Date().getTime();
while (new Date().getTime() - start < 4999) {}
```

在本例中，taskA 的过期时间是 currentTime + 5000 毫秒。由于主线程执行了 4999 毫秒后，才开始执行 printA，此时 printA 还没超时。但如果我们将主线程执行时间改成 5000 毫秒，比如：

```js
while (new Date().getTime() - start < 5000) {}
```

taskA 开始执行时，就已经超时了

#### 不同优先级任务的超时时间

```js
function printA(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("A didTimeout：", didTimeout);
}
function printB(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("B didTimeout：", didTimeout);
}
function printC(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("C didTimeout：", didTimeout);
}
const taskA = unstable_scheduleCallback(NormalPriority, printA);
const taskB = unstable_scheduleCallback(UserBlockingPriority, printB);
const taskC = unstable_scheduleCallback(UserBlockingPriority, printC);
console.log(taskA);
console.log(taskB);
console.log(taskC);
const start = new Date().getTime();
while (new Date().getTime() - start < 248) {}
```

在本例中，很明显 UserBlockingPriority > NormalPriority，任务肯定是按照 B -> C -> A 的顺序执行，那哪些任务会超时呢？

这里我们将 taskA、taskB、taskC 打印出来：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/scheduler-02.jpg)

由于主线程有个耗时 248 毫秒的任务，这个任务执行完后，才开始执行 taskB，此时的 taskB 还没过期。但是 taskB 耗时 100 毫秒，下一个执行 taskC 时，taskC 的执行开始时间就是 248 + 100，很明显 taskC 超时了。由于 taskA 需要 5000 毫秒才超时，时间足够，所以 taskA 不会超时。

如果我们希望让 taskA 超时，应该怎么做呢？很简单，我们可以简单的让 taskC 执行的时间再长一点：

```js
function printA(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("A didTimeout：", didTimeout);
}
function printB(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("B didTimeout：", didTimeout);
}
function printC(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 4652) {}
  console.log("C didTimeout：", didTimeout);
}
const taskA = unstable_scheduleCallback(NormalPriority, printA);
const taskB = unstable_scheduleCallback(UserBlockingPriority, printB);
const taskC = unstable_scheduleCallback(UserBlockingPriority, printC);
const currentTime = performance.now();
console.log(taskA);
console.log(taskB);
console.log(taskC);
console.log(currentTime);
const start = new Date().getTime();
while (new Date().getTime() - start < 248) {}
```

这里，taskA 开始执行的时间就是 `currentTime + 248 + 100 + 4652`，很明显 taskA 超时了。控制台打印如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/scheduler-03.jpg)

### 5.任务切片

scheduler 在每一次事件循环中，会每隔 5ms 主动交出控制权给浏览器。也就是说，每一次事件循环执行的任务都不应超过 5ms。对于某个超长的任务，我们可以将其拆分成一小段执行

在下面的例子中

```js
const tasks = [
  ["C1", 4],
  ["C2", 6],
  ["C3", 7],
];
const printC = () => {
  while (tasks.length > 0) {
    const [label, ms] = tasks.shift();
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
    console.log(label);
  }
};

unstable_scheduleCallback(NormalPriority, printC);
```

可以发现，printC 执行的总耗时为 4 + 6 + 7 = 17 毫秒。几乎占用了一帧的时间。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/scheduler-04.jpg)

我们可以将这个任务拆分成几小段执行，比如：

```js
const tasks = [
  ["C1", 4],
  ["C2", 6],
  ["C3", 7],
];
const printC = () => {
  while (tasks.length > 0) {
    const [label, ms] = tasks.shift();
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
    console.log(label);
    if (unstable_shouldYield()) {
      console.log("yield：交出控制权");
      didYield = true;
      return printC;
    }
  }
};

unstable_scheduleCallback(NormalPriority, printC);
```

控制台输出：

```js
C1
C2
yield：交出控制权
C3
yield：交出控制权
```

分成了两段执行，第一段是因为执行 C1 时只用了 4 毫秒，还没达到 5 毫秒的间隔，因此不需要让出控制权，继续执行 C2，由于 C1+C2 总耗时 10 毫秒，此时需要让出控制权，在下一个事件循环中再执行 C3

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/scheduler-05.jpg)

再来看下面的例子

```js
function printA(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("A didTimeout：", didTimeout);
}
function printB(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("B didTimeout：", didTimeout);
}
function printD(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("D didTimeout：", didTimeout);
}
function printE(didTimeout) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("E didTimeout：", didTimeout);
}
const taskA = unstable_scheduleCallback(NormalPriority, printA);
const taskB = unstable_scheduleCallback(NormalPriority, printB);
let didYield = false;
const tasks = [
  ["C1", 5.1],
  ["C2", 100],
  ["C3", 100],
];
const printC = () => {
  while (tasks.length > 0) {
    const [label, ms] = tasks.shift();
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
    console.log(label);
    if (unstable_shouldYield()) {
      console.log("yield：交出控制权");
      didYield = true;
      return printC;
    }
  }
};

unstable_scheduleCallback(NormalPriority, printC);
unstable_scheduleCallback(NormalPriority, printD);
unstable_scheduleCallback(NormalPriority, printE);
```

控制台输出：

```js
A didTimeout： false
B didTimeout： false
C1
yield：交出控制权
C2
yield：交出控制权
C3
yield：交出控制权
D didTimeout： false
E didTimeout： false
```

这里每一个任务执行都耗时 100 毫秒，因此每一个任务执行完成都需要将控制权交回给浏览器

### 6.任务切片 & 过期时间

```js
const tasks = [
  ["C1", 125],
  ["C2", 120],
  ["C3", 100],
  ["C4", 100],
];
const printC = (didTimeout) => {
  console.log("work didTimeout", didTimeout);
  while (tasks.length > 0) {
    const [label, ms] = tasks.shift();
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
    console.log(label);
    if (tasks.length && unstable_shouldYield()) {
      return printC;
    }
  }
};

const taskC = unstable_scheduleCallback(UserBlockingPriority, printC);
```

在本例中，taskC 是一个 UserBlockingPriority 优先级的任务，因此它 250 毫秒后过期。在执行 C1、C2 后的时间为 245 毫秒，因此在执行 C3 时，还没过期，当执行 C4 时，很明显 C4 绝对过期了。控制台打印：

```js
work didTimeout false
C1
work didTimeout false
C2
work didTimeout false
C3
work didTimeout true
C4
```

### 7.任务切片 & 高优先级任务插队

如果在执行某个切片任务的过程中，有更高优先级的任务插入，则优先执行高优先级任务。在本例中，在执行 `C1`时调度了一个更高优先级的任务`printB`

```js
function printB() {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("B");
}

const tasks = [
  ["C1", 100],
  ["C2", 100],
  ["C3", 100],
  ["C4", 100],
];
const printC = (didTimeout) => {
  while (tasks.length > 0) {
    const [label, ms] = tasks.shift();
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
    console.log(label);
    if (label === "C1") {
      // 高优先级任务插队
      unstable_scheduleCallback(UserBlockingPriority, printB);
    }
    if (tasks.length > 0 && unstable_shouldYield()) {
      return printC;
    }
  }
};
const taskC = unstable_scheduleCallback(NormalPriority, printC);
```

控制台输出：

```js
C1;
B;
C2;
C3;
C4;
```

当然我们也可以通过一个宏任务调度一个更高优先级的任务：

```js
function printB() {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("B");
}

const tasks = [
  ["C1", 100],
  ["C2", 100],
  ["C3", 100],
  ["C4", 100],
];
const printC = (didTimeout) => {
  while (tasks.length > 0) {
    const [label, ms] = tasks.shift();
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
    console.log(label);
    if (tasks.length > 0 && unstable_shouldYield()) {
      return printC;
    }
  }
};
const taskC = unstable_scheduleCallback(NormalPriority, printC);
setTimeout(() => {
  unstable_scheduleCallback(UserBlockingPriority, printB);
}, 0);
```

这个效果和上面是一样的

### 8.任务切片中途取消

```js
const tasks = [
  ["C1", 100],
  ["C2", 100],
  ["C3", 100],
  ["C4", 100],
];
const printC = (didTimeout) => {
  while (tasks.length > 0) {
    const [label, ms] = tasks.shift();
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
    console.log(label);
    if (tasks.length > 0 && unstable_shouldYield()) {
      return printC;
    }
  }
};
const taskC = unstable_scheduleCallback(NormalPriority, printC);
// 如果注释掉下面的代码，则控制台输出 C1、C2、C3、C4
setTimeout(() => {
  unstable_cancelCallback(taskC);
}, 0);
```

控制台只输出一个 `C1`

### 9.相同优先级的任务插队

相同优先级的任务插队，会追加到任务队列后面执行

```js
function printA() {
  console.log("A");
}
function printB() {
  console.log("B");
  unstable_scheduleCallback(ImmediatePriority, printC);
}
function printC() {
  console.log("C");
}
function printD() {
  console.log("D");
}
unstable_scheduleCallback(ImmediatePriority, printA);
unstable_scheduleCallback(ImmediatePriority, printB);
unstable_scheduleCallback(ImmediatePriority, printD);
```

控制台输出：A、B、D、C

### 10.延迟执行任务

调用 unstable_scheduleCallback 时可以通过第三个参数的 delay 指定任务延迟多久才执行

```js
function printA() {
  console.log("A");
}
unstable_scheduleCallback(NormalPriority, printA, { delay: 5000 });
```

本例中，控制台 5 秒后才打印 A

### 11.普通任务和延迟任务

```js
function printA() {
  console.log("A delayed task");
}
function printB() {
  console.log("B delayed task");
}
function printC() {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("C");
}
function printD() {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("D");
}
function printE() {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("E");
}
function printF() {
  const start = new Date().getTime();
  while (new Date().getTime() - start < 100) {}
  console.log("F");
}
unstable_scheduleCallback(UserBlockingPriority, printA, { delay: 300 });
unstable_scheduleCallback(UserBlockingPriority, printB, { delay: 100 });

unstable_scheduleCallback(NormalPriority, printC);
unstable_scheduleCallback(NormalPriority, printD);
unstable_scheduleCallback(NormalPriority, printE);
unstable_scheduleCallback(NormalPriority, printF);
```

控制台打印：

```js
C
B delayed task
D
E
A delayed task
F
```

可以想下为什么

### 12.任务切片和延迟任务

```js
function printA() {
  console.log("A delayed task");
}
function printB() {
  console.log("B delayed task");
}
unstable_scheduleCallback(UserBlockingPriority, printA, { delay: 300 });
unstable_scheduleCallback(UserBlockingPriority, printB, { delay: 100 });

const tasks = [
  ["C1", 100],
  ["C2", 100],
  ["C3", 100],
  ["C4", 100],
];
function printC() {
  while (tasks.length > 0) {
    const task = tasks.shift();
    const [label, ms] = task;
    const start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
    console.log(label);
    if (tasks.length > 0) {
      return printC;
    }
  }
}
unstable_scheduleCallback(NormalPriority, printC);
```

控制台输出：

```js
C1
B delayed task
C2
C3
A delayed task
C4
```
