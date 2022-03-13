import { HostComponent } from "./ReactWorkTags"
import { createInstance } from './ReactDOMHostConfig'

export const completeWork = (current, workInProgress) => {
    const newProps = workInProgress.pendingProps
    switch(workInProgress.tag){
        case HostComponent:
            // 创建真实的DOM节点
            const type = workInProgress.type
            const instance = createInstance(type, newProps) // 创建真实dom
            break
        default:
            break
    }
}