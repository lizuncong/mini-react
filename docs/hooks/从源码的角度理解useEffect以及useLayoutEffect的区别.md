> 本章从源码层面介绍 `useLayoutEffect` 以及 `useEffect` 的区别以及执行时机，类组件常见生命周期的执行时机，类组件 `this.setState(arg, callback)` 中 `callback` 的执行时机。建议在阅读本章时，在各个函数的入口处打个断点调试，找找感觉。

### 前置知识

- 监听函数和 `clear清除函数` 的约定。我们将传递给 `useEffect` 或者 `useLayoutEffect` 的函数叫做监听函数。监听函数的返回值叫 `clear清除函数`
- React 渲染主要分为两个阶段：render 阶段 以及 commit 阶段。render 阶段是可以并发的，可以中断的。render 阶段主要是协调子节点，找出有副作用的节点，构造副作用链表以及 fiber 树。commit 阶段是同步的，一旦开始就不能够中断。commit 阶段对真实的 DOM 进行增删改查，执行对应的生命周期方法。
- 在 react-dom.development.js 中找到 `commitRootImpl` 函数并在入口处设置断点，然后在 `commitRootImpl` 中找到调用 `commitBeforeMutationEffects`、`commitMutationEffects`、`commitLayoutEffects` 这三个函数的地方并设置断点。后面会具体解释这些函数的作用。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/effect-01.jpg)

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/effect-02.jpg)

### useLayoutEffect 和 useEffect 的区别

- `useLayoutEffect` 的 `监听函数` 以及 `clear 清除函数` 都是同步执行的，是在真实的 DOM 发生了改变之后，浏览器绘制之前执行的。
- `useEffect` 的 `监听函数` 以及 `clear清除函数` 是异步执行的，是在真实的 DOM 发生了改变并且浏览器绘制之后(此时 JS 主线程已经执行完毕)异步执行的

- useLayoutEffect 和 useEffect 的使用场景
  - useLayoutEffect 的 `监听函数` 以及 `clear 清除函数` 的执行都会阻塞浏览器渲染。当需要操作真实的 DOM 时，需要放在 useLayoutEffect 的监听函数中执行，同时 useLayoutEffect 的监听函数尽量避免耗时长的任务
  - useEffect 的 `监听函数` 以及 `clear清除函数` 的执行都不会阻塞浏览器渲染。useEffect 尽量避免操作真实的 DOM，因为 useEffect 的监听函数的执行时机是在浏览器绘制之后执行。如果此时在 useEffect 的监听函数里又操作真实的 DOM，会导致浏览器回流重绘。同时可以将耗时长的任务放在 useEffect 的 `监听函数` 中执行。

### 场景复现

修改 `index.html` 文件，添加两个额外的 dom

```html
<body>
  <div id="root"></div>
  <div style="margin-top: 100px" id="useEffect"></div>
  <div id="useLayoutEffect"></div>
</body>
```

演示的 demo 组件：

```jsx
import React, { useEffect, useState, useLayoutEffect } from "react";
import ReactDOM from "react-dom";

const sleep = () => {
  const start = Date.now();
  while (Date.now() - start < 5000) {}
};
const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.getElementById("useEffect").innerText = "useEffect：" + count;
    return () => {
      console.log("use effect 清除 =============");
    };
  });
  useLayoutEffect(() => {
    document.getElementById("useLayoutEffect").innerText =
      "useLayoutEffect：" + count;
    return () => {
      console.log("use layout effect 清除 ===========");
    };
  });
  const onBtnClick = () => {
    setCount(count + 1);
  };
  return <button onClick={onBtnClick}>Counter：{count}</button>;
};

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCounter: true,
    };
  }
  render() {
    return [
      <div
        style={{ marginTop: "100px" }}
        onClick={() =>
          this.setState({ showCounter: !this.state.showCounter }, () =>
            console.log("this.setState回调函数执行======")
          )
        }
      >
        切换显示计数器
      </div>,
      this.state.showCounter && <Counter />,
    ];
  }
}

ReactDOM.render(<Index />, document.getElementById("root"));
```

#### useLayoutEffect 监听函数

在 `useLayoutEffect` 的监听函数中调用 `sleep` 函数

```js
useLayoutEffect(() => {
  document.getElementById("useLayoutEffect").innerText =
    "useLayoutEffect：" + count;
  sleep(); // 死循环5秒
  return () => {
    console.log("use layout effect 清除 ===========");
  };
});
```

点击 Counter 按钮，**过了大概 5 秒页面才刷新。可以看出 useLayoutEffect 的监听函数是同步执行的，会阻塞页面渲染**

#### useLayoutEffect 清除函数

在 `useLayoutEffect` 的`clear 清除函数`中调用 `sleep` 函数

```js
useLayoutEffect(() => {
  document.getElementById("useLayoutEffect").innerText =
    "useLayoutEffect：" + count;
  return () => {
    console.log("use layout effect 清除 ===========");
    sleep(); // 死循环5秒
  };
});
```

点击 Counter 按钮，**过了大概 5 秒页面才刷新。可以看出 useLayoutEffect 的清除函数是同步执行的，会阻塞页面渲染**

#### useEffect 监听函数

在 `useEffect` 的监听函数中调用 `sleep` 函数

```js
useEffect(() => {
  document.getElementById("useEffect").innerText = "useEffect：" + count;
  sleep(); // 死循环5秒
  return () => {
    console.log("use effect 清除 =============");
  };
});
```

点击 Counter 按钮，**页面立即刷新，过了大概 5 秒，useEffect：后面的数字才更新。因此 useEffect 的监听函数是异步执行的，不会阻塞页面更新。但是如果监听函数里面有 DOM 操作，会导致页面回流重绘**

#### useEffect 清除函数

在 `useEffect` 的监听函数中调用 `sleep` 函数

```js
useEffect(() => {
  document.getElementById("useEffect").innerText = "useEffect：" + count;
  return () => {
    console.log("use effect 清除 =============");
    sleep(); // 死循环5秒
  };
});
```

点击 Counter 按钮，**页面立即刷新，过了大概 5 秒，useEffect：后面的数字才更新。因此 useEffect 的清除函数是异步执行的，不会阻塞页面更新。**

**清除函数有个细微差别，我们在 useEffect 的监听函数里面改变 useEffect 的 innerText，为什么 清除函数睡眠了 5 秒后，这个 DOM 才更新？？答案就是，清除函数和监听函数是一起执行的，先执行清除函数，紧接着执行监听函数**

下面让我们从源码层面来解析这个过程，可以在下面函数的地方设置断点并且 debug

### commitRootImpl

commit 阶段分成三个子阶段：

- 第一阶段：commitBeforeMutationEffects。DOM 变更前
  - 调用 类组件的 getSnapshotBeforeUpdate 生命周期方法
  - 启动一个微任务以刷新 passive effects 异步队列。passive effects 异步队列存的是 useEffect 的清除函数以及监听函数
- 第二阶段：commitMutationEffects。DOM 变更，操作真实的 DOM 节点。注意这个阶段是 `卸载` 相关的生命周期方法执行时机

  - 操作真实的 DOM 节点：增删改查
  - 同步调用函数组件 `useLayoutEffect` 的 `清除函数`
  - 同步调用类组件的 `componentWillUnmount` 生命周期方法
  - 将函数组件的 `useEffect` 的 `清除函数` 添加进异步队列，异步执行。
  - **所有的函数组件的 useLayoutEffect 的清除函数都在这个阶段执行完成**

- 第三阶段：commitLayoutEffects。DOM 变更后
  - 调用函数组件的 `useLayoutEffect` 监听函数，同步执行
  - 将函数组件的 `useEffect` 监听函数放入异步队列，异步执行
  - 执行类组件的 `componentDidMount` 生命周期方法，同步执行
  - 执行类组件的 `componentDidUpdate` 生命周期方法，同步执行
  - 执行类组件 `this.setState(arg, callback)` 中的 `callback` 回调，同步执行

每一个子阶段都是一个 while 循环，**从头开始**遍历副作用链表。

```js
let nextEffect;
function commitRootImpl(root, renderPriorityLevel) {
  const finishedWork = root.finishedWork;
  root.finishedWork = null;
  let firstEffect;
  if (firstEffect !== null) {
    // commie阶段被划分成多个小阶段。每个阶段都从头开始遍历整个副作用链表
    nextEffect = firstEffect;
    // 第一阶段，DOM变更前，调用getSnapshotBeforeUpdate等生命周期方法。
    commitBeforeMutationEffects();
    // 重置 nextEffect，从头开始
    nextEffect = firstEffect;
    // 第二阶段，操作真实的DOM
    commitMutationEffects(root, renderPriorityLevel);
    // 注意：由于此时真实的DOM已经操作完成，因此将 finishedWork 设置成当前的 fiber tree。
    root.current = finishedWork;
    // 重置 nextEffect，从头开始
    nextEffect = firstEffect;
    // 第三阶段：DOM变更后
    commitLayoutEffects(root, lanes);
  }
}
```

#### commitBeforeMutationEffects

这个函数主要是在 DOM 变更前执行，主要逻辑如下：

- 调用 类组件的 getSnapshotBeforeUpdate 生命周期方法
- 启动一个微任务以刷新 passive effects。passive effects 指的是 useEffect 的清除函数以及监听函数

```js
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    // 调用类组件的 getSnapshotBeforeUpdate 生命周期方法
    commitBeforeMutationLifeCycles(current, nextEffect);
    // 提前启动一个异步任务以便JS主线程执行完成后刷新异步队列
    scheduleCallback(NormalPriority$1, function () {
      flushPassiveEffects();
      return null;
    });
    nextEffect = nextEffect.nextEffect;
  }
}
function commitBeforeMutationLifeCycles(current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent:
      // 函数组件没有操作
      return;
    case ClassComponent:
      instance.getSnapshotBeforeUpdate(prevProps, prevState);
      return;
  }
}
```

#### commitMutationEffects

这个函数操作 DOM，主要有三个方法：

- commitPlacement。调用 `parentNode.appendChild(child);` 或者 `container.insertBefore(child, beforeChild)` 插入 DOM 节点
- commitWork。同步调用函数组件 `useLayoutEffect` 的`清除函数`，这个函数对于类组件没有任何操作
- commitDeletion。主要是删除 DOM 节点，以及调用当前节点以及子节点所有的 `卸载` 相关的生命周期方法
  - 同步调用函数组件的 `useLayoutEffect` 的 `清除函数`，这是同步执行的
  - 将函数组件的 `useEffect` 的 `清除函数` 添加进异步刷新队列，这是异步执行的
  - 同步调用类组件的 `componentWillUnmount` 生命周期方法

```js
function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    // 插入，更新，删除 DOM 节点
    switch (primaryFlags) {
      case PlacementAndUpdate: {
        // 插入
        commitPlacement(nextEffect);
        commitWork(_current, nextEffect);
        break;
      }
      case Deletion: {
        // 删除
        commitDeletion(root, nextEffect);
        break;
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
function commitPlacement(finishedWork) {
  if (isContainer) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
  } else {
    insertOrAppendPlacementNode(finishedWork, before, parent);
  }
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  if (before) {
    insertInContainerBefore(parent, stateNode, before);
  } else {
    appendChildToContainer(parent, stateNode);
  }
}
function commitWork(current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      // 调用函数组件的清除函数
      commitHookEffectListUnmount(Layout | HasEffect, finishedWork);
      return;
    }
    case ClassComponent:
      // 可以看到 类组件 在这里是不执行任何操作的
      return;
  }
}
// 执行函数组件的 useLayoutEffect 监听函数的回调，即清除函数
function commitHookEffectListUnmount(tag, finishedWork) {
  do {
    // Unmount
    var destroy = effect.destroy;
    effect.destroy = undefined;
    destroy(); // 执行 useLayoutEffect 的清除函数
    effect = effect.next;
  } while (effect !== firstEffect);
}
function commitDeletion(finishedRoot, current, renderPriorityLevel) {
  // 调用所有子节点的 componentWillUnmount() 方法
  unmountHostComponents(finishedRoot, current);
}
function unmountHostComponents(finishedRoot, current, renderPriorityLevel) {
  while (true) {
    commitUnmount(finishedRoot, node);
  }
}
function commitUnmount(finishedRoot, current, renderPriorityLevel) {
  switch (current.tag) {
    case FunctionComponent: {
      do {
        if (effect 是 useEffect) {
          // 将 useEffect 的清除函数添加进异步刷新队列，useEffect 的清除函数是异步执行的
          enqueuePendingPassiveHookEffectUnmount(current, effect);
        } else {
          // 调用 useLayoutEffect 的清除函数，同步执行的
          // 其实就是直接调用destroy();
          safelyCallDestroy(current, destroy);
        }
        effect = effect.next;
      } while (effect !== firstEffect);
      return;
    }
    case ClassComponent: {
      // 直接调用类组件的 componentWillUnmount() 生命周期方法，同步执行
      safelyCallComponentWillUnmount(current, instance);
      return;
    }
  }
}
```

#### commitLayoutEffects

当执行到这个函数，此时 `useLayoutEffect` 的清除函数已经全部执行完成。

- 调用函数组件的 `useLayoutEffect` 监听函数，同步执行
- 将函数组件的 `useEffect` 监听函数放入异步队列，异步执行
- 执行类组件的 `componentDidMount` 生命周期方法，同步执行
- 执行类组件的 `componentDidUpdate` 生命周期方法，同步执行
- 执行类组件 `this.setState(arg, callback)` 中的 `callback` 回调，同步执行

```js
function commitLayoutEffects(root, committedLanes) {
  // 此时所有的 `useLayoutEffect` 的清除函数已经执行完成，在commitMutationEffects阶段执行的
  while (nextEffect !== null) {
    commitLifeCycles(root, current, nextEffect);
    nextEffect = nextEffect.nextEffect;
  }
}
function commitLifeCycles(finishedRoot, current, finishedWork, committedLanes) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      // 同步执行 useLayoutEffect 的监听函数
      commitHookEffectListMount(Layout | HasEffect, finishedWork);
      // 将 useEffect 的监听函数放入异步队列等待执行
      schedulePassiveEffects(finishedWork);
      return;
    }
    case ClassComponent: {
      // 第一次挂载的时候执行类组件的componentDidMount生命周期方法
      instance.componentDidMount();
      // 组件更新的时候执行类组件的 componentDidUpdate 生命周期方法
      instance.componentDidUpdate(prevProps, prevState, snapshotBeforeUpdate);
      // 调用类组件 this.setState(arg, callback) 的callback回调
      commitUpdateQueue(finishedWork, updateQueue, instance);
      return;
    }
  }
}

// 执行useLayoutEffect监听函数
function commitHookEffectListMount(tag, finishedWork) {
  do {
    if ((effect.tag & tag) === tag) {
      // Mount
      var create = effect.create;
      effect.destroy = create();
    }
    effect = effect.next;
  } while (effect !== firstEffect);
}
```

### flushPassiveEffectsImpl

useEffect 的清除函数和监听函数执行的地方。在这个函数的入口处打个断点，观察清除函数和监听函数的执行时机。当 JS 主线程执行完毕，浏览器绘制页面完成后，这个函数才会异步执行

```js
function flushPassiveEffectsImpl() {
  var unmountEffects = pendingPassiveHookEffectsUnmount;
  pendingPassiveHookEffectsUnmount = [];

  // 首先要一次性执行完所有的清除函数
  for (var i = 0; i < unmountEffects.length; i += 2) {
    var _effect = unmountEffects[i];
    var fiber = unmountEffects[i + 1];
    var destroy = _effect.destroy;
    _effect.destroy = undefined;

    if (typeof destroy === "function") {
      destroy();
    }
  }
  // 其次，一次性执行完所有的监听函数
  var mountEffects = pendingPassiveHookEffectsMount;
  pendingPassiveHookEffectsMount = [];

  for (var _i = 0; _i < mountEffects.length; _i += 2) {
    var _effect2 = mountEffects[_i];
    var _fiber = mountEffects[_i + 1];
    var create = _effect2.create;
    _effect2.destroy = create();
  }

  return true;
}
```

从这个函数的执行中也可以看出，useEffect 的 `监听函数` 和 `清除函数` 在同一个调用栈中是同步执行的。
