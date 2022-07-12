> Dom Diff 就是 React ReconcileChildren(协调子元素) 的过程，这个过程比较的是当前子 fiber 节点和新的 React Element 节点。本节介绍的是新的 React Element 有多于 1 个元素的场景，即多节点 Dom Diff。在 Dom Diff 的过程中，首先比较 key，然后比较 type，如果 key 和 type 都相同，则可以复用当前的 fiber 节点

## 多节点 DOM Diff 算法介绍

### 首先进行第一轮 for 循环

第一轮 for 循环同时遍历旧的 fiber 节点以及新的 react element 节点

```js
for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
  nextOldFiber = oldFiber.sibling;
  // ...
  // newFiber为null，说明key不同，则退出for循环。
  if (newFiber === null) {
    break;
  }
  // ...
  oldFiber = nextOldFiber;
}
```

从上面代码可以看出，满足下面任意一个条件，for 循环即结束

- 1. newChildren，即新的 element 已经遍历完成
- 2. oldFiber 为 null。此时说明旧的 fiber 节点已经遍历完成
- 3. 当前旧的 fiber 节点的 key 和新的 child 的 key 不同，则提前退出 for 循环。

**前两个条件导致的循环退出，只能说明新旧节点的 key 是相同的，但是 type 有可能不同。**

#### 新的 React Element 先遍历完成

如果是新的 element 已经遍历完成导致 for 循环正常结束，那么需要将剩下的旧的节点全部删除。这种场景下，新旧节点的 key 一定是相同的，代码如下

```js
if (newIdx === newChildren.length) {
  deleteRemainingChildren(returnFiber, oldFiber);
  return resultingFirstChild;
}
```

如果 `newIdx === newChildren.length`，说明新的 element 已经遍历完成，则不需要再继续比较，调用`deleteRemainingChildren`将剩下的旧的 fiber 节点删除

##### 案例 1：数量相同，key 和 type 全部相同

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">
    A
  </li>
  <li key="B" id="B">
    B
  </li>
  <li key="C" id="C">
    C
  </li>
</ul>
// 更新后
<ul key="ul">
  <li key="A" id="A2">
    A2
  </li>
  <li key="B" id="B2">
    B2
  </li>
  <li key="C" id="C2">
    C2
  </li>
</ul>
```

因此新的节点完全可以复用旧的 fiber 节点，在 commit 阶段，只需要依次更新 A、B、C 即可

##### 案例 2：旧的节点比新的节点多，存在 key 相同，type 不同的场景

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">
    A
  </li>
  <p key="B" id="B">
    B
  </p>
  <li key="C" id="C">
    C
  </li>
   <li key="D" id="D">
    D
  </li>
</ul>
// 更新后
<ul key="ul">
  <li key="A" id="A2">
    A
  </li>
  <li key="B" id="B2">
    B
  </li>
  <li key="C" id="C2">
    C
  </li>
</ul>
```

在上面的场景中，新的 element 比旧的节点少，同时`key`为`B`的元素`type`不同。在 for 循环中，新的 element 先遍历完成，循环结束。

在 for 循环比较的过程中，发现旧的 `p#B` 和 新的 `li#B2` 这两个元素 `key` 相同，但是`type`不同，因此将 `p#B` 标记为删除并添加到父节点的副作用链表中，同时为`li#B2`创建新的 fiber 节点。

for 循环结束，新的 element 已经遍历完成，旧的 fiber 节点还剩下 `li#D` 元素，因此调用 `deleteRemainingChildren` 将剩下的旧的 fiber 节点全部标记为删除，并添加到父节点副作用链表中

在 commit 阶段，首先删除 `p#B` 以及 `li#D`，然后更新 `li#A`、插入新的 `li#B`(通过调用 ul.insertBefore(li#B, li#C)在 li#C 前面插入)、最后更新`li#C`

**注意，在比较`li#B`和`p#B`时，发现 key 不同，但是 type 不同，本着尽可能最大的复用旧的 fiber 节点的原则，React 不会提前退出循环。而是继续遍历。只有在 key 不同的时候才会提前退出循环**

#### 旧的 fiber 节点先遍历完成

如果是旧的 fiber 节点先遍历完成，则只需要为所有剩下的新的 element 元素直接创建新的 fiber 节点即可

```js
if (oldFiber === null) {
  for (; newIdx < newChildren.length; newIdx++) {
    var _newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
  }
  return resultingFirstChild;
}
```

如果 `oldFiber` 为 null，说明旧的 fiber 节点先遍历完成，此时遍历剩下的 element 节点，调用`createChild`创建新的 fiber 节点

#### stash

- 第一轮循环完成后，需要判断新的 react element 元素是否已经遍历完成

  - 如果新的 react element 已经遍历完成，则不需要再继续协调，调用 deleteRemainingChildren 删除剩余的旧 fiber 节点，并终止函数

```js
if (newIdx === newChildren.length) {
  deleteRemainingChildren(returnFiber, oldFiber);
  return resultingFirstChild;
}
```

- 第二轮循环。如果第一轮循环新的 react element 没有遍历完成，同时旧的 fiber 节点已经遍历完成，则开始第二轮循环。第二轮循环就是为剩下的新的 react element 元素创建对应的 fiber 节点

```js
if (oldFiber === null) {
  for (; newIdx < newChildren.length; newIdx++) {
    var _newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
  }
  return resultingFirstChild;
}
```

## 多节点 DOM Diff 主要源码

Dom Diff 协调从 `reconcileChildFibers` 函数开始，而多节点的协调算法在`reconcileChildrenArray`函数中

`reconcileChildFibers` 函数，Dom Diff 的入口。

```js
function reconcileChildFibers(returnFiber, currentFirstChild, newChild, lanes) {
  if (isArray(newChild)) {
    return reconcileChildrenArray(
      returnFiber,
      currentFirstChild,
      newChild,
      lanes
    );
  }
}
```

`reconcileChildrenArray` 函数，多节点 Dom Diff 的逻辑都在这个函数里面

```js
function reconcileChildrenArray(
  returnFiber,
  currentFirstChild,
  newChildren,
  lanes
) {
  var resultingFirstChild = null;
  var previousNewFiber = null;
  var oldFiber = currentFirstChild;
  var lastPlacedIndex = 0;
  var newIdx = 0;
  var nextOldFiber = null;
  // 第一轮循环 存在旧的fiber节点
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    // Q1：什么场景下，oldFiber.index > newIdx
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }

    // key不同或者oldFiber为null的情况下，updateSlot才会返回null
    var newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
      lanes
    );

    // 如果key不同，则退出当前for循环
    if (newFiber === null) {
      // Q2：什么场景下，oldFiber === null
      if (oldFiber === null) {
        oldFiber = nextOldFiber;
      }
      break;
    }

    // key相同，但是type不同的情况下，由于无法复用当前节点，因此需要将当前节点标记为删除，并添加到父节点的副作用链表中
    if (oldFiber && newFiber.alternate === null) {
      deleteChild(returnFiber, oldFiber);
    }
    // 为newFiber设置新的索引newIdx，同时判断是否需要移动
    // 如果oldindex 小于 lastPlacedIndex，说明需要移动
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }
  // 如果新的react element元素已经遍历完成，则将剩余的旧的fiber节点删除
  if (newIdx === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }

  // oldFiber为null，说明旧的fiber节点已经遍历完成，因此我们只需要为剩下的新的react element创建
  // 新的fiber节点即可
  if (oldFiber === null) {
    for (; newIdx < newChildren.length; newIdx++) {
      var _newFiber = createChild(returnFiber, newChildren[newIdx], lanes);

      if (_newFiber === null) {
        continue;
      }

      lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx);

      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = _newFiber;
      } else {
        previousNewFiber.sibling = _newFiber;
      }

      previousNewFiber = _newFiber;
    }

    return resultingFirstChild;
  }
  // 将剩下的旧的fiber节点存到map中，方便快速查找
  var existingChildren = mapRemainingChildren(returnFiber, oldFiber);
  for (; newIdx < newChildren.length; newIdx++) {
    var _newFiber2 = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      lanes
    );

    if (_newFiber2 !== null) {
      if (_newFiber2.alternate !== null) {
        // 如果alternate存在，说明是复用了旧的节点，则从map中移除这个节点
        existingChildren.delete(
          _newFiber2.key === null ? newIdx : _newFiber2.key
        );
      }

      lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx);

      if (previousNewFiber === null) {
        resultingFirstChild = _newFiber2;
      } else {
        previousNewFiber.sibling = _newFiber2;
      }

      previousNewFiber = _newFiber2;
    }
  }

  // 剩下的没有被复用的节点，需要标记为删除，并且添加到父节点的副作用链表中
  existingChildren.forEach(function (child) {
    return deleteChild(returnFiber, child);
  });

  return resultingFirstChild;
}
```

`updateSlot`函数判断如果可以复用当前节点，则复用。否则创建新的 fiber 节点并返回

```js
// key不同或者当前fiber不存在，返回null
// 如果key相同，但是当前fiber节点为null，则创建新的fiber节点
// 如果key相同，type不同，则创建新的fiber节点
// 如果key相同，type相同，则复用当前的fiber节点
function updateSlot(returnFiber, oldFiber, newChild, lanes) {
  var key = oldFiber !== null ? oldFiber.key : null;
  if (typeof newChild === "object" && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        if (newChild.key === key) {
          return updateElement(returnFiber, oldFiber, newChild, lanes);
        } else {
          return null;
        }
      }
    }
  }
  return null;
}
function useFiber(fiber, pendingProps) {
  // 重置index以及sibling
  var clone = createWorkInProgress(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}
function updateElement(returnFiber, current, element, lanes) {
  if (current !== null) {
    if (current.elementType === element.type) {
      // Move based on index
      var existing = useFiber(current, element.props);
      existing.return = returnFiber;
      return existing;
    }
  }
  // 如果旧的fiber节点不存在，或者type不同，则创建新的fiber节点，并插入
  var created = createFiberFromElement(element, returnFiber.mode, lanes);
  created.return = returnFiber;
  return created;
}
```

`deleteRemainingChildren`将`currentFirstChild`以及其后面的所有兄弟节点都标记为删除，并全部添加到父节点的副作用链表中

```js
// 删除其余的fiber节点
function deleteRemainingChildren(returnFiber, currentFirstChild) {
  var childToDelete = currentFirstChild;
  while (childToDelete !== null) {
    deleteChild(returnFiber, childToDelete);
    childToDelete = childToDelete.sibling;
  }
  return null;
}
```

`deleteChild` 将单个节点标记为删除，并且添加到父节点的副作用链表中

```js
// 将fiber节点标记为删除，并添加到父节点的副作用链表中
function deleteChild(returnFiber, childToDelete) {
  var last = returnFiber.lastEffect;
  if (last !== null) {
    last.nextEffect = childToDelete;
    returnFiber.lastEffect = childToDelete;
  } else {
    returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
  }
  childToDelete.nextEffect = null;
  childToDelete.flags = Deletion;
}
```

`placeChild`函数为新的节点计算索引。新插入的节点返回 lastPlacedIndex，如果是复用当前 fiber 节点，则需要比较

```js
function placeChild(newFiber, lastPlacedIndex, newIndex) {
  newFiber.index = newIndex;
  var current = newFiber.alternate;

  if (current !== null) {
    var oldIndex = current.index;

    if (oldIndex < lastPlacedIndex) {
      // This is a move.
      newFiber.flags = Placement;
      return lastPlacedIndex;
    } else {
      // This item can stay in place.
      return oldIndex;
    }
  } else {
    // This is an insertion.
    newFiber.flags = Placement;
    return lastPlacedIndex;
  }
}
```

`mapRemainingChildren` 将剩下的旧的 fiber 节点添加到 map 中，方便快速查找。如果 key 为 null，则使用节点的 index 作为键

```js
function mapRemainingChildren(returnFiber, currentFirstChild) {
  var existingChildren = new Map();
  var existingChild = currentFirstChild;
  while (existingChild !== null) {
    if (existingChild.key !== null) {
      existingChildren.set(existingChild.key, existingChild);
    } else {
      existingChildren.set(existingChild.index, existingChild);
    }

    existingChild = existingChild.sibling;
  }

  return existingChildren;
}
```

`updateFromMap`

```js
function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
  if (typeof newChild === "object" && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        var _matchedFiber =
          existingChildren.get(newChild.key === null ? newIdx : newChild.key) ||
          null;
        return updateElement(returnFiber, _matchedFiber, newChild, lanes);
      }
    }
  }
  return null;
}
```
