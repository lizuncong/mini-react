import { REACT_ELEMENT_TYPE } from '@shared/ReactSymbols' 
import { createFiberFromElement } from './ReactFiber'
import { Placement } from './ReactFiberFlags'

// shouldTrackSideEffects 是否要跟踪副作用
function childReconciler(shouldTrackSideEffects){

    function reconcileSingleElement(returnFiber, currentFirstChild, element){
        const created = createFiberFromElement(element)
        created.return = returnFiber
        return created
    }
    function placeSingleChild(newFiber){
        // 如果当前需要跟踪副作用，并且当前这个新的fiber的旧fiber节点不存在
        if(shouldTrackSideEffects && !newFiber.alternate){
            // 那就给这个新fiber添加一个副作用，表示在未来提前阶段的DOM操作中会向真实DOM树
            // 中添加此节点
            newFiber.flags = Placement
        }
        return newFiber
    }

    // currentFirstChild 旧的fiber节点 newChild新的虚拟DOM
    function reconcileChildFibers(returnFiber, currentFirstChild, newChild){
        // 判断newChild是不是一个对象，是的话说明新的虚拟DOM只有一个React元素节点
        const isObject = typeof newChild === 'object' && newChild
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