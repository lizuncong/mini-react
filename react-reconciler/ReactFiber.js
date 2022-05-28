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