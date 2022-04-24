import { IndeterminateComponent, FunctionComponent, HostComponent } from './ReactWorkTags'
import { renderWithHooks } from './ReactFiberHooks'
export function beginWork(current, workInProgress){
    if(current){ // 有值说明是更新
        switch(workInProgress.tag){
            case FunctionComponent:
                return updateFunctionComponent(
                    current,
                    workInProgress,
                    workInProgress.type,
                )
            default:
                break;
        }
    } else {
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
}

function updateFunctionComponent(current, workInProgress, Component){
    const newChildren = renderWithHooks(current, workInProgress, Component)

    // 根据儿子的或者说上面返回的虚拟dom，构建Fiber子树
    reconcileChildren(null, workInProgress, newChildren)
    return workInProgress.child
}


function mountIndeterminateComponent(current, workInProgress, Component){
    const children = renderWithHooks(current, workInProgress, Component) // children就是Counter组件函数的返回值
    workInProgress.tag = FunctionComponent // 初次渲染后，此时组件类型已经明确，因此需要修改tag

    // 根据儿子的或者说上面返回的虚拟dom，构建Fiber子树
    reconcileChildren(null, workInProgress, children)
    return workInProgress.child; // null
}

function reconcileChildren(current, workInProgress, children){
    const childFiber = {
        tag: HostComponent,
        type: children.type
    }
    workInProgress.child = childFiber
}