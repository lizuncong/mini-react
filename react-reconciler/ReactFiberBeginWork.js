import { renderWithHooks } from './ReactFiberHooks'
import { HostRoot, HostComponent } from './ReactWorkTags'
import { cloneUpdateQueue, processUpdateQueue } from './ReactUpdateQueue'
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
    // const nextChildren = updateQueue.shared.pending.payload.element;
    // reconcileChildren(current, workInProgress, nextChildren);
    // return workInProgress.child;
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

// function reconcileChildren(current, workInProgress, children) {
//     const childFiber = {
//         tag: HostComponent,
//         type: children.type
//     }
//     workInProgress.child = childFiber
// }