import {
    REACT_ELEMENT_TYPE,
} from '@shared/ReactSymbols';
import { createFiberFromElement, createWorkInProgress } from "./ReactFiber";
import { Placement } from './ReactFiberFlags'

function ChildReconciler(shouldTrackSideEffects) {
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
        if (!shouldTrackSideEffects) {
            // Noop.
            return null;
        }

        // TODO: For the shouldClone case, this could be micro-optimized a bit by
        // assuming that after the first child we've already added everything.
        // var childToDelete = currentFirstChild;
        // while (childToDelete !== null) {
        //     deleteChild(returnFiber, childToDelete);
        //     childToDelete = childToDelete.sibling;
        // }

        // return null;
    }
    function placeSingleChild(newFiber) {
        // 单一节点的情况，只需要插入就行，因此这里为fiber节点添加副作用
        if (shouldTrackSideEffects && newFiber.alternate === null) {
            newFiber.flags = Placement;
        }
        return newFiber;
    }
    function createChild(returnFiber, newChild, lanes) {
        const created = createFiberFromElement(newChild, returnFiber.mode, lanes);
        created.return = returnFiber;
        return created;
    }
    function placeChild(newFiber, lastPlaceIndex, newIdx) {
        newFiber.index = newIdx;
        if (!shouldTrackSideEffects) {
            return lastPlaceIndex;
        }
        // const current = newFiber.alternate;
        // if (current) {
        //     const oldIndex = current.index;
        //     // 如果旧fiber对应的真实DOM挂载的索引比lastPlaceIndex小
        //     if (oldIndex < lastPlaceIndex) {
        //         // 旧fiber对应的真实dom就需要移动了
        //         newFiber.flags |= Placement;
        //         return lastPlaceIndex;
        //     } else {
        //         // 否则，不需要移动，并且把旧fiber的原来的挂载索引返回成为新的lastPlaceIndex
        //         return oldIndex;
        //     }
        // } else {
        //     newFiber.flags = Placement;
        //     return lastPlaceIndex;
        // }
    }
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
        let resultingFirstChild = null;
        let previousNewFiber = null;
        let oldFiber = currentFirstChild;
        let lastPlacedIndex = 0;
        let newIdx = 0;
        let nextOldFiber = null;
        if (oldFiber === null) {
            // If we don't have any more existing children we can choose a fast path
            // since the rest will all be insertions.
            for (; newIdx < newChildren.length; newIdx++) {
                const _newFiber = createChild(returnFiber, newChildren[newIdx], lanes);

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
    }
    function reconcileSingleElement(returnFiber, currentFirstChild, element, lanes) {
        const key = element.key;
        let child = currentFirstChild;
        // while (child) {
        //     if (child.key === key) {
        //         if (child.type === element.type) {
        //             // key相同，并且type相同，则可以复用旧的fiber节点，并将其余的子节点删除
        //             deleteRemainingChildren(returnFiber, child.sibling);
        //             const existing = useFiber(child, element.props);
        //             existing.return = returnFiber;
        //             return existing;
        //         } else {
        //             // 如果key相同，说明已经找到了这个元素，但是type不同不能复用
        //             // 也没有必要继续比较剩下的节点了，因此将剩下的节点删除
        //             deleteRemainingChildren(returnFiber, child);
        //             break;
        //         }
        //     } else {
        //         // key不同，则删除旧的fiber节点
        //         deleteChild(returnFiber, child);
        //     }
        //     child = child.sibling;
        // }

        const created = createFiberFromElement(element, returnFiber.mode, lanes);
        created.return = returnFiber;
        return created;
    }
    // 这个方法会标记有副作用的节点，并添加到副作用列表中
    function reconcileChildFibers(returnFiber, currentFirstChild, newChild, lanes) {
        const isObject = typeof newChild === 'object' && newChild !== null;
        if (isObject) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    const child = reconcileSingleElement(returnFiber, currentFirstChild, newChild, lanes)
                    return placeSingleChild(child);
            }
        }
        if (Array.isArray(newChild)) {
            return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
        }
        return deleteRemainingChildren(returnFiber, currentFirstChild);
    }
    return reconcileChildFibers
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);

export function cloneChildFibers(current, workInProgress) {
    const currentChild = workInProgress.child;
    const newChild = createWorkInProgress(currentChild, currentChild.pendingProps);
    workInProgress.child = newChild;
    newChild.return = workInProgress;
    newChild.sibling = null;
}