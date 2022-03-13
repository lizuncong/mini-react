import { HostRoot, HostComponent } from './ReactWorkTags'
import { reconcileChildFibers, mountChildFibers } from './ReactChildFiber'
import { shouldSetTextContent } from './ReactDOMHostConfig'
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

function updateHostComponent(current, workInProgress){
    // 获取此原生组件的类型
    const type = workInProgress.type
    // 新属性
    const nextProps = workInProgress.pendingProps
    let nextChildren = nextProps.children
    // 在react对于如果一个原生组件，它只有一个节点，并且这个节点是一个字符串的话，有一个优化，不会对此儿子创建一个fiber
    // 节点，而是把它当成一个属性来处理
    const isDirectTextChild = shouldSetTextContent(type, nextProps)
    if(isDirectTextChild){
        nextChildren = null
    }
    // 处理子节点，根据老fiber和新的虚拟dom进行对比，创建新的fiber树
    reconcileChildren(current, workInProgress, nextChildren)
    return workInProgress.child
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