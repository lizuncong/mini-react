import { beginWork } from './ReactFiberBeginWork'
import { completeWork } from './ReactFiberCompleteWork'
import { PerformedWork, Passive, Callback, PlacementAndUpdate, Snapshot, NoFlags, Placement, Update, Deletion, Hydrating } from './ReactFiberFlags'
import { HostRoot } from './ReactWorkTags.js'
import { createWorkInProgress } from './ReactFiber'
import {
    commitBeforeMutationLifeCycles,
    commitWork,
    commitPlacement,
    commitLifeCycles as commitLayoutEffectOnFiber,
} from './ReactFiberCommitWork'
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
let nextEffect = null;
let pendingPassiveHookEffectsUnmount = [];
let pendingPassiveHookEffectsMount = [];


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

export let __DEBUG_RENDER_COUNT__ = 0

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
function commitRoot(root) {
    const renderPriorityLevel = 97
    commitRootImpl(root, renderPriorityLevel)
    return null
}

function commitRootImpl(root, renderPriorityLevel) {
    const finishedWork = root.finishedWork;
    const lanes = root.finishedLanes;
    root.finishedWork = null;
    let firstEffect
    if (finishedWork.flags > PerformedWork) {
        // A fiber's effect list consists only of its children, not itself. So if
        // the root has an effect, we need to add it to the end of the list. The
        // resulting list is the set that would belong to the root's parent, if it
        // had one; that is, all the effects in the tree including the root.
        if (finishedWork.lastEffect !== null) {
            finishedWork.lastEffect.nextEffect = finishedWork;
            firstEffect = finishedWork.firstEffect;
        } else {
            firstEffect = finishedWork;
        }
    } else {
        // There is no effect on the root.
        firstEffect = finishedWork.firstEffect;
    }
    // firstEffect不为空，说明存在副作用链表，此时firstEffect指向链表的表头
    if (firstEffect !== null) {
        // The commit phase is broken into several sub-phases. We do a separate pass
        // of the effect list for each phase: all mutation effects come before all
        // layout effects, and so on.
        // The first phase a "before mutation" phase. We use this phase to read the
        // state of the host tree right before we mutate it. This is where
        // getSnapshotBeforeUpdate is called.
        // commie阶段被划分成多个小阶段。每个阶段都从头开始遍历整个副作用链表
        nextEffect = firstEffect;
        // 第一个阶段，调用getSnapshotBeforeUpdate等生命周期方法
        commitBeforeMutationEffects();

        // The next phase is the mutation phase, where we mutate the host tree.
        nextEffect = firstEffect // 重置 nextEffect，从头开始
        commitMutationEffects(root, renderPriorityLevel);
        // The work-in-progress tree is now the current tree. This must come after
        // the mutation phase, so that the previous tree is still current during
        // componentWillUnmount, but before the layout phase, so that the finished
        // work is current during componentDidMount/Update.
        root.current = finishedWork;
        // The next phase is the layout phase, where we call effects that read
        // the host tree after it's been mutated. The idiomatic use case for this is
        // layout, but class component lifecycles also fire here for legacy reasons.
        nextEffect = firstEffect // 重置 nextEffect，从头开始
        commitLayoutEffects(root, lanes);
        // We are done with the effect chain at this point so let's clear the
        // nextEffect pointers to assist with GC. If we have passive effects, we'll
        // clear this in flushPassiveEffects.
        nextEffect = firstEffect;

        while (nextEffect !== null) {
            const nextNextEffect = nextEffect.nextEffect;
            nextEffect.nextEffect = null;

            if (nextEffect.flags & Deletion) {
                detachFiberAfterEffects(nextEffect);
            }

            nextEffect = nextNextEffect;
        }
    }


}


// 一次性遍历完整个副作用链表，并执行commitBeforeMutationLifeCycles
function commitBeforeMutationEffects() {
    while (nextEffect !== null) {
        const current = nextEffect.alternate;
        const flags = nextEffect.flags;
        if ((flags & Snapshot) !== NoFlags) {
            commitBeforeMutationLifeCycles(current, nextEffect);
        }
        if ((flags & Passive) !== NoFlags) {
            // If there are passive effects, schedule a callback to flush at
            // the earliest opportunity.
            setTimeout(() => {
                flushPassiveEffects();
            }, 0);
            // if (!rootDoesHavePassiveEffects) {
            // rootDoesHavePassiveEffects = true;
            // scheduleCallback(NormalPriority$1, function () {
            //     flushPassiveEffects();
            //     return null;
            // });
            // }
        }
        nextEffect = nextEffect.nextEffect;
    }
}

function commitMutationEffects(root, renderPriorityLevel) {
    while (nextEffect !== null) {
        const flags = nextEffect.flags
        // The following switch statement is only concerned about placement,
        // updates, and deletions. To avoid needing to add a case for every possible
        // bitmap value, we remove the secondary effects from the effect tag and
        // switch on that value.
        const primaryFlags = flags & (Placement | Update | Deletion | Hydrating);
        switch (primaryFlags) {
            case Placement:
                commitPlacement(nextEffect);
                // Clear the "placement" from effect tag so that we know that this is
                // inserted, before any life-cycles like componentDidMount gets called.
                // TODO: findDOMNode doesn't rely on this any more but isMounted does
                // and isMounted is deprecated anyway so we should be able to kill this.
                nextEffect.flags &= ~Placement;
                break;
            case PlacementAndUpdate:
                // Placement
                commitPlacement(nextEffect);
                // Clear the "placement" from effect tag so that we know that this is
                // inserted, before any life-cycles like componentDidMount gets called.
                nextEffect.flags &= ~Placement; // Update
                var _current = nextEffect.alternate;
                commitWork(_current, nextEffect);
                break;
            case Update:
                var _current3 = nextEffect.alternate;
                commitWork(_current3, nextEffect);
                break;
            case Deletion:
                // commitDeletion(root, nextEffect);
                break;
        }
        nextEffect = nextEffect.nextEffect;
    }
}

function commitLayoutEffects(root, committedLanes) {
    while (nextEffect !== null) {
        const flags = nextEffect.flags;

        if (flags & (Update | Callback)) {
            var current = nextEffect.alternate;
            commitLayoutEffectOnFiber(root, current, nextEffect);
        }
        nextEffect = nextEffect.nextEffect;
    }
}

export function enqueuePendingPassiveHookEffectUnmount(fiber, effect) {
    pendingPassiveHookEffectsUnmount.push(effect, fiber);

}

export function enqueuePendingPassiveHookEffectMount(fiber, effect) {
    pendingPassiveHookEffectsMount.push(effect, fiber);
}

function flushPassiveEffects() {
    // Returns whether passive effects were flushed.
    flushPassiveEffectsImpl()

    return false;
}
function flushPassiveEffectsImpl() {
    // It's important that ALL pending passive effect destroy functions are called
    // before ANY passive effect create functions are called.
    // Otherwise effects in sibling components might interfere with each other.
    // e.g. a destroy function in one component may unintentionally override a ref
    // value set by a create function in another component.
    // Layout effects have the same constraint.

    // First pass: Destroy stale passive effects.
    const unmountEffects = pendingPassiveHookEffectsUnmount;
    pendingPassiveHookEffectsUnmount = [];

    for (let i = 0; i < unmountEffects.length; i += 2) {
        const effect = unmountEffects[i];
        const fiber = unmountEffects[i + 1];
        const destroy = effect.destroy;
        effect.destroy = undefined;

        if (typeof destroy === 'function') {
            destroy();
        }
    }
    // Second pass: Create new passive effects.
    const mountEffects = pendingPassiveHookEffectsMount;
    pendingPassiveHookEffectsMount = [];

    for (let i = 0; i < mountEffects.length; i += 2) {
        const effect = mountEffects[i];
        const fiber = mountEffects[i + 1]
        const create = effect.create;
        effect.destroy = create();
    }
}