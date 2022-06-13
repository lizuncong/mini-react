import { ConcurrentRoot, BlockingRoot } from './ReactRootTags'
import { ConcurrentMode, BlockingMode, StrictMode, NoMode } from './ReactTypeOfMode'
import { HostRoot, HostText, HostComponent, IndeterminateComponent, ClassComponent } from './ReactWorkTags'
import { NoFlags } from './ReactFiberFlags'
import { __DEBUG_RENDER_COUNT__ } from './ReactFiberWorkLoop'
function FiberNode(tag, pendingProps, key, mode) {
    // Instance
    this.tag = tag; // tag所有可能的取值都在 reactWorkTags.js 文件中
    this.key = key;
    this.elementType = null; // 一般情况下 elementType和type相同
    this.type = null;
    // stateNode取值说明
    // 对于类组件，stateNode保存的是类的实例，比如stateNode = new Counter()
    // 对于原生的html标签，stateNode保存的是真实的dom节点，比如 stateNode = document.createElement('button')
    this.stateNode = null;

    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;
    this.ref = null;
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    // updateQueue取值说明
    // 对于类组件，updateQueue存的是更新队列，即this.setState的队列，是一个环状链表
    // 对于函数组件，updateQueue存的是 useEffect的回调，并且是一个环状链表
    // 对于原生HTML标签，对应的fiber.updateQueue存的是diffProperties后需要更新的属性键值对，此时updateQueue就是一个数组
    this.updateQueue = null;
    // memoizedState取值说明：
    // 对于类组件，memoizedState存的是状态值，即类组件的this.state
    // 对于函数组件，memoizedState存的是hook链表
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

function shouldConstruct(Component) {
    const prototype = Component.prototype;
    return !!(prototype && prototype.isReactComponent);
}

function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
    let fiberTag = IndeterminateComponent;
    // 这里只判断了类组件，没有判断函数组件
    if (typeof type === 'function') {
        if (shouldConstruct(type)) {
            fiberTag = ClassComponent;
        }
    } else if (typeof type === 'string') {
        fiberTag = HostComponent;
    }
    const fiber = createFiber(fiberTag, pendingProps, key, mode);

    fiber.elementType = type;
    fiber.type = type;
    fiber.lanes = lanes;

    return fiber;
}

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
        workInProgress.pendingProps = pendingProps;
        // Needed because Blocks store data on type.

        workInProgress.type = current.type;
        // We already have an alternate.
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

    workInProgress.AAA__DEBUG_RENDER_COUNT__ = __DEBUG_RENDER_COUNT__
    return workInProgress
}


export function createFiberFromElement(element, mode, lanes) {
    const { key, type, props: pendingProps } = element
    const owner = null
    const fiber = createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes);

    return fiber
}


export function createFiberFromText(content, mode, lanes) {
    const fiber = createFiber(HostText, content, null, mode);
    fiber.lanes = lanes;
    return fiber;
}