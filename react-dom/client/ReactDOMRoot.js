import { LegacyRoot } from '@react-reconciler/ReactRootTags'
import { createContainer } from '@react-reconciler/ReactFiberReconciler'
import { listenToAllSupportedEvents } from '../events/DOMPluginEventSystem'
function ReactDOMBlockingRoot(container, tag, options) {
    this._internalRoot = createRootImpl(container, tag, options);
}

// 这里的 tag 对应的是 react-reconciler/ReactRootTags.js 中的取值，并不是react-reconciler/ReactWorkTags.js
function createRootImpl(container, tag, options) {
    // Tag is either LegacyRoot or Concurrent Root
    const hydrate = false

    // root 即是 root._reactRootContainer._internalRoot
    const root = createContainer(container, tag, hydrate); // 创建FiberRootNode节点，注意这并不是一个fiber

    // 在根容器上注册所有支持的事件监听器
    listenToAllSupportedEvents(container);

    return root;
}

//root._reactRootContainer是一个ReactDOMBlockingRoot类型 
// root._reactRootContainer._internalRoot是一个FiberRootNode
// root._reactRootContainer._internalRoot.current才是root对应的fiber节点
export const createLegacyRoot = (container, options) => {
    return new ReactDOMBlockingRoot(container, LegacyRoot, options);
}