import {
    REACT_ELEMENT_TYPE,
} from '@shared/ReactSymbols';
import { createFiberFromElement } from "./ReactFiber";

function ChildReconciler(shouldTrackSideEffects) {
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
                // return placeSingleChild(child);

                // case REACT_PORTAL_TYPE:
                //     return placeSingleChild(reconcileSinglePortal(returnFiber, currentFirstChild, newChild, lanes));

                // case REACT_LAZY_TYPE:
                //     {
                //         var payload = newChild._payload;
                //         var init = newChild._init; // TODO: This function is supposed to be non-recursive.

                //         return reconcileChildFibers(returnFiber, currentFirstChild, init(payload), lanes);
                //     }

            }
        }
    }
    return reconcileChildFibers
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);