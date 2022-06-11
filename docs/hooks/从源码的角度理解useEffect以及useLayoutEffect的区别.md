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
- 第二阶段：commitMutationEffects。DOM 变更，操作真实的 DOM 节点
- 第三阶段：commitLayoutEffects。DOM 变更后

每一个子阶段都**从头开始**遍历副作用链表。

```js
let nextEffect;
function commitRootImpl(root, renderPriorityLevel) {
  const finishedWork = root.finishedWork;
  root.finishedWork = null;
  let firstEffect;
  // firstEffect不为空，说明存在副作用链表
  if (firstEffect !== null) {
    // The first phase a "before mutation" phase. We use this phase to read the
    // state of the host tree right before we mutate it. This is where
    // getSnapshotBeforeUpdate is called.
    // commie阶段被划分成多个小阶段。每个阶段都从头开始遍历整个副作用链表
    nextEffect = firstEffect;
    // 第一个阶段，调用getSnapshotBeforeUpdate等生命周期方法
    commitBeforeMutationEffects();
    // The next phase is the mutation phase, where we mutate the host tree.
    // 重置 nextEffect，从头开始
    nextEffect = firstEffect;
    commitMutationEffects(root, renderPriorityLevel);
    // The work-in-progress tree is now the current tree. This must come after
    // the mutation phase, so that the previous tree is still current during
    // componentWillUnmount, but before the layout phase, so that the finished
    // work is current during componentDidMount/Update.
    root.current = finishedWork;
    // The next phase is the layout phase, where we call effects that read
    // the host tree after it's been mutated. The idiomatic use case for this is
    // layout, but class component lifecycles also fire here for legacy reasons.
    // 重置 nextEffect，从头开始
    nextEffect = firstEffect;
    commitLayoutEffects(root, lanes);
  }
}
```

### commitBeforeMutationEffects

这个函数主要是在 DOM 变更前执行，主要逻辑如下：

- 调用 类组件的 getSnapshotBeforeUpdate 生命周期方法
- 启动一个微任务以刷新 passive effects，即 useEffect 的回调

```js
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    commitBeforeMutationLifeCycles(current, nextEffect);
    // If there are passive effects, schedule a callback to flush at
    // the earliest opportunity.
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
      return;
    case ClassComponent:
      instance.getSnapshotBeforeUpdate(prevProps, prevState);
      return;
    case HostRoot:
      // 这个方法其实也没干啥事
      clearContainer(root.containerInfo);
      return;
    case HostComponent:
    case HostText:
      // Nothing to do for these component types
      return;
  }
}
```

### commitMutationEffects

这个函数操作 DOM，主要有三个方法：

- commitPlacement。调用 `parentNode.appendChild(child);` 或者 `container.insertBefore(child, beforeChild)` 插入 DOM 节点
- commitWork。commitWork 最重要的是里面的 `commitHookEffectListUnmount` 方法，函数组件 `useLayoutEffect` 的`清除函数`就是在这个时候被调用的，这是同步调用的
- commitDeletion。主要是删除 DOM 节点，以及调用当前节点以及子节点所有的 `componentWillUnmount` 生命周期方法
  - 同步调用函数组件的 `useLayoutEffect` 的 `清除函数`，这是同步执行的
  - 将函数组件的 `useEffect` 的 `清除函数` 添加进异步刷新队列，这是异步执行的
  - 同步调用类组件的 `componentWillUnmount` 生命周期方法

```js
function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    // The following switch statement is only concerned about placement,
    // updates, and deletions. To avoid needing to add a case for every possible
    // bitmap value, we remove the secondary effects from the effect tag and
    // switch on that value.
    const primaryFlags = flags & (Placement | Update | Deletion | Hydrating);
    switch (primaryFlags) {
      case PlacementAndUpdate: {
        // Placement
        commitPlacement(nextEffect);
        // Clear the "placement" from effect tag so that we know that this is
        // inserted, before any life-cycles like componentDidMount gets called.
        commitWork(_current, nextEffect);
        break;
      }
      case Deletion: {
        commitDeletion(root, nextEffect);
        break;
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
function commitPlacement(finishedWork) {
  var parentFiber = getHostParentFiber(finishedWork);
  // Note: these two variables *must* always be updated together.
  var parent;
  var isContainer;
  var parentStateNode = parentFiber.stateNode;

  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentStateNode;
      isContainer = false;
      break;
  }
  var before = getHostSibling(finishedWork);
  // We only have the top Fiber that was inserted but we need to recurse down its
  // children to find all the terminal nodes.
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
      // Layout effects are destroyed during the mutation phase so that all
      // destroy functions for all fibers are called before any create functions.
      // This prevents sibling component effects from interfering with each other,
      // e.g. a destroy function in one component should never override a ref set
      // by a create function in another component during the same commit.
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
  // Recursively delete all host nodes from the parent.
  // Detach refs and call componentWillUnmount() on the whole subtree.
  unmountHostComponents(finishedRoot, current);
}
function unmountHostComponents(finishedRoot, current, renderPriorityLevel) {
  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      commitNestedUnmounts(finishedRoot, node);
      // After all the children have unmounted, it is now safe to remove the
      // node from the tree.
      if (currentParentIsContainer) {
        // 调用 container.parentNode.removeChild(child); 或者 container.removeChild(child); 删除节点
        removeChildFromContainer(currentParent, node.stateNode);
      } else {
        // 内部执行 parentInstance.removeChild(child); 删除节点
        removeChild(currentParent, node.stateNode);
      }
    } else if (node.tag === DehydratedFragment) {
    } else if (node.tag === HostPortal) {
    } else {
      commitUnmount(finishedRoot, node);
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}
function commitUnmount(finishedRoot, current, renderPriorityLevel) {
  switch (current.tag) {
    case FunctionComponent: {
      do {
        if (destroy !== undefined) {
          if ((tag & Passive$1) !== NoFlags$1) {
            // 将 useEffect 的清除函数添加进异步刷新队列，useEffect 的清除函数是异步执行的
            enqueuePendingPassiveHookEffectUnmount(current, effect);
          } else {
            // 调用 useLayoutEffect 的清除函数，同步执行的
            // 其实就是直接调用destroy();
            safelyCallDestroy(current, destroy);
          }
        }
        effect = effect.next;
      } while (effect !== firstEffect);
      return;
    }
    case ClassComponent: {
      if (typeof instance.componentWillUnmount === "function") {
        // 直接调用类组件的 componentWillUnmount() 生命周期方法，同步执行
        safelyCallComponentWillUnmount(current, instance);
      }
      return;
    }
  }
}
```

### commitLayoutEffects

- 调用函数组件的 `useLayoutEffect` 监听函数，同步执行
- 将函数组件的 `useEffect` 监听函数放入异步队列，异步执行
- 执行类组件的 `componentDidMount` 生命周期方法，同步执行
- 执行类组件的 `componentDidUpdate` 生命周期方法，同步执行
- 执行类组件 `this.setState(arg, callback)` 中的 `callback` 回调，同步执行

```js
function commitLayoutEffects(root, committedLanes) {
  while (nextEffect !== null) {
    commitLifeCycles(root, current, nextEffect);
    nextEffect = nextEffect.nextEffect;
  }
}
function commitLifeCycles(finishedRoot, current, finishedWork, committedLanes) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      // At this point layout effects have already been destroyed (during mutation phase).
      // This is done to prevent sibling component effects from interfering with each other,
      // e.g. a destroy function in one component should never override a ref set
      // by a create function in another component during the same commit.
      // 同步执行 useLayoutEffect 的监听函数
      commitHookEffectListMount(Layout | HasEffect, finishedWork);
      // 将 useEffect 的监听函数放入异步队列等待执行
      schedulePassiveEffects(finishedWork);
      return;
    }
    case ClassComponent: {
      // 第一次挂载的时候执行
      instance.componentDidMount();
      // 组件更新的时候执行
      instance.componentDidUpdate(prevProps, prevState, snapshotBeforeUpdate);
      // but instead we rely on them being set during last render.
      // TODO: revisit this when we implement resuming.
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
