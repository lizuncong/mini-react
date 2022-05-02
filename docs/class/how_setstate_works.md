## setState 主流程及源码

本篇文章介绍以下知识点：

- `setState` 主流程及源码
- 类组件和函数组件 `fiber.memoizedState` 的区别
- 类组件编译后也是一个函数，`React` 是如何区分函数组件和类组件的

### demo

准备工作

- 在 `constructor` 中第一行添加 `debugger`，类组件 `Counter` 初始化时会调用构造函数
- 在 `handleClick` 中第一行添加 `debugger`，当我们点击按钮时，`setState` 主流程便从这里开始

```jsx
import React, { Component } from "react";
import ReactDOM from "react-dom";
class Counter extends Component {
  constructor(props) {
    debugger;
    super(props);
    this.state = {
      number: 0,
    };
  }
  handleClick = (event) => {
    debugger;
    this.setState({ number: 1 });
    this.setState({ number: 2 });
  };

  render() {
    console.log("render===", this.state);
    return <button onClick={this.handleClick}>{this.state.number}</button>;
  }
}

ReactDOM.render(<Counter />, document.getElementById("root"));
```

### React.Component

我们知道类组件一定要继承于 `React.Component` 或者 `React.PureComponent`，这两个类位于 `packages/react/src/ReactBaseClasses.js` 文件中，`React.Component` 做的事情很简单。下面一步一步 debug 一下

刷新页面，首先进入我们的构造函数断点处

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/setstate-02.jpg)

注意这个函数调用栈的顺序，可以在每个函数都打一个断点，多看几次类组件初始化的过程

点击下一步，进入 `super(props)` 函数，实际上就是我们的 `React.Component`

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/setstate-01.jpg)

这里有三个需要注意的地方：

- `this.updater = updater || ReactNoopUpdateQueue;`。当我们调用 `this.setState` 时，使用的就是 `this.updater.enqueueSetState`。这里只是简单的将 `this.updater` 初始化为空的 `ReactNoopUpdateQueue`。实际上真正的 `this.updater` 在 `react-dom` 中初始化。`react-dom`、`react-native` 等对于 `this.updater` 的实现都不尽相同。
- `Component.prototype.isReactComponent = {};` isReactComponent 用于后续在创建 `fiber` 节点时判断是不是类组件。如果函数原型存在 `isReactComponent` 则说明是类组件
- `Component.prototype.setState` 这是我们调用 `this.setState` 时的逻辑

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/setstate-03.jpg)

在创建 `fiber` 节点时需要判断当前组件是类组件还是函数组件
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/setstate-04.jpg)

`shouldConstruct` 实现如下：
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/setstate-05.jpg)

`React.Component` 的简单实现如下：

```js
const ReactNoopUpdateQueue = {
  isMounted: function (publicInstance) {
    return false;
  },
  enqueueForceUpdate: function (publicInstance, callback, callerName) {},
  enqueueReplaceState: function (
    publicInstance,
    completeState,
    callback,
    callerName
  ) {},
  enqueueSetState: function (
    publicInstance,
    partialState,
    callback,
    callerName
  ) {},
};
class Component {
  constructor(props, context, updater) {
    this.props = props;
    this.updater = updater || ReactNoopUpdateQueue;
    this.isReactComponent = {};
  }
  setState(partialState, callback) {
    this.updater.enqueueSetState(this, partialState);
  }
  forceUpdate(callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
  }
}
```

实际上真正的 `this.updater` 的初始化在 `adoptClassInstance` 方法中：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/setstate-06.jpg)

### 类组件和函数组件的 fiber.memoizedState 的区别

我们在[React.useReducer 原理及源码主流程](https://github.com/lizuncong/mini-react/blob/master/docs/hooks/how_useReducer_work.md)章节中已经知道，函数组件对应的 `fiber.memoizedState` 是用来保存 `hook` 链表的。

在类组件中，其对应的 `fiber.memoizedState` 保存的是上一次更新的 `this.state` 的值

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/setstate-07.jpg)

### 类组件的更新队列

在[React.useReducer 原理及源码主流程](https://github.com/lizuncong/mini-react/blob/master/docs/hooks/how_useReducer_work.md)中我们知道如果多次调用 `setCount`，更新的队列会保存在 `hook.queue` 链表中

在类组件中，如果我们连续调用多次

```js
this.setState({ number: 1 });
this.setState({ number: 2 });
this.setState({ number: 3 });
```

实际上更新队列保存在 `fiber.updateQueue`中，`fiber.updateQueue.shared.pending` 指向最后一个 `this.setState()` 生成的更新对象

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/setstate-08.jpg)

`fiber.updateQueue.shared` 和 `hook.queue` 一样也是环状链表

### 类组件初始化流程

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/setstate-09.jpg)

### setState 主流程及源码

调用 `this.setState` 时，实际上调用的是 `this.updater.enqueueSetState`

```jsx
function get(key) {
  return key._reactInternals;
}
function createUpdate(eventTime, lane) {
  var update = {
    eventTime: eventTime,
    lane: lane,
    tag: UpdateState,
    payload: null,
    callback: null,
    next: null,
  };
  return update;
}

// enqueueUpdate构造环状列表
function enqueueUpdate(fiber, update) {
  var updateQueue = fiber.updateQueue;

  if (updateQueue === null) {
    return;
  }

  var sharedQueue = updateQueue.shared;
  var pending = sharedQueue.pending;

  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }

  sharedQueue.pending = update;
}
function requestEventTime() {
  // 任务是有优先级的，优先级高的会打断优先级低的
  // 如果低优先级任务超时了，则优先级高的不能再打断优先级低的任务
  return performance.now(); // 程序从启动到现在的时间，是用来计算任务的过期时间的
}
var classComponentUpdater = {
  isMounted: isMounted,
  enqueueSetState: function (inst, payload, callback) {
    var fiber = get(inst);
    var eventTime = requestEventTime();
    var lane = requestUpdateLane(fiber);
    var update = createUpdate(eventTime, lane);
    update.payload = payload;

    if (callback !== undefined && callback !== null) {
      update.callback = callback;
    }
    enqueueUpdate(fiber, update);
    scheduleUpdateOnFiber(fiber, lane, eventTime);
  },
};

class Component {
  constructor() {
    // 这里为了简化流程，直接初始化this.updater为classComponentUpdater
    this.updater = classComponentUpdater;
  }
  setState(partialState, callback) {
    this.updater.enqueueSetState(this, partialState);
  }
}
```

主流程图：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/setstate-10.jpg)

`fiber.updateQueue` 会在下一个微任务中在 `processUpdateQueue` 函数中处理
