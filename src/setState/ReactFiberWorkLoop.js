import { ClassComponent, HostRoot } from './ReactWorkTags'
import { SyncLane } from './ReactFiberLane'
import { ConcurrentMode } from './ReactTypeOfMode'
const SyncLanePriority = 12;
const NoLanePriority = 0;
const NoContext = 0; // 非批量执行，即同步执行
const BatchedContext = 1;
let executionContext = NoContext // 执行环境，默认值是NoContext，非批量
let syncQueue = [];

export function scheduleUpdateOnFiber(fiber){
    const root = markUpdateLaneFromFiberToRoot(fiber)
    // 开始创建一个任务，从根节点开始进行更新
    ensureRootIsScheduled(root)

    // 如果当前的执行上下文环境是NoContext(非批量)并且mode不是并发的话，直接刷新队列
    if(executionContext === NoContext && (fiber.mode & ConcurrentMode) === NoMode ){
        flushSyncCallbackQueue()
    }
}

export function batchedUpdate(fn){
    const prevExecutionContext = executionContext
    executionContext |= BatchedContext
    fn()
    executionContext = prevExecutionContext
}


function ensureRootIsScheduled(root, currentTime){

    // 饿死：有些低优先级的任务可能一直都没机会执行，即将超时或者已超时
    // 将饿死的lane标记为过期的任务
    // markStarvedLanesAsExpired(root, currentTime)
    const nextLanes = SyncLane;
    const newCallbackPriority = SyncLanePriority; // 按理说应该等于最高级别lane的优先级

    const existingCallbackPriority = root.callbackPriority // 当前根节点上正在执行的更新任务的优先级

    if(existingCallbackPriority === newCallbackPriority){
        return; // 如果这个新的更新和当前根节点的已经调度的更新相等，那就直接返回，复用上次的更新，不再创建新的更新任务
    }

    // 开始调度同步的任务
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root))

    queueMicrotask(flushSyncCallbackQueue)

    root.callbackPriority = newCallbackPriority
}

function flushSyncCallbackQueue(){
    syncQueue.forEach(cb => cb())
    syncQueue = []
}

// 其实就是把performSyncWorkOnRoot函数添加到队列里，等待执行
function scheduleSyncCallback(callback){
    syncQueue.push(callback)
}

// 真正的渲染任务
function performSyncWorkOnRoot(workInProgress){
    const root = workInProgress
    console.log('开始执行协调任务')
    while(workInProgress){
        if(workInProgress.tag === ClassComponent){
            const inst = workInProgress.stateNode; // 获取此Fiber对应的类组件的实例
            inst.state = processUpdateQueue(inst, workInProgress)
            inst.render(); // 计算出新状态后，就可以调用render方法得到新的虚拟dom，进行dom diff更新DOM
        }
        workInProgress = workInProgress.child
    }
    commitRoot(root)
}
function commitRoot(root){
    root.callbackPriority = NoLanePriority
}
// 根据老状态和我们的更新队列计算新状态
function processUpdateQueue(inst, fiber){
    return fiber.updateQueue.reduce((state, { payload }) => {
        if(typeof payload === 'function'){
            payload = payload(state)
        }
        return { ...state, ...payload }
    }, inst.state)
}
function markUpdateLaneFromFiberToRoot(fiber){
    let parent = fiber.return
    while(parent){
        fiber = parent
        parent = parent.return
    }
    if(fiber.tag === HostRoot){
        return fiber
    }
    return null
}