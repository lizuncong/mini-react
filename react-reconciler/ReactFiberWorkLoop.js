import { beginWork } from './ReactFiberBeginWork'
import { completeWork } from './ReactFiberCompleteWork'
import { PerformedWork } from './ReactFiberFlags'
import { HostRoot } from './ReactWorkTags.js'
import { createWorkInProgress } from './ReactFiber'
import ReactSharedInternals from '@shared/ReactSharedInternals.js'
const ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner


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
    renderRootSync(root, lanes); // render阶段
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    commitRoot(root);
}

let __DEBUG_RENDER_COUNT__ = 0

function renderRootSync(root, lanes) {
    const prevExecutionContext = executionContext;
    executionContext |= RenderContext;
    __DEBUG_RENDER_COUNT__++
    prepareFreshStack(root, lanes);
    workLoopSync();
}
function workLoopSync() {
    // while (workInProgress !== null) {
    //     performUnitOfWork(workInProgress);
    // }
    while (workInProgress) {
        performUnitOfWork(workInProgress);
    }
}
function prepareFreshStack(root, lanes) {
    root.finishedWork = null;
    workInProgressRoot = root
    workInProgress = createWorkInProgress(root.current, null, __DEBUG_RENDER_COUNT__);
    console.log('workLoop.prepareFreshStack ===createWorkInProgress.........', workInProgress)
}

function performUnitOfWork(unitOfWork) {
    console.log('performUnitOfWork====', unitOfWork)
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    let current = unitOfWork.alternate;
    const next = beginWork(current, unitOfWork, subtreeRenderLanes);
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    if (next === null) {
        // If this doesn't spawn new work, complete the current work.
        completeUnitOfWork(unitOfWork);
    } else {
        workInProgress = next;
    }

    ReactCurrentOwner.current = null; // fiber.owner 有什么作用？
}

function completeUnitOfWork(unitOfWork) {
    let completedWork = unitOfWork;
    do {
        const current = completedWork.alternate;
        const returnFiber = completedWork.return;
        let next
        // 完成此fiber对应的真实DOM节点创建和属性赋值的功能
        next = completeWork(current, completedWork, subtreeRenderLanes);
        // 开始构建副作用列表。Append all the effects of the subtree and this fiber onto the effect
        // list of the parent. The completion order of the children affects the
        // side-effect order.
        if (returnFiber !== null) {
            if (returnFiber.firstEffect === null) {
                returnFiber.firstEffect = completedWork.firstEffect;
            }
            if (completedWork.lastEffect !== null) {
                if (returnFiber.lastEffect !== null) {
                    returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
                }
                returnFiber.lastEffect = completedWork.lastEffect;
            }
            const flags = completedWork.flags;

            if (flags > PerformedWork) {
                if (returnFiber.lastEffect !== null) {
                    returnFiber.lastEffect.nextEffect = completedWork;
                } else {
                    returnFiber.firstEffect = completedWork;
                }

                returnFiber.lastEffect = completedWork;
            }
        }
        const siblingFiber = completedWork.sibling;
        if (siblingFiber !== null) {
            // If there is more work to do in this returnFiber, do that next.
            workInProgress = siblingFiber;
            return;
        }


        completedWork = returnFiber;

        workInProgress = completedWork;

    } while (completedWork !== null);
}


/****************************** 以下是 commit 阶段涉及的函数 ******************************/
function commitRoot() {
    // const finishedWork = workInProgressRoot.current.alternate;
    // workInProgressRoot.finishedWork = finishedWork;
    // commitMutationEffects(workInProgressRoot);
    const renderPriorityLevel = 97
    commitRootImpl(root, renderPriorityLevel)
    return null
}

function commitRootImpl(root, renderPriorityLevel) {
    const finishedWork = root.finishedWork;
    root.finishedWork = null;
}