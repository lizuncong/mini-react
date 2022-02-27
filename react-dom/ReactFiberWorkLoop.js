import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'


let workInProgressRoot = null // 当前正在更新的根
let workInProgress = null; // 当前正在更新的fiber节点

/**
 * 这个方法非常重要
 * 不管如何更新，不管谁来更新，都会调度到这个方法里
*/
export const scheduleUpdateOnFiber = (fiber) => {
    //markUpdateLaneFromFiberToRoot方法的主要目的，不管在fiber树哪个节点触发的更新，都可以往上找到
    // fiber树的根节点，然后从根节点开始调度
    const fiberRoot = markUpdateLaneFromFiberToRoot(fiber)
    performSyncWorkOnRoot(fiberRoot)
}
function performSyncWorkOnRoot(fiberRoot){
    workInProgressRoot = fiberRoot
    // 根据老的fiber树和更新对象创建新的fiber树，然后根据新的fiber树更新真实DOM
    workInProgress = createWorkInProgress(workInProgressRoot.current);

    workLoopSync(); // 开启工作循环

}

// 开始自上而下构建新的fiber树
function workLoopSync(){
    while(workInProgress){
        performUnitOfWork(workInProgress)
    }
}

// 执行单个工作单元
function performUnitOfWork(unitOfWork){
    const current = unitOfWork.alternate
    // beginWork返回下一个工作单元
    const next = beginWork(current, unitOfWork)
    if(next){
        workInProgress = next
    } else {
        // 如果当前fiber没有子fiber，说明当前fiber可以完成了
        completeUnitOfWork(unitOfWork)
    }
}

function markUpdateLaneFromFiberToRoot(sourceFiber){
    let node = sourceFiber
    let parent = node.return
    while(parent){
        node = parent
        parent = parent.return
    }
    return node.stateNode
}