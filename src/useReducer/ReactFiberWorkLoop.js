import { beginWork } from './ReactFiberBeginWork'
let workInProgress = null


function performUnitOfWork(unitOfWork){
    const current = unitOfWork.alternate
    return beginWork(current, unitOfWork)
}
function workLoop(){
    while(workInProgress){
        workInProgress = performUnitOfWork(workInProgress)
    }
}

// 源码里此处要从当前fiber，向上找到根节点再进行更新
// 老的counterFiber向上找到根节点fiberRoot -> 然后再一级一级
// 向下执行render再次渲染CounterFiber
export function scheduleUpdateOnFiber(fiber){
    const newFiber = {
        ...fiber,
        alternate: fiber
    }
    workInProgress = newFiber
    workLoop()
}


export const render = (fiber) => {
    workInProgress = fiber
    workLoop()
}