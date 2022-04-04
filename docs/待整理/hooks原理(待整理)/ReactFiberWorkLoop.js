import { beginWork } from './ReactFiberBeginWork'
let workInProgress = null


function performUnitOfWork(unitOfWork){

}
function workLoop(){
    while(workInProgress !== null){
        workInProgress = performUnitOfWork(workInProgress)
    }
}
export const render = (fiber) => {
    workInProgress = fiber
    workLoop()
}