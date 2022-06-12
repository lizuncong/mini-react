import {
    REACT_ELEMENT_TYPE,
} from '@shared/ReactSymbols';
import { createFiberFromElement, createFiberFromText, createWorkInProgress } from "./ReactFiber";
import { Placement } from './ReactFiberFlags'
// 在协调子节点的过程中：
// 如果重用旧的fiber，重用的节点的兄弟节点需要重置为null，并且重新生成，旧的子节点保留
function ChildReconciler(shouldTrackSideEffects) {
    function deleteChild(returnFiber, childToDelete) {
        if (!shouldTrackSideEffects) {
            // Noop.
            return;
        } // Deletions are added in reversed order so we add it to the front.
        // At this point, the return fiber's effect list is empty except for
        // deletions, so we can just append the deletion to the list. The remaining
        // effects aren't added until the complete phase. Once we implement
        // resuming, this may not be true.


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
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
        if (!shouldTrackSideEffects) {
            // Noop.
            return null;
        }
        // TODO: For the shouldClone case, this could be micro-optimized a bit by
        // assuming that after the first child we've already added everything.
        const childToDelete = currentFirstChild;
        while (childToDelete !== null) {
            deleteChild(returnFiber, childToDelete);
            childToDelete = childToDelete.sibling;
        }
        return null;
    }
    function placeSingleChild(newFiber) {
        // 单一节点的情况，只需要插入就行，因此这里为fiber节点添加副作用
        if (shouldTrackSideEffects && newFiber.alternate === null) {
            newFiber.flags = Placement;
        }
        return newFiber;
    }
    function updateElement(returnFiber, current, element, lanes) {
        if (current !== null) {
            if (current.elementType === element.type) {
                // Move based on index
                const existing = useFiber(current, element.props);
                existing.return = returnFiber;
                return existing;
            }
        }
        const created = createFiberFromElement(newChild);
        created.return = returnFiber;
        return created;
    }
    function createChild(returnFiber, newChild, lanes) {
        if (typeof newChild === 'string' || typeof newChild === 'number') {
            // Text nodes don't have keys. If the previous node is implicitly keyed
            // we can continue to replace it without aborting even if it is not a text
            // node.
            const created = createFiberFromText('' + newChild, returnFiber.mode, lanes);
            created.return = returnFiber;
            return created;
        }
        const created = createFiberFromElement(newChild, returnFiber.mode, lanes);
        created.return = returnFiber;
        return created;
    }
    function updateSlot(returnFiber, oldFiber, newChild, lanes) {
        // Update the fiber if the keys match, otherwise return null.
        const key = oldFiber !== null ? oldFiber.key : null;

        if (typeof newChild === 'object' && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    if (newChild.key === key) {
                        return updateElement(returnFiber, oldFiber, newChild, lanes);
                    } else {
                        return null;
                    }

            }
        }
        return null
    }
    function mapRemainingChildren(returnFiber, currentFirstChild) {
        // Add the remaining children to a temporary map so that we can find them by
        // keys quickly. Implicit (null) keys get added to this set with their index
        // instead.
        const existingChildren = new Map();
        let existingChild = currentFirstChild;
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
    function useFiber(currentFiber, pendingProps) {
        // We currently set sibling to null and index to 0 here because it is easy
        // to forget to do before returning it. E.g. for the single child case.
        const clone = createWorkInProgress(currentFiber, pendingProps);
        clone.index = 0;
        clone.sibling = null;
        return clone;
    }
    function placeChild(newFiber, lastPlacedIndex, newIdx) {
        newFiber.index = newIdx;
        if (!shouldTrackSideEffects) {
            return lastPlacedIndex;
        }
        const current = newFiber.alternate;
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
    function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
        const matchedFiber = existingChildren.get(newChild.key || newIdx);
        return updateElement(returnFiber, matchedFiber, newChild);
    }
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
        let resultingFirstChild = null;
        let previousNewFiber = null;
        let oldFiber = currentFirstChild;
        let lastPlacedIndex = 0;
        let newIdx = 0;
        let nextOldFiber = null;
        // 更新的情况
        for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
            if (oldFiber.index > newIdx) {
                nextOldFiber = oldFiber;
                oldFiber = null;
            } else {
                nextOldFiber = oldFiber.sibling;
            }
            const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes);
            // 如果key不一样，则跳出
            if (newFiber === null) {
                // TODO: This breaks on empty slots like null children. That's
                // unfortunate because it triggers the slow path all the time. We need
                // a better way to communicate whether this was a miss or null,
                // boolean, undefined, etc.
                if (oldFiber === null) {
                    oldFiber = nextOldFiber;
                }

                break;
            }
            if (shouldTrackSideEffects) {
                if (oldFiber && newFiber.alternate === null) {
                    // We matched the slot, but we didn't reuse the existing fiber, so we
                    // need to delete the existing child.
                    deleteChild(returnFiber, oldFiber);
                }
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
        // Add all children to a key map for quick lookups.
        // Keep scanning and use the map to restore deleted items as moves.
        const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
        for (; newIdx < newChildren.length; newIdx++) {
            const newFiber = updateFromMap(
                existingChildren,
                returnFiber,
                newIdx,
                newChildren[newIdx],
                lanes
            );
            if (newFiber !== null) {
                if (shouldTrackSideEffects) {
                    if (newFiber.alternate !== null) {
                        // The new fiber is a work in progress, but if there exists a
                        // current, that means that we reused the fiber. We need to delete
                        // it from the child list so that we don't add it to the deletion
                        // list.
                        existingChildren.delete(newFiber.key === null ? newIdx : newFiber.key);
                    }
                }
                lastPlaceIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
                if (previousNewFiber === null) {
                    resultingFirstChild = newFiber;
                } else {
                    previousNewFiber.sibling = newFiber;
                }
                previousNewFiber = newFiber;
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