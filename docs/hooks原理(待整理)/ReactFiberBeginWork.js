import { IndeterminateComponent } from './ReactWorkTags'

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
    const value = renderWithHooks(current, workInProgress, Component) // value就是Counter组件函数的返回值
}