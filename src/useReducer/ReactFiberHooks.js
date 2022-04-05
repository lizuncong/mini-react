import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'

const ReactCurrentDispatcher = {
    current: null
}
let workInProgressHook = null; // 当前工作中的新的hook指针
let currentHook = null; // 当前的旧的hook指针
let currentlyRenderingFiber // 当前正在使用的fiber
const HookDispatcherOnMount = { // 初次挂载时的方法
    useReducer: mountReducer,
    useState: mountState, // useState其实是useReducer的语法糖
}
const HookDispatcherOnUpdate = { // 更新阶段的方法
    useReducer: updateReducer,
    useState: updateState, // useState其实是useReducer的语法糖
}

function mountState(initialState){
    const hook = mountWorkInProgressHook()
    hook.memoizedState = initialState
    const queue = (hook.queue = { 
        pending: null,
        lastRenderedReducer: basicStateReducer, // 用于判断useState调用多次，设置相同的值，不会触发重新渲染，比如多次setState(2)
        lastRenderState: initialState, // 和上面的lastRenderedReducer一样用于判断useState调用多次，设置相同的值，不会触发重新渲染，比如多次setState(2)
    })
    const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue)
    return [hook.memoizedState, dispatch]
}
function basicStateReducer(state, action){
    return typeof action === 'function' ? action(state) : action
}
function updateState(initialState){
    return updateReducer(basicStateReducer, initialState)
}
function updateReducer(reducer, initialState){
    // 更新时也要构建一个新的hook链表
    const hook = updateWorkInProgressHook();
    const queue = hook.queue // 更新队列
    const lastRenderedReducer = queue.lastRenderedReducer // 上一次reducer方法

    const current = currentHook
    const pendingQueue = queue.pending
    if(pendingQueue !== null){
        // 根据旧的状态和更新队列里的更新对象计算新的状态
        const first = pendingQueue.next // 第一个更新对象
        let newState = current.memoizedState // 旧的状态
        let update = first
        do{
            const action = update.action
            newState = reducer(newState, action)
            update = update.next
        }while(update !== null && update !== first)
        queue.pending = null; // 更新完成，清空链表
        hook.memoizedState = newState; // 让新的hook对象的memoizedState等于计算的新状态
        queue.lastRenderState = newState
    }
    const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue)
    return [hook.memoizedState, dispatch]
}
function updateWorkInProgressHook(){
    let nextCurrentHook;
    if(currentHook === null){
        // 如果currentHook为null，说明这是第一个hook
        const current = currentlyRenderingFiber.alternate; // 旧的fiber节点
        nextCurrentHook = current.memoizedState // 旧的fiber的memoizedState指向旧的hook链表的第一个节点
    } else {
        nextCurrentHook = currentHook.next
    }

    currentHook = nextCurrentHook

    const newHook = {
        memoizedState: currentHook.memoizedState,
        queue: currentHook.queue,
        next: null
    }

    if(workInProgressHook === null){ // 说明这是第一个hook
        currentlyRenderingFiber.memoizedState = workInProgressHook = newHook
    } else {
        workInProgressHook.next = newHook
        workInProgressHook = workInProgressHook.next = newHook
    }
    return workInProgressHook
}
export function useReducer(reducer, initialState){
    return ReactCurrentDispatcher.current.useReducer(reducer, initialState)
}
export function useState(initialState){
    return ReactCurrentDispatcher.current.useState(initialState)
}
// 不同的阶段useReducer有不同的实现
export function renderWithHooks(current, workInProgress, Component){
    currentlyRenderingFiber = workInProgress
    currentlyRenderingFiber.memoizedState = null
    if(current !== null){
        // 说明是更新流程
        ReactCurrentDispatcher.current = HookDispatcherOnUpdate;
    } else {
        // 说明是初次挂载流程
        ReactCurrentDispatcher.current = HookDispatcherOnMount;
    }
    const children = Component();
    currentlyRenderingFiber = null
    workInProgressHook = null
    currentHook = null
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
    const lastRenderedReducer = queue.lastRenderedReducer // 上一次的reducer
    const lastRenderState = queue.lastRenderState // 上一次的state
    const eagerState = lastRenderedReducer(lastRenderState, action) // 计算新的state
    if(Object.is(eagerState, lastRenderState)){
        return
    }
    scheduleUpdateOnFiber(currentlyRenderingFiber)
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