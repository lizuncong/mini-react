import { HostRoot } from './ReactWorkTag'
import { SyncLane } from './ReactFiberLane'
const SyncLanePriority = 12

export const scheduleUpdateOnFiber = (fiber) => {
    const root = markUpdateLaneFromFiberToRoot(fiber)
    // 开始创建一个任务，从根节点开始进行更新
    ensureRootIsScheduled(root)
}

function ensureRootIsScheduled(root){
    const nextLanes = SyncLane
    const newCallbackPriority = SyncLanePriority // 按理说应该等于最高级别赛道的优先级
    const existingCallbackPriority = root.callbackPriority;// 当前根节点上正在执行的更新任务的优先级
}

function markUpdateLaneFromFiberToRoot(fiber){
    const parent = fiber.return

    while(parent){
        fiber = parent
        parent = parent.return
    }
    if(fiber.tag === HostRoot){
        return fiber
    }
    return null
}