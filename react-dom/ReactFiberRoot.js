import { createHostRootFiber } from './ReactFiber'
import { initializeUpdateQueue } from './ReactUpdateQueue'
export function createFiberRoot(containerInfo){
    const fiberRoot = {
        containerInfo
    }
    // 创建fiber树的根节点
    const hostRootFiber = createHostRootFiber()
    fiberRoot.current = hostRootFiber
    // stateNode真实的DOM
    hostRootFiber.stateNode = fiberRoot

    initializeUpdateQueue(hostRootFiber)

    return fiberRoot
}