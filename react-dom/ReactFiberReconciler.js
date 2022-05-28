import { createUpdate, enqueueUpdate } from './ReactUpdateQueue'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
// 把虚拟DOM element变成真实dom插入到container容器中
export const updateContainer = (element, container) => {
    // 获取hostRootFiber，fiber树的根节点
    const current = container.current
    const update = createUpdate()
    update.payload = { element }
    enqueueUpdate(current, update)
    scheduleUpdateOnFiber(current)
}

// TODO: 需要删除