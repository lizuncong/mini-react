import { createHostRootFiber } from './ReactFiber'
import { initializeUpdateQueue } from './ReactUpdateQueue'
function FiberRootNode(containerInfo, tag, hydrate) {
    this.tag = tag; // ReactRootTag  这个tag的所有可能取值在 ReactRootTags.js 文件中，要注意和 fiber 节点中的 this.tag 区分开来
    this.containerInfo = containerInfo;
    // this.pendingChildren = null;
    this.current = null;
    // this.pingCache = null;
    this.finishedWork = null;
    // this.timeoutHandle = noTimeout;
    // this.context = null;
    // this.pendingContext = null;
    // this.hydrate = hydrate;
    // this.callbackNode = null;
    // this.callbackPriority = NoLanePriority;
    // this.eventTimes = createLaneMap(NoLanes);
    // this.expirationTimes = createLaneMap(NoTimestamp);
    // this.pendingLanes = NoLanes;
    // this.suspendedLanes = NoLanes;
    // this.pingedLanes = NoLanes;
    // this.expiredLanes = NoLanes;
    // this.mutableReadLanes = NoLanes;
    // this.finishedLanes = NoLanes;
    // this.entangledLanes = NoLanes;
    // this.entanglements = createLaneMap(NoLanes);
}

// 第二个参数 tag 是 ReactRootTag，不是 fiber 的 ReactWorkTags
export function createFiberRoot(containerInfo, tag, hydrate, hydrationCallbacks) {
    const root = new FiberRootNode(containerInfo, tag, hydrate); // 注意，这并不是一个fiber节点!!!

    // 创建fiber树的根fiber节点，即为container容器创建对应的fiber节点
    const uninitializedFiber = createHostRootFiber(tag);
    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;
    initializeUpdateQueue(uninitializedFiber);
    return root;
}