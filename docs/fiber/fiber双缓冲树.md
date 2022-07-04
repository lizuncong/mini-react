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
