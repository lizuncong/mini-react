import { HostRoot, HostComponent } from './ReactWorkTags'

export function beginWork(current, workInProgress){
    switch(workInProgress.tag){
        case HostRoot:
            return updateHostRoot(current, workInProgress)
        case HostComponent:
            return updateHostComponent(current, workInProgress)
        default:
            break
    }
}

// 更新、挂载根节点
function updateHostRoot(current, workInProgress){
    const updateQueue = workInProgress.updateQueue
    const nextChildren = updateQueue.shared.pending.payload.element
    reconcileChildren(current, workInProgress, nextChildren)
    return workInProgress.child
}

function updateHostComponent(){

}


export function reconcileChildren(current, workInProgress, nextChildren){
    if(current){
        workInProgress.child = reconcileChildFibers(
            workInProgress,
            current && current.child, // 旧的fiber的第一个子fiber节点
            nextChildren // 新的虚拟DOM
        )
    } else {
        // 初次渲染，不需要比较
        workInProgress.child = mountChildFibers(
            workInProgress,
            current && current.child,
            nextChildren
        )
    }
}