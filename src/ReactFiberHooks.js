const ReactCurrentDispatcher = {
    current: null
}
let workInProgressHook = null;
let currentlyRenderingFiber // 当前正在使用的fiber
const HookDispatcherOnMount = {
    useReducer: mountReducer
}

export function useReducer(reducer, initialState){
    ReactCurrentDispatcher.current.useReducer(reducer, initialState)
}
// 不同的阶段useReducer有不同的实现
export function renderWithHooks(current, workInProgress, Component){
    currentlyRenderingFiber = workInProgress
    ReactCurrentDispatcher.current = HookDispatcherOnMount;
    const children = Component();
    currentlyRenderingFiber = null
    return children
}

function mountReducer(reducer, initialState){
    // 构建hooks单向链表
    const hook = mountWorkInProgressHook();
    hook.memoizedState = initialState
    const queue = (hook.queue = { pending: null }) // 更新队列
    const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue)
    return [hook.memoizedState, dispatch]
}

function dispatchAction(currentlyRenderingFiber, queue, action){
    const update = { action, next: null }
    const pending = queue.pending;
    if(pending === null){
        update.next = update
    } else {
        update.next = pending.next;
        pending.next = update;
    }
    queue.pending = update
}

function mountWorkInProgressHook(){
    const hook = { // 创建一个hook对象
        memoizedState: null, // 自己的状态
        queue: null, // 自己的更新队列，环形列表
        next: null // 下一个更新
    }
    if(workInProgressHook === null){
        currentlyRenderingFiber.memoizedState = workInProgressHook = hook
    } else {
        workInProgressHook = workInProgressHook.next = hook
    }

    return workInProgressHook
}