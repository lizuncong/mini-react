import { REACT_ELEMENT_TYPE } from "@shared/ReactSymbols";
import { createFiberFromElement, createWorkInProgress } from "./ReactFiber";
import { Placement, Deletion } from "./ReactFiberFlags";

// reconcile的场景
// 第一种场景：key相同，类型相同，数量相同。那么复用老节点，只更新属性
// <div key="title" id="title">title</div>
// 更改后：
// <div key="title" id="title2">title2</div>

// shouldTrackSideEffects 是否要跟踪副作用
function childReconciler(shouldTrackSideEffects) {
  // 如果不需要跟踪副作用，直接返回
  function deleteChild(returnFiber, child) {
    if (!shouldTrackSideEffects) return;
    // 把自己这个副作用添加到父effectList中
    // 删除类型的副作用一般放在父fiber副作用链表的前面，在进行DOM
    // 操作时先执行删除操作
    const lastEffect = returnFiber.lastEffect;
    if (lastEffect) {
      lastEffect.nextEffect = child;
      returnFiber.lastEffect = child;
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = child;
    }
    child.nextEffect = null;
    child.flags = Deletion;
  }
  function deleteRemainingChildren(returnFiber, child) {
    while (child) {
      deleteChild(returnFiber, child);
      child = child.sibling;
    }
  }
  function useFiber(oldFiber, pendingProps) {
    return createWorkInProgress(oldFiber, pendingProps);
  }
  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    const key = element.key;
    let child = currentFirstChild;
    while (child) {
      if (child.key === key) {
        if (child.type === element.type) {
          // key相同，并且type相同，则可以复用旧的fiber节点，并将其余的子节点删除
          deleteRemainingChildren(returnFiber, child.sibling);
          const existing = useFiber(child, element.props);
          existing.return = returnFiber;
          return existing;
        } else {
          // 如果key相同，说明已经找到了这个元素，但是type不同不能复用
          // 也没有必要继续比较剩下的节点了，因此将剩下的节点删除
          deleteRemainingChildren(returnFiber, child);
          break;
        }
      } else {
        // key不同，则删除旧的fiber节点
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }

    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  }
  function placeSingleChild(newFiber) {
    // 如果当前需要跟踪副作用，并且当前这个新的fiber的旧fiber节点不存在
    if (shouldTrackSideEffects && !newFiber.alternate) {
      // 那就给这个新fiber添加一个副作用，表示在未来提前阶段的DOM操作中会向真实DOM树
      // 中添加此节点
      newFiber.flags = Placement;
    }
    return newFiber;
  }

  function createChild(returnFiber, newChild) {
    const created = createFiberFromElement(newChild);
    created.return = returnFiber;
    return created;
  }
  function reconcileChildrenArray(returnFiber, currentFirstChild, newChild) {
    let resultingFirstChild = null;
    let previousNewFiber = null;
    let oldFiber = currentFirstChild;
    let newIdx = 0;
    if (!oldFiber) {
      // 如果没有旧的fiber节点，则遍历newChild，为每个虚拟dom创建一个新的fiber
      for (; newIdx < newChild.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChild[newIdx]);
        // newFiber.flags = Placement;
        if (!previousNewFiber) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      return resultingFirstChild;
    }

    return resultingFirstChild;
  }

  // currentFirstChild 旧的fiber节点 newChild新的虚拟DOM
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    // 判断newChild是不是一个对象，是的话说明新的虚拟DOM只有一个React元素节点
    const isObject = typeof newChild === "object" && newChild;
    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild)
          );
      }
    }
    if (Array.isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
    }
  }

  return reconcileChildFibers;
}

export const reconcileChildFibers = childReconciler(true);

export const mountChildFibers = childReconciler(false);
