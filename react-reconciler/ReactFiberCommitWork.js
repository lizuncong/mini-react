import { Snapshot } from './ReactFiberFlags'
import { HostRoot, HostComponent, HostPortal, HostText, FundamentalComponent } from './ReactWorkTags'
import { appendChildToContainer } from '@react-dom/client/ReactDOMHostConfig'
import { clearContainer } from '@react-dom/client/ReactDOMHostConfig'
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
// import {
//   appendChild,
//   removeChild,
//   insertBefore,
// } from "../react-dom/ReactDOMHostConfig";
// import { updateProperties } from "../react-dom/ReactDOMComponent";




// // DOM更新
// export function commitWork(current, finishedWork) {
//   const updatePayload = finishedWork.updateQueue;
//   finishedWork.updateQueue = null;
//   if (updatePayload) {
//     updateProperties(finishedWork.stateNode, updatePayload);
//   }
// }

// export function commitDeletion(fiber) {
//   if (!fiber) return;
//   const parentStateNode = getParentStateNode(fiber);
//   removeChild(parentStateNode, fiber.stateNode);
// }
