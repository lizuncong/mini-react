import { REACT_ELEMENT_TYPE } from '@shared/ReactSymbols' 

// shouldTrackSideEffects 是否要跟踪副作用
function childReconciler(shouldTrackSideEffects){

    function reconcileSingleElement(returnFiber, currentFirstChild, element){
        const created = createFiberFromElement(element)
        created.return = returnFiber
        return created
    }

    // currentFirstChild 旧的fiber节点 newChild新的虚拟DOM
    function reconcileChildFibers(returnFiber, currentFirstChild, newChild){
        // 判断newChild是不是一个对象，是的话说明新的虚拟DOM只有一个React元素节点
        const isObject = typeof newChild === 'obj' && newChild
        if(isObject){
            switch(newChild.$$typeof){
                case REACT_ELEMENT_TYPE:
                    return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild))
            }
        }
    }

    return reconcileChildFibers
}



export const reconcileChildFibers = childReconciler(true)

export const mountChildFibers = childReconciler(false)