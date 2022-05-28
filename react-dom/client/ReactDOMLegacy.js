
import { createLegacyRoot } from './ReactDOMRoot'
import { updateContainer } from '@react-reconciler/ReactFiberReconciler.js'

function legacyCreateRootFromDOMContainer(container, forceHydrate) {
    return createLegacyRoot(container, undefined);
}

function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
    let root = container._reactRootContainer;
    let fiberRoot;
    if (!root) {
        // 初次挂载
        // container._reactRootContainer 是 ReactDOMBlockingRoot 类型
        root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);
        // root._internalRoot 是 FiberRootNode 类型
        // root._internalRoot.current 才是 根容器container 对应的fiber节点，同时也是整棵 fiber 树的根节点
        // container._reactRootContainer._internalRoot 是 fiber 树的容器
        fiberRoot = root._internalRoot

        // 源码中，初次挂载是放在 unbatchedUpdates 中执行，因为初次挂载不需要并发渲染
        updateContainer(children, fiberRoot, parentComponent, callback);// 更新容器
    }
}

export const render = (element, container, callback) => {
    return legacyRenderSubtreeIntoContainer(null, element, container, false, callback);
}

