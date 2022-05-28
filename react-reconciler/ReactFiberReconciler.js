import { createFiberRoot } from './ReactFiberRoot'
import { createUpdate } from './ReactUpdateQueue'



export function createContainer(containerInfo, tag, hydrate, hydrationCallbacks) {
    return createFiberRoot(containerInfo, tag, hydrate);
}
// 把虚拟DOM element变成真实dom插入到container容器中
// export const updateContainer = (element, container) => {
//     // 获取hostRootFiber，fiber树的根节点
//     const current = container.current
//     const update = createUpdate()
//     update.payload = { element }
//     enqueueUpdate(current, update)
//     scheduleUpdateOnFiber(current)
// }
export function updateContainer(element, container, parentComponent, callback) {
    console.log('element....', element)
    console.log('container....', container)
    const current = container.current; // 从fiber树的容器container上获取fiber树的根节点

    container.context = {};

    const update = createUpdate(eventTime, lane); // Caution: React DevTools currently depends on this property
    // being called "element".

    update.payload = {
        element: element
    };
    callback = callback === undefined ? null : callback;

    if (callback !== null) {

        update.callback = callback;
    }

    enqueueUpdate(current, update);
    scheduleUpdateOnFiber(current, lane, eventTime);
    return lane;
}