import { Snapshot, Update } from './ReactFiberFlags'
import { HostRoot, FunctionComponent, HostComponent, HostPortal, HostText, FundamentalComponent, ClassComponent } from './ReactWorkTags'
import { appendChildToContainer } from '@react-dom/client/ReactDOMHostConfig'
import {
    Layout as HookLayout,
    NoFlags as NoHookEffect,
    HasEffect as HookHasEffect,
    Passive as HookPassive,
} from './ReactHookEffectTags'
import { clearContainer } from '@react-dom/client/ReactDOMHostConfig'
import {
    enqueuePendingPassiveHookEffectUnmount,
    enqueuePendingPassiveHookEffectMount
} from './ReactFiberWorkLoop'
import { commitUpdateQueue } from './ReactUpdateQueue';



export function commitBeforeMutationLifeCycles(current, finishedWork) {
    switch (finishedWork.tag) {
        case HostRoot:
            if (finishedWork.flags & Snapshot) {
                const root = finishedWork.stateNode;
                clearContainer(root.containerInfo);
            }
            return;

    }
    console.log('commitBeforeMutationLifeCycles函数，tag不存在：', finishedWork.tag)
}
function isHostParent(fiber) {
    return fiber.tag === HostComponent || fiber.tag === HostRoot;
}
function getHostParentFiber(fiber) {
    const parent = fiber.return;
    while (parent !== null) {
        if (isHostParent(parent)) {
            return parent;
        }
        parent = parent.return;
    }
}
function getHostSibling(fiber) {
    // We're going to search forward into the tree until we find a sibling host
    // node. Unfortunately, if multiple insertions are done in a row we have to
    // search past them. This leads to exponential search for the next sibling.
    // TODO: Find a more efficient way to do this.

    // 查找兄弟节点，找到最近一个，不是插入的节点，返回
    let node = fiber;
    siblings: while (true) {
        // If we didn't find anything, let's try the next sibling.
        while (node.sibling === null) {
            if (node.return === null || isHostParent(node.return)) {
                // If we pop out of the root or hit the parent the fiber we are the
                // last sibling.
                return null;
            }

            node = node.return;
        }

        // node.sibling.return = node.return;
        // node = node.sibling;

        // while (node.tag !== HostComponent && node.tag !== HostText && node.tag !== DehydratedFragment) {
        //     // If it is not host node and, we might have a host node inside it.
        //     // Try to search down until we find one.
        //     if (node.flags & Placement) {
        //         // If we don't have a child, try the siblings instead.
        //         continue siblings;
        //     } // If we don't have a child, try the siblings instead.
        //     // We also skip portals because they are not part of this host tree.


        //     if (node.child === null || node.tag === HostPortal) {
        //         continue siblings;
        //     } else {
        //         node.child.return = node;
        //         node = node.child;
        //     }
        // } // Check if this host node is stable or about to be placed.


        // if (!(node.flags & Placement)) {
        //     // Found it!
        //     return node.stateNode;
        // }
    }

}
export function commitPlacement(finishedWork) {
    const parentFiber = getHostParentFiber(finishedWork);
    // Note: these two variables *must* always be updated together.
    let parent;
    let isContainer;
    let parentStateNode = parentFiber.stateNode;
    switch (parentFiber.tag) {
        case HostComponent:
            parent = parentStateNode;
            isContainer = false;
            break;
        case HostRoot:
            parent = parentStateNode.containerInfo;
            isContainer = true;
            break;
        case FundamentalComponent:
        default:
            console.log('commitPlacement..容器节点不匹配')
    }
    const before = getHostSibling(finishedWork);
    // We only have the top Fiber that was inserted but we need to recurse down its
    // children to find all the terminal nodes.
    if (isContainer) {
        insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
    } else {
        // insertOrAppendPlacementNode(finishedWork, before, parent);
    }
    //   const stateNode = nextEffect.stateNode;
    //   let before = getHostSibling(nextEffect);
    //   if (before) {
    //     insertBefore(parentStateNode, stateNode, before);
    //   } else {
    //     appendChild(parentStateNode, stateNode);
    //   }
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
    const tag = node.tag;
    const isHost = tag === HostComponent || tag === HostText;
    let child = node.child;


    if (isHost) {
        const stateNode = isHost ? node.stateNode : node.stateNode.instance;
        if (before) {
            // insertInContainerBefore(parent, stateNode, before);
        } else {
            appendChildToContainer(parent, stateNode);
        }
    } else if (tag === HostPortal) {

    } else {
        const child = node.child;

        if (child !== null) {
            insertOrAppendPlacementNodeIntoContainer(child, before, parent);
            let sibling = child.sibling;

            while (sibling !== null) {
                insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
                sibling = sibling.sibling;
            }
        }
    }
}


// DOM更新
export function commitWork(current, finishedWork) {
    //   const updatePayload = finishedWork.updateQueue;
    //   finishedWork.updateQueue = null;
    //   if (updatePayload) {
    //     updateProperties(finishedWork.stateNode, updatePayload);
    //   }
    switch (finishedWork.tag) {
        case FunctionComponent:
            // Layout effects are destroyed during the mutation phase so that all
            // destroy functions for all fibers are called before any create functions.
            // This prevents sibling component effects from interfering with each other,
            // e.g. a destroy function in one component should never override a ref set
            // by a create function in another component during the same commit.
            // 执行函数组件的 useEffect 以及 useLayoutEffect 的清除回调，注意是清除回调，即 effect 的返回函数
            commitHookEffectListUnmount(HookLayout | HookHasEffect, finishedWork);
            return;
        case ClassComponent:
            return
    }
}
function commitHookEffectListUnmount(tag, finishedWork) {
    let updateQueue = finishedWork.updateQueue;
    let lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

    if (lastEffect !== null) {
        let firstEffect = lastEffect.next;
        let effect = firstEffect;
        do {
            if ((effect.tag & tag) === tag) {
                // Unmount
                const destroy = effect.destroy;
                effect.destroy = undefined;

                if (destroy !== undefined) {
                    destroy();
                }
            }

            effect = effect.next;
        } while (effect !== firstEffect);
    }
}

export function commitLifeCycles(finishedRoot, current, finishedWork, committedLanes) {
    switch (finishedWork.tag) {
        case FunctionComponent:
            // At this point layout effects have already been destroyed (during mutation phase).
            // This is done to prevent sibling component effects from interfering with each other,
            // e.g. a destroy function in one component should never override a ref set
            // by a create function in another component during the same commit.
            // 执行函数组件的 useLayoutEffect 回调
            commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
            // 将 useEffect 放入异步更新队列
            schedulePassiveEffects(finishedWork);
            return;
        case ClassComponent:
            const instance = finishedWork.stateNode;
            if (finishedWork.flags & Update) {
                if (current === null) {
                    instance.componentDidMount();
                } else {
                    // var prevProps = finishedWork.elementType === finishedWork.type ? current.memoizedProps : resolveDefaultProps(finishedWork.type, current.memoizedProps);
                    // var prevState = current.memoizedState; 
                    // // We could update instance props and state here,
                    // instance.componentDidUpdate(prevProps, prevState, instance.__reactInternalSnapshotBeforeUpdate);
                }
            }
            // TODO: I think this is now always non-null by the time it reaches the
            // commit phase. Consider removing the type check.
            const updateQueue = finishedWork.updateQueue;
            if (updateQueue !== null) {
                // but instead we rely on them being set during last render.
                // TODO: revisit this when we implement resuming.
                commitUpdateQueue(finishedWork, updateQueue, instance);
            }
            return;
    }
}
function commitHookEffectListMount(tag, finishedWork) {
    const updateQueue = finishedWork.updateQueue;
    const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

    if (lastEffect !== null) {
        const firstEffect = lastEffect.next;
        let effect = firstEffect;

        do {
            if ((effect.tag & tag) === tag) {
                // Mount
                const create = effect.create;
                effect.destroy = create();
            }

            effect = effect.next;
        } while (effect !== firstEffect);
    }
}

function schedulePassiveEffects(finishedWork) {
    const updateQueue = finishedWork.updateQueue;
    const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

    if (lastEffect !== null) {
        const firstEffect = lastEffect.next;
        let effect = firstEffect;

        do {
            const { next, tag } = effect

            if ((tag & HookPassive) !== NoHookEffect && (tag & HookHasEffect) !== NoHookEffect) {
                enqueuePendingPassiveHookEffectUnmount(finishedWork, effect);
                enqueuePendingPassiveHookEffectMount(finishedWork, effect);
            }

            effect = next;
        } while (effect !== firstEffect);
    }
}
// export function commitDeletion(fiber) {
//   if (!fiber) return;
//   const parentStateNode = getParentStateNode(fiber);
//   removeChild(parentStateNode, fiber.stateNode);
// }
