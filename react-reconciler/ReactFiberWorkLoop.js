import { beginWork } from './ReactFiberBeginWork'
import { HostRoot } from './ReactWorkTags.js'
import { createWorkInProgress } from './ReactFiber'
export const NoContext = /*             */ 0b0000000;
const BatchedContext = /*               */ 0b0000001;
const EventContext = /*                 */ 0b0000010;
const DiscreteEventContext = /*         */ 0b0000100;
const LegacyUnbatchedContext = /*       */ 0b0001000;
const RenderContext = /*                */ 0b0010000;
const CommitContext = /*                */ 0b0100000;
export const RetryAfterError = /*       */ 0b1000000;
let subtreeRenderLanes = 0;

let executionContext = NoContext;

let workInProgressRoot = null; // The root we're working on
let workInProgress = null; // The fiber we're working on

// 从当前调度的fiber开始，向上找到根节点，从根节点开始更新
// 任何触发更新的方法，都需要调用 scheduleUpdateOnFiber 开始调度更新，比如 setState
export function scheduleUpdateOnFiber(fiber, lane, eventTime) {
    // 找到容器，从根节点开始更新
    const root = markUpdateLaneFromFiberToRoot(fiber, lane); //返回的是FiberRootNode，即 fiber 树的容器
    performSyncWorkOnRoot(root);
}

// This is split into a separate function so we can mark a fiber with pending
// work without treating it as a typical update that originates from an event;
// e.g. retrying a Suspense boundary isn't an update, but it does schedule work
// on a fiber.
function markUpdateLaneFromFiberToRoot(sourceFiber, lane) {
    let node = sourceFiber;
    let parent = sourceFiber.return;

    while (parent !== null) {
        node = parent;
        parent = parent.return;
    }

    if (node.tag === HostRoot) {
        const root = node.stateNode;
        return root;
    } else {
        return null;
    }
}


// This is the entry point for synchronous tasks that don't go
// through Scheduler 这是同步任务的入口点，不通过调度器。
function performSyncWorkOnRoot(root) {
    const lanes = 1
    renderRootSync(root, lanes);
}

// function performSyncWorkOnRoot(fiberRoot) {
//     workInProgressRoot = fiberRoot;
//     // 根据老的fiber树和更新对象创建新的fiber树，然后根据新的fiber树更新真实DOM
//     workInProgress = createWorkInProgress(workInProgressRoot.current);

//     workLoopSync(); // 开启工作循环

//     commitRoot();
// }

let __DEBUG_RENDER_COUNT__ = 0

function renderRootSync(root, lanes) {
    const prevExecutionContext = executionContext;
    executionContext |= RenderContext;
    __DEBUG_RENDER_COUNT__++
    prepareFreshStack(root, lanes);
    // 注意这个while循环，workLoopSync正常执行完才会退出循环。如果workLoopSync里面报错被捕获
    // 则处理错误完成还会继续执行workLoopSync
    // do {
    try {
        workLoopSync();
        // break;
    } catch (thrownValue) {
        console.log('thrownValue....', thrownValue)
    }
    // } while (true);
}
function workLoopSync() {
    while (workInProgress !== null) {
        performUnitOfWork(workInProgress);
    }
}
function prepareFreshStack(root, lanes) {
    root.finishedWork = null;
    workInProgressRoot = root
    workInProgress = createWorkInProgress(root.current, null, __DEBUG_RENDER_COUNT__);
    console.log('createWorkInProgress.........', workInProgress)
}

function performUnitOfWork(unitOfWork) {
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    let current = unitOfWork.alternate;
    let next;
    next = beginWork(current, unitOfWork, subtreeRenderLanes);
    workInProgress = null
}

// function performUnitOfWork(unitOfWork) {
//     const current = unitOfWork.alternate;
//     // beginWork返回下一个工作单元
//     const next = beginWork(current, unitOfWork);
//     // 在beginWork后，需要把新属性同步到老属性上
//     unitOfWork.memoizedProps = unitOfWork.pendingProps;
//     if (next) {
//         workInProgress = next;
//     } else {
//         // 如果当前fiber没有子fiber，说明当前fiber可以完成了
//         completeUnitOfWork(unitOfWork);
//     }
// }