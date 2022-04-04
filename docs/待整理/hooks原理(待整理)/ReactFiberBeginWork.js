import { IndeterminateComponent, FunctionComponent, HostComponent } from './ReactWorkTags'
import { renderWithHooks } from './ReactFiberHooks'
// current 上一个fiber，workInProgress正在构建中的fiber
export function beginWork(current, workInProgress){
    switch(workInProgress.tag){
        case IndeterminateComponent:
            return mountIndeterminateComponent(
                current,
                workInProgress,
                workInProgress.type,
            )
        default:
            break;
    }

}

function mountIndeterminateComponent(current, workInProgress, Component){
    const children = renderWithHooks(current, workInProgress, Component) // children就是Counter组件函数的返回值

    workInProgress.tag = FunctionComponent

    // 根据儿子的或者说上面返回的虚拟dom，构建Fiber子树
    reconcileChildren(null, workInProgress, children)
    return workInProgress.child
}

function reconcileChildren(current, workInProgress, children){
    const childFiber = {
        tag: HostComponent,
        type: children.type
    }
    workInProgress.child = childFiber
}