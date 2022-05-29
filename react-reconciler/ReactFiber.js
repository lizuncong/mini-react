import { ConcurrentRoot, BlockingRoot } from './ReactRootTags'
import { ConcurrentMode, BlockingMode, StrictMode, NoMode } from './ReactTypeOfMode'
import { HostRoot } from './ReactWorkTags'
import { NoFlags } from './ReactFiberFlags'
function FiberNode(tag, pendingProps, key, mode) {
    // Instance
    this.tag = tag; // tag所有可能的取值都在 reactWorkTags.js 文件中
    this.key = key;
    this.elementType = null;
    this.type = null;
    this.stateNode = null; // Fiber

    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;
    this.ref = null;
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.updateQueue = null;
    this.memoizedState = null;
    this.dependencies = null;
    this.mode = mode; // Effects

    this.flags = NoFlags; // effect type，需要执行的副作用，比如增删改查，flags所有可能的取值在 ReactFiberFlags.js 文件中
    this.nextEffect = null; // nextEffect firstEffect lastEffect 都是副作用列表相关的指针
    this.firstEffect = null;
    this.lastEffect = null;
    // this.lanes = NoLanes;
    // this.childLanes = NoLanes;
    this.alternate = null;
}
function createFiber(tag, pendingProps, key, mode) {
    return new FiberNode(tag, pendingProps, key, mode);
};

export function createHostRootFiber(tag) {
    let mode;

    if (tag === ConcurrentRoot) {
        mode = ConcurrentMode | BlockingMode | StrictMode;
    } else if (tag === BlockingRoot) {
        mode = BlockingMode | StrictMode;
    } else {
        mode = NoMode;
    }

    return createFiber(HostRoot, null, null, mode);
}

// This is used to create an alternate fiber to do work on.
export function createWorkInProgress(current, pendingProps, debugForMe) {
    let workInProgress = current.alternate;
    if (workInProgress === null) {
        // We use a double buffering pooling technique because we know that we'll
        // only ever need at most two versions of a tree. We pool the "other" unused
        // node that we're free to reuse. This is lazily created to avoid allocating
        // extra objects for things that are never updated. It also allow us to
        // reclaim the extra memory if needed.
        workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode);
        workInProgress.elementType = current.elementType;
        workInProgress.type = current.type;
        workInProgress.stateNode = current.stateNode;

        // 创建的时候，新旧节点的alternate互相引用
        workInProgress.alternate = current;
        current.alternate = workInProgress;
    } else {
        workInProgress.pendingProps = pendingProps; // Needed because Blocks store data on type.

        workInProgress.type = current.type; // We already have an alternate.
        // Reset the effect tag.

        workInProgress.flags = NoFlags; // The effect list is no longer valid.

        workInProgress.nextEffect = null;
        workInProgress.firstEffect = null;
        workInProgress.lastEffect = null;
    }
    workInProgress.child = current.child;
    workInProgress.memoizedProps = current.memoizedProps;
    workInProgress.memoizedState = current.memoizedState;
    workInProgress.updateQueue = current.updateQueue;
    workInProgress.sibling = current.sibling;
    workInProgress.index = current.index;

    workInProgress.__DEBUG_RENDER_COUNT__ = debugForMe
    return workInProgress
}