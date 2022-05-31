import { renderWithHooks } from './ReactFiberHooks'
import { PerformedWork } from './ReactFiberFlags'
import { HostRoot, HostComponent, ClassComponent } from './ReactWorkTags'
import { cloneUpdateQueue, processUpdateQueue } from './ReactUpdateQueue'
import {
    mountChildFibers,
    reconcileChildFibers,
} from './ReactChildFiber';
import ReactSharedInternals from '@shared/ReactSharedInternals';
import { constructClassInstance, mountClassInstance } from './ReactFiberClassComponent'
import { shouldSetTextContent } from './ReactDOMHostConfig'


const ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;


function updateClassComponent(current, workInProgress, Component, nextProps, renderLanes) {
    const hasContext = false
    const instance = workInProgress.stateNode;
    let shouldUpdate
    if (instance === null) {
        constructClassInstance(workInProgress, Component, nextProps);
        mountClassInstance(workInProgress, Component, nextProps, renderLanes);
        shouldUpdate = true;
    }
    return finishClassComponent(current, workInProgress, Component, shouldUpdate, hasContext, renderLanes);
}
function finishClassComponent(current, workInProgress, Component, shouldUpdate, hasContext, renderLanes) {
    const instance = workInProgress.stateNode;
    // Rerender
    ReactCurrentOwner.current = workInProgress;
    let nextChildren
    nextChildren = instance.render();
    workInProgress.flags |= PerformedWork; // PerformedWork 用于 React Dev Tools
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    workInProgress.memoizedState = instance.state;
    return workInProgress.child;
}
function updateHostRoot(current, workInProgress, renderLanes) {
    const updateQueue = workInProgress.updateQueue;
    const nextProps = workInProgress.pendingProps;
    const prevState = workInProgress.memoizedState;
    cloneUpdateQueue(current, workInProgress)
    processUpdateQueue(workInProgress, nextProps, null, renderLanes);
    const nextState = workInProgress.memoizedState;
    const nextChildren = nextState.element
    const root = workInProgress.stateNode
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    return workInProgress.child;
}

function updateHostComponent(current, workInProgress, renderLanes) {
    const type = workInProgress.type; // 原生的html标签，如 button
    const nextProps = workInProgress.pendingProps;
    let nextChildren = nextProps.children;
    // 对于原生的html标签，如果只有一个子节点，并且这个自己点是一个字符串或者数字的话，则
    // 不会对此子节点创建fiber
    const isDirectTextChild = shouldSetTextContent(type, nextProps);
    if (isDirectTextChild) {
        nextChildren = null;
    }
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}
function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
    if (current === null) {
        /// 初次渲染不需要追踪副作用
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderLanes);
    } else {
        // If the current child is the same as the work in progress, it means that
        // we haven't yet started any work on these children. Therefore, we use
        // the clone algorithm to create a copy of all the current children.
        // If we had any progressed work already, that is invalid at this point so
        // let's throw it out.
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes);
    }
}

export function beginWork(current, workInProgress, renderLanes) {
    switch (workInProgress.tag) {
        case ClassComponent:
            {
                const _Component2 = workInProgress.type;
                const _unresolvedProps = workInProgress.pendingProps;
                const _resolvedProps = _unresolvedProps

                return updateClassComponent(current, workInProgress, _Component2, _resolvedProps, renderLanes);
            }
        case HostRoot:
            return updateHostRoot(current, workInProgress, renderLanes);
        case HostComponent:
            return updateHostComponent(current, workInProgress);
    }
    console.log('beginWork..tag不存在', workInProgress.tag)
}




// function updateFunctionComponent(current, workInProgress, Component) {
//     const newChildren = renderWithHooks(current, workInProgress, Component)

//     // 根据儿子的或者说上面返回的虚拟dom，构建Fiber子树
//     reconcileChildren(null, workInProgress, newChildren)
//     return workInProgress.child
// }


// function mountIndeterminateComponent(current, workInProgress, Component) {
//     const children = renderWithHooks(current, workInProgress, Component) // children就是Counter组件函数的返回值
//     workInProgress.tag = FunctionComponent // 初次渲染后，此时组件类型已经明确，因此需要修改tag

//     // 根据儿子的或者说上面返回的虚拟dom，构建Fiber子树
//     reconcileChildren(null, workInProgress, children)
//     return workInProgress.child; // null
// }
