## ReactDOM.render 以及 setState 触发状态更新主流程
本节主要介绍 react 渲染过程中最主要的两个阶段，即：render阶段(render phase) 以及 commit 阶段 (commit phase)，这两个阶段的主流程。

render阶段，通过 setState 或者 ReactDOM.render 触发，主要是调用类组件实例的render方法或者执行函数组件获取子元素并进行协调(reconcile or dom diff)，然后找出有副作用的节点，构建副作用链表。render 阶段的结果是一个副作用链表以及一棵finishedWork树。这个阶段可以是异步的

commit阶段，遍历副作用链表并执行真实的DOM操作，对真实的DOM节点进行增删改移。这个阶段是同步的，一旦开始就不能再中断。


### 主流程源码
```js
// ReactDOM.render入口
function render(element, container, callback){
    return legacyRenderSubtreeIntoContainer(null, element, container, false, callback)
}
// container = document.getElementById('root')
function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
    let root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);    
    // container._reactRootContainer._internalRoot 就是整个fiber tree的容器。里面包含
    // current和finishedWork属性
    let fiberRoot = root._internalRoot;
    updateContainer(children, fiberRoot, parentComponent, callback);
}
function legacyCreateRootFromDOMContainer(container, forceHydrate) {
    return createLegacyRoot(container, undefined);
}

function createLegacyRoot(container, options) {
    return new ReactDOMBlockingRoot(container, LegacyRoot, options);
}
function ReactDOMBlockingRoot(container, tag, options) {
    this._internalRoot = createRootImpl(container, tag, options);
}

function createRootImpl(container, tag, options) {
    // 创建FiberRootNode节点，注意这并不是一个fiber
    const root = createContainer(container, tag, hydrate);
    // 在根容器上注册所有支持的事件监听器，合成事件的入口
    listenToAllSupportedEvents(container);
    return root;
}

// ReactFiberReconciler的入口
function updateContainer(element, container, parentComponent, callback) {
    const update = createUpdate(eventTime, lane);
    update.payload = {
        element: element // 根节点的 update.payload存的是整棵 virtual dom 树
    };
    enqueueUpdate(current, update);
    scheduleUpdateOnFiber(current, lane, eventTime);
}

// ReactFiberWorkLoop的入口
// 从当前调度的fiber开始，向上找到根节点，从根节点开始更新
// 任何触发更新的方法，都需要调用 scheduleUpdateOnFiber 开始调度更新，比如 setState
function scheduleUpdateOnFiber(fiber, lane, eventTime) {
    // 找到容器，从根节点开始更新
    const root = markUpdateLaneFromFiberToRoot(fiber, lane); //返回的是FiberRootNode，即 fiber 树的容器
    performSyncWorkOnRoot(root);
}

function performSyncWorkOnRoot(root) {
    // render阶段的入口
    renderRootSync(root, lanes); 
    // render阶段完成后得到一棵finishedWork tree以及副作用链表(effect list)
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    // commit阶段开始
    commitRoot(root);
}
```