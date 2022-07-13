> Dom Diff 就是 React ReconcileChildren(协调子元素) 的过程，这个过程比较的是当前子 fiber 节点和新的 React Element 节点。本节介绍的是新的 React Element 有多于 1 个元素的场景，即多节点 Dom Diff。在 Dom Diff 的过程中，首先比较 key，然后比较 type，如果 key 和 type 都相同，则可以复用当前的 fiber 节点

## 多节点 DOM Diff 算法介绍

多节点 Dom Diff 相对复杂，我们先看下多节点 Dom Diff 伪代码：

```js
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
  var oldFiber = currentFirstChild;
  var newIdx = 0;

  // 第一步：for循环同时遍历新旧节点
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    // 如果key不同，则直接结束当前for循环
    if (oldFiber.key !== newChildren[newIdx].key) {
      break;
    }
    oldFiber = oldFiber.sibling;
  }

  // 第二步：判断新的element是否已经遍历完成
  if (newIdx === newChildren.length) {
    // 如果新的element优先遍历完成，则将剩下的旧的fiber节点全部删除
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild; // dom diff结束
  }

  // 第三步：判断旧的fiber节点是否已经遍历完成
  if (oldFiber === null) {
    // 如果旧的fiber节点优先遍历完成，则遍历剩下的新的element元素，并创建新的fiber节点
    for (; newIdx < newChildren.length; newIdx++) {
      var _newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
    }

    return resultingFirstChild; // dom diff 结束
  }

  // 程序执行到这里，说明新旧节点都还没遍历完成，并且存在至少一个节点key不同的场景
  // 第四步：将剩下的旧的fiber节点存到map中，使用key做为键，如果key不存在，则使用oldFiber.index做为键
  var existingChildren = mapRemainingChildren(returnFiber, oldFiber);

  for (; newIdx < newChildren.length; newIdx++) {
    // 从map中查找是否能复用旧的fiber节点
    var _newFiber2 = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx]
    );
    if (_newFiber2.alternate) {
      // 如果可以复用，则将旧的fiber从existingChildren中删除
      existingChildren.delete(
        _newFiber2.key === null ? newIdx : _newFiber2.key
      );
    }
  }
  // 第五步：最后，将existingChildren中的节点全部标记为删除并添加到父节点的副作用链表中
  existingChildren.forEach(function (child) {
    return deleteChild(returnFiber, child);
  });

  return resultingFirstChild;
}
```

从以上伪代码可以看出，React 在对多节点的 dom diff 过程中：

首先进行一轮 for 循环，同时遍历新旧节点

- 如果 key 都相同，则需要判断新的元素优先遍历完成，还是旧的 fiber 节点优先遍历完成
- 如果 key 不同，则提前结束当前 for 循环，将剩下的 fiber 节点存入 map 中，继续遍历剩下的新的 element，从 map 中查找是否能复用

**注意：type 不同并不会导致第一步的 for 循环提前结束。**

### 新的 React Element 优先遍历完成，同时存在 type 不同的节点

type 不同，则将当前 fiber 节点标记为删除，继续遍历

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">A</li>
  <p key="B" id="B">B</p>
  <li key="C" id="C">C</li>
  <li key="D" id="D">D</li>
</ul>
// 更新后
<ul key="ul">
  <li key="A" id="A2">A2</li>
  <li key="B" id="B2">B2</li>
  <li key="C" id="C2">C2</li>
</ul>
```

删除 `p#B`、`li#D` 节点，复用 `li#A`、`li#C`节点，创建新的`li#B`节点

**注意，在比较`li#B`和`p#B`时，发现 key 不同，但是 type 不同，React 不会提前退出第一步的 for 循环。而是继续遍历。只有在 key 不同的时候才会提前退出循环**

### 旧的 fiber 节点优先遍历完成

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">A</li>
  <li key="B" id="B">B</li>
</ul>
// 更新后
<ul key="ul">
  <li key="A" id="A">A2</li>
  <li key="B" id="B">B2</li>
  <li key="C" id="C">C2</li>
  <li key="D" id="D">D2</li>
  <li key="E" id="E">E2</li>
</ul>
```

## 多节点 Dom Diff 复杂场景：节点删除、新增、移动

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">A</li>
  <li key="B" id="B">B</li>
  <li key="C" id="C">C</li>
  <li key="D" id="D">D</li>
  <li key="E" id="E">E</li>
  <li key="F" id="F">F</li>
</ul>
// 更新后
<ul key="ul" onClick={this.handleClick}>
  <li key="A" id="A2">A2</li>
  <li key="B2" id="B2">B2</li>
  <li key="D" id="D2">D2</li>
  <li key="H" id="H">H</li>
  <li key="C" id="C2">C2</li>
  <li key="F" id="F2">F2</li>
  <li key="G" id="G2">G2</li>
</ul>
```

dom diff 过程如下：

- 第一步：首先 for 循环同时遍历旧的 fiber 节点和新的 element 节点，当遍历到 `li#B` 和 `li#B2` 时发现 `key不同`，于是结束当前 for 循环
- 第二步：判断新的 element 节点还没遍历完成
- 第三步：判断旧的 fiber 节点还没遍历完成
- 第四步：将剩下的 fiber 节点(即 `li#B` 到 `li#F`) 存入 map 中，即 existingChildren，`key` 做键。如果`key`不存在，则使用当前 fiber 的 index 做为键

```js
var existingChildren = {
  B: fiberB, // li#B
  C: fiberC, // li#C
  D: fiberD, // li#D
  E: fiberE, // li#E
  F: fiberF, // li#F
};
```

- 第五步：遍历剩下的 element 节点(即 `li#B2` 到 `li#G2`)，尝试着从 existingChildren 中复用 fiber 节点，如果不能复用，则创建新的 fiber 节点

经过上面的步骤，existingChildren 最终只剩下两个 fiber 节点没有被复用

```js
{
  "B": fiberB, // li#B
  "E": fiberE, // li#E
}
```

调用`deleteChild`将`existingChildren`里面的没有被复用的节点删除

```js
existingChildren.forEach(function (child) {
  return deleteChild(returnFiber, child);
});
```

最终，我们得到下面的副作用链表，如果对 React 构建副作用链表不熟悉的，可以看这篇文章[构建副作用链表算法](https://github.com/lizuncong/mini-react/blob/master/docs/reconciler/%E6%9E%84%E5%BB%BA%E5%89%AF%E4%BD%9C%E7%94%A8%E9%93%BE%E8%A1%A8%E7%AE%97%E6%B3%95.md)

- 删除 li#B
- 删除 li#E
- 更新 li#A2
- 插入 li#B2
- 更新 li#D2
- 插入 li#H
- 插入更新 li#C2
- 更新 li#F2
- 插入 li#G2

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/dom-diff-01.jpg)

在 commit 阶段，React 遍历副作用链表并执行对应的操作。**问题是，React 是基于什么规则移动节点的？**

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
