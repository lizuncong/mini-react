import { createHostRootFiber } from './ReactFiber'
export function createFiberRoot(containerInfo){
    const fiberRoot = {
        containerInfo
    }
    // 创建fiber树的根节点
    const hostRootFiber = createHostRootFiber()
    fiberRoot.current = hostRootFiber
    hostRootFiber.stateNode = fiberRoot
}