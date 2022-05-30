import { renderWithHooks } from './ReactFiberHooks'
import { HostRoot, HostComponent } from './ReactWorkTags'
import { cloneUpdateQueue, processUpdateQueue } from './ReactUpdateQueue'
import {
    mountChildFibers,
    reconcileChildFibers,
} from './ReactChildFiber';

function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
    if (current === null) {
        /// 初次渲染不需要追踪副作用
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderLanes);
    } else {
        // If the current child is the same as the work in progress, it means that
        // we haven't yet started any work on these children. Therefore, we use
        // the clone algorithm to create a copy of all the current children.
        // If we had any progressed work already, that is invalid at this point so
        // let's throw it out.
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes);
    }
}

export function beginWork(current, workInProgress, renderLanes) {
    switch (workInProgress.tag) {
        case HostRoot:
            return updateHostRoot(current, workInProgress, renderLanes);
        case HostComponent:
        // return updateHostComponent(current, workInProgress);
    }
    console.log('beginWork..tag不存在', workInProgress.tag)
}


function updateHostRoot(current, workInProgress, renderLanes) {
    const updateQueue = workInProgress.updateQueue;
    const nextProps = workInProgress.pendingProps;
    const prevState = workInProgress.memoizedState;
    cloneUpdateQueue(current, workInProgress)
    processUpdateQueue(workInProgress, nextProps, null, renderLanes);
    const nextState = workInProgress.memoizedState;
    const nextChildren = nextState.element
    const root = workInProgress.stateNode
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    return workInProgress.child;
}

// function updateFunctionComponent(current, workInProgress, Component) {
//     const newChildren = renderWithHooks(current, workInProgress, Component)

//     // 根据儿子的或者说上面返回的虚拟dom，构建Fiber子树
//     reconcileChildren(null, workInProgress, newChildren)
//     return workInProgress.child
// }


// function mountIndeterminateComponent(current, workInProgress, Component) {
//     const children = renderWithHooks(current, workInProgress, Component) // children就是Counter组件函数的返回值
//     workInProgress.tag = FunctionComponent // 初次渲染后，此时组件类型已经明确，因此需要修改tag

//     // 根据儿子的或者说上面返回的虚拟dom，构建Fiber子树
//     reconcileChildren(null, workInProgress, children)
//     return workInProgress.child; // null
// }
