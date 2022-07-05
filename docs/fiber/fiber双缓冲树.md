### 大纲

- 双缓冲树机制
- 删除节点时如何释放内存，即如何删除旧的 fiber 节点
- 为什么需要重用 alternate 节点，重新创建不行吗？

### 背景

在[React 初次渲染及更新流程](https://github.com/lizuncong/mini-react/blob/master/docs/render/%E6%B7%B1%E5%85%A5%E6%A6%82%E8%BF%B0%20React%E5%88%9D%E6%AC%A1%E6%B8%B2%E6%9F%93%E5%8F%8A%E7%8A%B6%E6%80%81%E6%9B%B4%E6%96%B0%E4%B8%BB%E6%B5%81%E7%A8%8B.md)一文介绍过 React 渲染更新主要分为两个阶段：render 阶段和 commit 阶段。render 阶段主要是将新的 element tree 和 当前的 fiber 树(即 curent tree，当前页面对应的 fiber 树)比较，并构建一棵 workInProgress 树以及收集有副作用的 fiber 节点。render 阶段完成后，我们将得到一棵 finishedWork 树以及一个副作用链表。render 阶段是异步可以中断的

在 commit 阶段主要就是遍历副作用链表，并执行相应的 dom 操作等。commit 阶段是同步且不可中断的

### Fiber 双缓冲树

由于 render 阶段构建 workInProgress 树的过程是可以中断的，同时，workInProgress 树最终又会在 commit 阶段渲染到浏览器页面上，这就决定了在 render 阶段，必须要保持浏览器页面不变直到 render 阶段完成。也就是说我们在 render 阶段需要保持 current tree 不变，然后用另一棵树来承载 workInProgress 树。为了实现这个目标，React 借鉴了[双缓冲](https://baike.baidu.com/item/%E5%8F%8C%E7%BC%93%E5%86%B2/10953356?fr=aladdin)技术。

Fiber 双缓冲树包括一棵 current tree 和一棵 workInProgress tree(render 阶段完成后的 workInProgress 树也叫 finishedWork 树)。current tree 保存的是当前浏览器页面对应的 fiber 节点。workInProgress tree 是在 render 阶段，react 基于 current tree 和新的 element tree 进行比较而构建的一棵树，这棵树是在内存中构建，在 commit 阶段将被绘制到浏览器页面上。

current 树保存在容器节点的 `root._reactRootContainer._internalRoot.current` 属性上。在 render 阶段构建 workInProgress 树的过程中，我们可以通过`root._reactRootContainer._internalRoot.current.alternate` 访问到 workInProgress 树。render 阶段完成，commit 阶段开始前，我们会得到一棵 finishedWork 树，实际上这就是 render 过程结束后得到的 workInProgress 树，finishedWork 树可以通过`root._reactRootContainer._internalRoot.finishedWork`属性获取。

下图就是 commit 阶段完成后，finishedWork 树赋值给 current tree，同时 finishedWork 置空
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-05.jpg)

#### render 阶段构建 workInProgress 树

由于 render 阶段主要逻辑就是在 `performUnitOfWork`，因此我们可以在这个函数处打个断点查看 render 阶段的 workInProgress 树
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-06.jpg)

#### render 阶段完成，commit 阶段开始前

render 阶段完成，commit 阶段开始前，workInProgress 树构建完成，此时将 workInProgress 树复制给容器的 finishedWork 属性，这段逻辑在 `performSyncWorkOnRoot` 函数中

```js
function performSyncWorkOnRoot(root) {
  //...
  renderRootSync(root, lanes); // render阶段，构建workInProgress树
  // ...render阶段结束
  var finishedWork = root.current.alternate;
  root.finishedWork = finishedWork; // 将workInProgress树赋值给finishedWork属性
  commitRoot(root); // commit阶段，将finishedWork树更新到浏览器页面
  // ...
}
```

可以在 `performSyncWorkOnRoot` 处打断点查看这个过程
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-07.jpg)

#### commit 阶段完成后

### 创建备用节点的方法

如果没有备用节点，则新建一个，否则复用。备用节点会复制当前节点的 child 以及 sibling 等属性

在复用当前节点时，不会复用当前节点与副作用及副作用链表相关属性，比如：flags、firstEffect、nextEffect、lastEffect。
当前节点的其余节点都会被拷贝到备用节点中去

第一次渲染完成后，此时内存中只有一棵 fiber 树，即 current tree。
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-01.jpg)

当我们调用 this.setState 触发状态更新，render 阶段完成后，commit 阶段开始前，此时 workInProgress 树构建完成，内存中除了 current tree 以外，还有一棵 workInProgress tree，即 finishedWork tree。
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-02.jpg)

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-03.jpg)

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/double-fiber-04.jpg)

```js
// This is used to create an alternate fiber to do work on.

function createWorkInProgress(current, pendingProps) {
  var workInProgress = current.alternate;

  if (workInProgress === null) {
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other" unused
    // node that we're free to reuse. This is lazily created to avoid allocating
    // extra objects for things that are never updated. It also allow us to
    // reclaim the extra memory if needed.
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    );
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
    // Needed because Blocks store data on type.
    workInProgress.type = current.type;
    // We already have an alternate.
    // Reset the effect tag.
    workInProgress.flags = NoFlags;
    // The effect list is no longer valid.
    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
  }

  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  // Clone the dependencies object. This is mutated during the render phase, so
  // it cannot be shared with the current fiber.
  var currentDependencies = current.dependencies;
  workInProgress.dependencies =
    currentDependencies === null
      ? null
      : {
          lanes: currentDependencies.lanes,
          firstContext: currentDependencies.firstContext,
        };
  // These will be overridden during the parent's reconciliation
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;
  return workInProgress;
}
```
