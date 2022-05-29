import { createFiberRoot } from './ReactFiberRoot'
import { createUpdate, enqueueUpdate } from './ReactUpdateQueue'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'


export function createContainer(containerInfo, tag, hydrate, hydrationCallbacks) {
    return createFiberRoot(containerInfo, tag, hydrate);
}


// container是fiber树的容器，即 FiberRootNode
// element是整棵virtual dom树
export function updateContainer(element, container, parentComponent, callback) {
    const current = container.current; // 从fiber树的容器container上获取fiber树的根节点
    const eventTime = performance.now()
    const lane = 1
    container.context = {};

    const update = createUpdate(eventTime, lane);

    update.payload = {
        element: element // 根节点的 update.payload存的是整棵 virtual dom 树
    };
    enqueueUpdate(current, update);
    scheduleUpdateOnFiber(current, lane, eventTime);
    return lane;
}