> 本章是手写 React Scheduler 源码系列的第二篇文章，第一篇查看[哪些 API 适合用于任务调度](./%E5%93%AA%E4%BA%9BAPI%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6.md)。React Scheduler 是 react 提供的一个可以独立使用的包，可以单独使用。由于 React 官网对于这个包的用法介绍较少，因此本章全面介绍 react scheduler 的基本用法，熟练使用可以为后续手写源码奠定坚实的基础。

## 学习目标

- scheduler 基础用法
- 高优先级任务如何插队
- 长任务如何切片
- 任务切片如何中途取消
- 任务过期

本章 demo 几乎涵盖了 Scheduler 所有的用法，如果能理清所有 demo 的输出顺序，那恭喜你已经掌握了 Scheduler 的用法

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

Scheduler 是 React 提供的调度器，它内部暴露`unstable_scheduleCallback(priorityLevel, callback, options)`方法给我们调度任务，其中`priorityLevel`是调度的优先级，callback 是我们的任务，optoins 里面可以通过指定`delay`延迟执行我们的任务。Scheduler 支持任务按优先级排序执行，优先级通过`过期时间`体现，比如 `ImmediatePriority` 对应的过期时间是 `-1毫秒`，需要立即执行。

```js
var ImmediatePriority = 1; // 对应的过期时间：IMMEDIATE_PRIORITY_TIMEOUT -1毫秒 立即执行
var UserBlockingPriority = 2; // 对应的过期时间：USER_BLOCKING_PRIORITY_TIMEOUT 250毫秒 后过期
var NormalPriority = 3; // 对应的过期时间：NORMAL_PRIORITY_TIMEOUT 5000毫秒 后过期
var LowPriority = 4; // 对应的过期时间：LOW_PRIORITY_TIMEOUT 10000毫秒 后过期
var IdlePriority = 5; // 对应的过期时间：IDLE_PRIORITY_TIMEOUT maxSigned31BitInt永不过期
```

`unstable_scheduleCallback`返回一个 task 对象，用于描述任务的基本信息：

```js
var newTask = {
  id: taskIdCounter++,
  callback: callback,
  priorityLevel: priorityLevel,
  startTime: startTime,
  expirationTime: expirationTime,
  sortIndex: -1,
};
```

`startTime` 是`当前调用unstable_scheduleCallback的时间 + options.delay(如果有指定的话)`，即

```js
startTime = performance.now() + options.delay;
```

`expirationTime`是`startTime + timeout`计算出来的，不同优先级 timeout 不同，如果优先级是 UserBlockingPriority，则 timeout 为 250 毫秒，那么 expirationTime 计算如下：

```js
var expirationTime = startTime + 250;
```

对于`sortIndex`，是用于在队列中排序的，这里需要区分 task 的两种类型：

- 普通任务，不需要延迟执行，加入队列后就直接开始调度执行，这种任务存储在 taskQueue 中，**同时按照 expirationTime 排序，expirationTime 最小的优先级最高，最先执行**
- 延迟任务，需要延迟执行，加入队列后需要在指定的 delay 才开始调度执行，这种任务存储在 timerQueue 中，**同时按照 startTime 排序，startTime 最小的需要最先调度执行**

因此，对于延迟任务，`sortIndex`存的就是`startTime`。对于普通任务，`sortIndex`存的就是`expirationTime`

我们通过`unstable_scheduleCallback(NormalPriority, task)`调度任务时，scheduler 会根据 options.delay 决定 task 是存入 taskQueue 还是 timerQueue 中。为便于描述，这里我简单使用 setTimeout 代替源码中的 MessageChannel 描述这两个任务的执行时机的区别：

```js
function unstable_scheduleCallback(priorityLevel, callback, options) {
  var currentTime = unstable_now();
  var startTime;

  if (typeof options === "object" && options !== null) {
    var delay = options.delay;
  } else {
    startTime = currentTime;
  }

  var timeout;

  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;

    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    // ...
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }

  var expirationTime = startTime + timeout;
  var newTask = {
    id: taskIdCounter++,
    callback: callback,
    priorityLevel: priorityLevel,
    startTime: startTime,
    expirationTime: expirationTime,
    sortIndex: -1,
  };

  if (startTime > currentTime) {
    // 延迟任务
    newTask.sortIndex = startTime;
    timerQueue.push(newTask);

    setTimeout(() => {
      // 启动一个定时器处理延迟任务
    }, options.delay);
  } else {
    newTask.sortIndex = expirationTime;
    taskQueue.push(newTask);

    setTimeout(() => {
      // 处理普通任务
    }, 0);
  }

  return newTask;
}
```

注意，这里用了两个时间间隔不一样的定时器区分普通任务和延迟任务的执行时机

延迟任务的定时器到期执行时，scheduler 会遍历 timerQueue 中的任务，找出那些到期需要执行的延迟任务，添加到 taskQueue 中。

对于 taskQueue 的处理，每执行完一个 task，都需要判断执行时间是否超过 5 毫秒，如果超过 5 毫秒，就主动交出控制权，剩下的 task 在下一个事件循环中再继续处理

同时 Scheduler 还支持对单个 task 进行切片，这也正是 React concurrrent 模式采用的方式。

## Scheduler 用法

### 1.相同优先级

相同优先级的任务按照调度的顺序执行。

```js
unstable_scheduleCallback(NormalPriority, printA);
unstable_scheduleCallback(NormalPriority, printB);
unstable_scheduleCallback(NormalPriority, printC);
unstable_scheduleCallback(NormalPriority, printD);
unstable_scheduleCallback(NormalPriority, printE);
```

可以看到，控制台依次按顺序输出：A、B、C、D、E

performance 查看调用栈信息。需要注意，`printA`等任务的执行耗时都是 100 毫秒，远远超过了 5 毫秒，因此每执行完一次 task，都需要让出控制权，这也是为啥我们在 performance 中看到这些任务是分段执行的原因

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/scheduler-01.jpg)

### 2.取消某个任务

可以通过 unstable_cancelCallback 取消某个任务，`unstable_cancelCallback`通过重置`task.callback = null`即可取消任务

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

### 3.不同优先级的任务，高优先级先执行

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

任务超时是指从任务开始加入队列到执行的这段时间是否超过了任务的优先级对应的超时时间 timeout。

比如当我们调用`unstable_scheduleCallback(UserBlockingPriority, printB)`时，`UserBlockingPriority`对应的超时时间为 250 毫秒。从调用 unstable_scheduleCallback 将 printB 加入队列，到 printB 执行的这段时间，如果超过了 250 毫秒，那么 printB 就超时了。否则就没有超时

printB 的过期时间计算方式如下：

```js
//调用unstable_scheduleCallback添加任务的当前时间 + 优先级对应的过期时间;
expirationTime = startTime + timeout;
```

其中，startTime 等于调用 unstable_scheduleCallback 添加任务的当前时间。timeout 是任务优先级对应的过期时间，这里 UserBlockingPriority 对应的 timeout 为 250 毫秒

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

scheduler 在每一次事件循环中处理任务，每执行完一个 task，都需要判断当前事件执行时间是否超过 5 毫秒。如果超过 5 毫秒，则主动让出控制权，剩下的 task 在下一次时间循环中处理。如果没超过 5 毫秒，则继续执行下一个 task。也就是说，每一次事件循环执行的任务都不应超过 5ms。对于某个超长的 task，我们可以将其拆分成一小段执行

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

我们可以将这个任务拆分成几小段执行，任务切片的原理如下：

- 首先将某个长任务 task 拆分成几小段，这需要一个合理的数据结构设计
- 通过 Scheduler 暴露的`unstable_shouldYield`判断当前执行时间是否超过了 5 毫秒，如果超过了就不继续执行下一小段任务
- 通过在 callback 中返回一个函数告诉 Scheduler 需要继续执行这个 task

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
      // 判断是否需要让出控制权
      console.log("yield：交出控制权");
      didYield = true;
      return printC; // 返回一个函数
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

## runWithPriority 用法

```js
function unstable_runWithPriority(priorityLevel, eventHandler) {
  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;

  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}
```

runWithPriority 就是在执行 eventHandler 前将 currentPriorityLevel 设置为 priorityLevel，在 eventHandler 执行完成后，又将 currentPriorityLevel 重设回原来的值。这样的意义在于，eventHandler 执行时，currentPriorityLevel 就是它对应的 priorityLevel

在 Scheduler 中，currentPriorityLevel 默认的值是 NormalPriority，即 3

```js
function unstable_wrapCallback(callback) {
  var parentPriorityLevel = currentPriorityLevel;
  return function () {
    // This is a fork of runWithPriority, inlined for performance.
    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = parentPriorityLevel;

    try {
      return callback.apply(this, arguments);
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  };
}
```

> 可以看出，调用`unstable_runWithPriority(Priority, callback)`会立即执行我们的 callback。在 callback 执行时，获取到的优先级(currentPriorityLevel)就是 Priority，callback 执行完之后才恢复成原来的优先级。调用`unstable_wrapCallback(callback)`时，会立即将当前的优先级(currentPriorityLevel)保存起来，然后返回一个函数，不论这个函数在任何时候调用我们的 callback，callback 内部访问到的优先级都是调用`unstable_wrapCallback(callback)`时保存的值

### runWithPriority & wrapCallback 的用法

```js
const wrappedNormalCallback = unstable_runWithPriority(NormalPriority, () => {
  // unstable_wrapCallback将当前的优先级保存起来，此时是NormalPriority，因此这里输出的值是3
  return unstable_wrapCallback(() => {
    console.log("【NormalWrap callback】", unstable_getCurrentPriorityLevel());
  });
});

const wrappedUserBlockingCallback = unstable_runWithPriority(
  UserBlockingPriority,
  () => {
    // unstable_wrapCallback将当前的优先级保存起来，此时是UserBlockingPriority，因此这里输出的值是2
    return unstable_wrapCallback(() => {
      console.log(
        "【UserBlocking callback】",
        unstable_getCurrentPriorityLevel()
      );
    });
  }
);

wrappedNormalCallback();
console.log("【after normal callback】", unstable_getCurrentPriorityLevel());

wrappedUserBlockingCallback();
console.log(
  "【after UserBlocking callback】",
  unstable_getCurrentPriorityLevel()
);
```

控制台输出：

```js
【NormalWrap callback】 3
【after normal callback】 3
【UserBlocking callback】 2
【after UserBlocking callback】 3
```

再来看下面嵌套调用 unstable_runWithPriority 的例子：

```js
let wrappedCallback;
let wrappedUserBlockingCallback;

unstable_runWithPriority(NormalPriority, () => {
  wrappedCallback = unstable_wrapCallback(() => {
    console.log(
      "【NormalPriority callback】",
      unstable_getCurrentPriorityLevel()
    );
  });
  wrappedUserBlockingCallback = unstable_runWithPriority(
    UserBlockingPriority,
    () =>
      unstable_wrapCallback(() => {
        console.log(
          "【UserBlockingPriority callback】",
          unstable_getCurrentPriorityLevel()
        );
      })
  );
});

wrappedCallback();
console.log("【after normal callback】", unstable_getCurrentPriorityLevel());
wrappedUserBlockingCallback();
console.log(
  "【after UserBlocking callback】",
  unstable_getCurrentPriorityLevel()
);
```

控制台输出：

```js
【NormalPriority callback】 3
【after normal callback】 3
【UserBlockingPriority callback】 2
【after UserBlocking callback】 3
```
