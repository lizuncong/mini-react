> Dom Diff 就是 React ReconcileChildren(协调子元素) 的过程，这个过程比较的是当前子 fiber 节点和新的 React Element 节点。本节介绍的是新的 React Element 有多于 1 个元素的场景，即多节点 Dom Diff。在 Dom Diff 的过程中，首先比较 key，然后比较 type，如果 key 和 type 都相同，则可以复用当前的 fiber 节点

### 多节点 DOM Diff 算法介绍

### 多节点 DOM Diff 主要源码

Dom Diff 协调从 `reconcileChildFibers` 函数开始，而多节点的协调算法在`reconcileChildrenArray`函数中

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

    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

    if (previousNewFiber === null) {
      // TODO: Move out of the loop. This only happens for the first run.
      resultingFirstChild = newFiber;
    } else {
      // TODO: Defer siblings if we're not at the right index for this slot.
      // I.e. if we had null values before, then we want to defer this
      // for each null value. However, we also don't want to call updateSlot
      // with the previous one.
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }

  if (newIdx === newChildren.length) {
    // We've reached the end of the new children. We can delete the rest.
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }

  if (oldFiber === null) {
    // If we don't have any more existing children we can choose a fast path
    // since the rest will all be insertions.
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
  } // Add all children to a key map for quick lookups.

  var existingChildren = mapRemainingChildren(returnFiber, oldFiber); // Keep scanning and use the map to restore deleted items as moves.

  for (; newIdx < newChildren.length; newIdx++) {
    var _newFiber2 = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      lanes
    );

    if (_newFiber2 !== null) {
      if (shouldTrackSideEffects) {
        if (_newFiber2.alternate !== null) {
          // The new fiber is a work in progress, but if there exists a
          // current, that means that we reused the fiber. We need to delete
          // it from the child list so that we don't add it to the deletion
          // list.
          existingChildren.delete(
            _newFiber2.key === null ? newIdx : _newFiber2.key
          );
        }
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

  if (shouldTrackSideEffects) {
    // Any existing children that weren't consumed above were deleted. We need
    // to add them to the deletion list.
    existingChildren.forEach(function (child) {
      return deleteChild(returnFiber, child);
    });
  }

  return resultingFirstChild;
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
